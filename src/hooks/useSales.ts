import { useState, useCallback } from "react";
import type { Product, Promo, SaleProduct } from "../utils/api";
import {
  createSale,
  createSaleProducts,
  updateProductStock,
} from "../utils/api";
import { supabase } from "../lib/supabase";

export type CartItem =
  | {
      type: "product";
      product: Product;
      quantity: number;
      subtotal: number;
    }
  | {
      type: "promo";
      promo: Promo;
      quantity: number;
      subtotal: number;
    };

export const useSales = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToCart = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.type === "product" && item.product.id === product.id
      );

      if (existing && existing.type === "product") {
        return prevCart.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.precio,
              }
            : item
        );
      }

      return [
        ...prevCart,
        { type: "product", product, quantity: 1, subtotal: product.precio },
      ];
    });
  }, []);

  const addPromoToCart = useCallback((promo: Promo) => {
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.type === "promo" && item.promo.id === promo.id
      );

      if (existing && existing.type === "promo") {
        return prevCart.map((item) =>
          item === existing
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * promo.precio_promocional,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          type: "promo",
          promo,
          quantity: 1,
          subtotal: promo.precio_promocional,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const confirmSale = useCallback(
    async (
      clienteId?: number,
      fechaVencimiento?: string,
      notas?: string,
      notasFiado?: string,
      usuarioId?: string,
      metodoPago?: string
    ) => {
      if (cart.length === 0) return;
      setLoading(true);
      setError(null);

      const promosVendidas = cart.filter((item) => item.type === "promo");
      const esVentaPromo = promosVendidas.length > 0;
      const detallePromos = promosVendidas
        .map((item) => `${item.promo.nombre} ×${item.quantity}`)
        .join(", ");

      console.log("confirmSale called with:", {
        clienteId,
        fechaVencimiento,
        notas,
        notasFiado,
        usuarioId,
        cartLength: cart.length
      });

      try {
        // Calculate total
        const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

        // Create sale with notes
        const sale = await createSale(total, notas);

        const saleProducts: Array<Omit<SaleProduct, "id">> = [];
        const stockAdjustments = new Map<number, { product: Product; units: number }>();

        const addStockDelta = (product: Product, units: number) => {
          stockAdjustments.set(product.id, {
            product,
            units: (stockAdjustments.get(product.id)?.units || 0) + units,
          });
        };

        cart.forEach((item) => {
          if (item.type === "product") {
            const subtotalProducto = item.product.precio * item.quantity;
            saleProducts.push({
              venta_id: sale.id,
              producto_id: item.product.id,
              cantidad: item.quantity,
              subtotal: subtotalProducto,
              precio_unitario: item.product.precio,
              precio_compra: item.product.precio_compra || 0,
            });
            addStockDelta(item.product, item.quantity);
            return;
          }

          const promo = item.promo;
          const componentes = promo.promo_productos || [];
          const comboBase = componentes.reduce((sum, comp) => {
            const precio = comp.producto?.precio || 0;
            return sum + precio * comp.cantidad;
          }, 0);
          const totalPromoSubtotal = promo.precio_promocional * item.quantity;
          let subtotalAsignado = 0;

          componentes.forEach((comp, index) => {
            const producto = comp.producto;
            if (!producto) return;

            const unidadesTotales = comp.cantidad * item.quantity;
            const baseSubtotal = (producto.precio || 0) * comp.cantidad * item.quantity;
            let subtotalFinal = comboBase > 0
              ? (baseSubtotal / comboBase) * totalPromoSubtotal
              : totalPromoSubtotal / Math.max(componentes.length, 1);

            if (index === componentes.length - 1) {
              subtotalFinal = totalPromoSubtotal - subtotalAsignado;
            } else {
              subtotalAsignado += subtotalFinal;
            }

            const precioUnitario = unidadesTotales > 0 ? subtotalFinal / unidadesTotales : 0;

            saleProducts.push({
              venta_id: sale.id,
              producto_id: comp.producto_id,
              cantidad: unidadesTotales,
              subtotal: subtotalFinal,
              precio_unitario: Number(precioUnitario.toFixed(2)),
              precio_compra: producto.precio_compra || 0,
            });

            addStockDelta(producto, unidadesTotales);
          });
        });

        await createSaleProducts(saleProducts);

        for (const [productId, { product, units }] of stockAdjustments.entries()) {
          await updateProductStock(productId, product.stock - units);
        }

        // If it's a credit sale, create credit sale record and register as fiado
        if (clienteId) {
          // Insertar venta fiada
          const { data: ventaFiadaData, error: fiadoError } = await supabase
            .from("ventas_fiadas")
            .insert([
              {
                venta_id: sale.id,
                cliente_id: clienteId,
                fecha_vencimiento: fechaVencimiento,
                estado: "pendiente",
                notas: notasFiado,
              },
            ])
            .select();

          if (fiadoError) {
            console.error("Error al insertar venta fiada:", fiadoError);
            throw fiadoError;
          }

          const ventaFiadaId = ventaFiadaData?.[0]?.id;
          console.log("Venta fiada creada con ID:", ventaFiadaId, "para cliente:", clienteId);

          // Register as fiado instead of ingreso
          console.log("Inserting fiado sale movement with usuario_id:", usuarioId);
          const descripcionBase = `Venta al fiado #${ventaFiadaId} - ${cart.length} producto${cart.length !== 1 ? 's' : ''}`;
          const descripcion = esVentaPromo ? `[Promo] ${descripcionBase}` : descripcionBase;
          const notasMovimiento = esVentaPromo
            ? [notasFiado, detallePromos ? `Promos: ${detallePromos}` : null]
                .filter(Boolean)
                .join(" | ") || null
            : notasFiado || null;

          const movimientoData = {
            tipo: "fiado",
            descripcion,
            monto: total,
            categoria: esVentaPromo ? "ventas_promos" : "ventas_fiadas",
            notas: notasMovimiento,
            usuario_id: usuarioId,
            cliente_id: clienteId,
            venta_id: sale.id,
          };

          console.log(
            "Intentando insertar movimiento de caja con datos:",
            movimientoData
          );

          const { error: cajaError } = await supabase
            .from("movimientos_caja")
            .insert([movimientoData]);

          if (cajaError) {
            console.error("Error al insertar movimiento de caja:", cajaError);
            console.error("Datos enviados:", movimientoData);
            console.error("Detalles del error:", {
              message: cajaError.message,
              details: cajaError.details,
              hint: cajaError.hint,
              code: cajaError.code,
            });
            throw new Error(
              `Error al registrar movimiento de caja: ${
                cajaError.message || "Error desconocido"
              }`
            );
          }
        } else {
          // Register income in cash register for regular sales
          console.log("Inserting regular sale movement with usuario_id:", usuarioId);
          const descripcionBase = `Venta #${sale.id} - ${cart.length} producto${cart.length !== 1 ? 's' : ''}`;
          const descripcion = esVentaPromo ? `[Promo] ${descripcionBase}` : descripcionBase;
          const notasMovimiento = esVentaPromo
            ? [notas, detallePromos ? `Promos: ${detallePromos}` : null]
                .filter(Boolean)
                .join(" | ") || null
            : notas || null;
          const movimientoData = {
            tipo: "ingreso",
            descripcion,
            monto: total,
            categoria: esVentaPromo ? "ventas_promos" : "ventas",
            notas: notasMovimiento,
            usuario_id: usuarioId,
            metodo_pago: metodoPago?.trim() || "efectivo",
            venta_id: sale.id,
          };

          console.log("Movimiento data:", movimientoData);

          await supabase.from("movimientos_caja").insert([movimientoData]);
        }

        if (promosVendidas.length) {
          await Promise.all(
            promosVendidas.map((item) =>
              supabase
                .from("promos")
                .update({
                  usos_registrados: (item.promo.usos_registrados || 0) + item.quantity,
                })
                .eq("id", item.promo.id)
            )
          );
        }

        clearCart();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al confirmar venta"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cart, clearCart]
  );

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    cart,
    total,
    loading,
    error,
    addToCart,
    addPromoToCart,
    removeFromCart,
    clearCart,
    confirmSale,
    clearError: () => setError(null),
  };
};
