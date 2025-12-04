import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts";
import { useSales } from "../../hooks/useSales";
import { useClientes } from "../../hooks/useClientes";
import { useNotification } from "../../hooks/useNotification";
import { useAuth } from "../../hooks/useAuth";
import Notification from "../../components/Notification";
import SaleConfirmationModal from "../../components/SaleConfirmationModal";
import { ProductSearchGrid, CartSidebar, MobileCartSummary } from "./components";
import type { Cliente } from "../../hooks/useClientes";
import { CreditCard } from "lucide-react";
import { usePromos } from "../../hooks/usePromos";
import type { Promo } from "../../utils/api";

const POS: React.FC = () => {
  const [search, setSearch] = useState("");
  const [ventaAlFiado, setVentaAlFiado] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] =
    useState<Cliente | null>(null);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [ventaNotas, setVentaNotas] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [searchCliente, setSearchCliente] = useState("");
  const [showSaleConfirmation, setShowSaleConfirmation] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<{
    cart: any[];
    total: number;
    isCreditSale: boolean;
    clientName?: string;
  } | null>(null);
  const {
    products,
    loading: productsLoading,
    error: productsError,
    allProducts,
    refreshProducts,
  } = useProducts();
  const {
    cart,
    total,
    loading: saleLoading,
    error: saleError,
    addToCart,
    addPromoToCart,
    removeFromCart,
    confirmSale,
  } = useSales();
  const { clientes, cargarClientes } = useClientes();
  const { notification, showError, hideNotification } = useNotification();
  const { user } = useAuth();
  const {
    promos,
    loading: promosLoading,
    error: promosError,
  } = usePromos();

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  const filteredClientes = clientes.filter((c) =>
    `${c.nombre} ${c.apellido || ""} ${c.telefono || ""} ${c.email || ""}`
      .toLowerCase()
      .includes(searchCliente.toLowerCase())
  );

  const handleVentaAlFiadoChange = (value: boolean) => {
    setVentaAlFiado(value);
    if (!value) {
      setClienteSeleccionado(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();

  // If search has text, search across all products (global). Otherwise use current page products.
  const sourceForPOS = normalizedSearch !== "" ? allProducts ?? products : products;
  const filteredProducts = sourceForPOS.filter(
    (p) =>
      p.nombre.toLowerCase().includes(normalizedSearch) ||
      p.descripcion?.toLowerCase().includes(normalizedSearch)
  );

  const productStockMap = React.useMemo(() => {
    const base = allProducts ?? products;
    return new Map(base.map((product) => [product.id, product]));
  }, [allProducts, products]);

  const getUnitsInCart = React.useCallback(
    (productId: number) => {
      return cart.reduce((sum, item) => {
        if (item.type === "product" && item.product.id === productId) {
          return sum + item.quantity;
        }
        if (item.type === "promo") {
          const unitsFromPromo =
            item.promo.promo_productos?.reduce((acc, comp) => {
              if (comp.producto_id === productId) {
                return acc + comp.cantidad * item.quantity;
              }
              return acc;
            }, 0) || 0;
          return sum + unitsFromPromo;
        }
        return sum;
      }, 0);
    },
    [cart]
  );

  const getRemainingStock = React.useCallback(
    (productId: number) => {
      const product = productStockMap.get(productId);
      const stock = product?.stock ?? 0;
      return Math.max(0, stock - getUnitsInCart(productId));
    },
    [productStockMap, getUnitsInCart]
  );

  const promoWithinRange = (promo: Promo) => {
    const today = new Date().toISOString().slice(0, 10);
    if (promo.fecha_inicio && promo.fecha_inicio > today) return false;
    if (promo.fecha_fin && promo.fecha_fin < today) return false;
    if (promo.limite_uso && (promo.usos_registrados || 0) >= promo.limite_uso) return false;
    return true;
  };

  const activePromos = promos.filter((promo) => promo.activo && promoWithinRange(promo));

  const filteredPromos = normalizedSearch
    ? activePromos.filter((promo) => {
        const text = `${promo.nombre} ${promo.descripcion || ""}`.toLowerCase();
        return text.includes(normalizedSearch);
      })
    : [];

  const getPromoAvailability = React.useCallback(
    (promo: Promo) => {
      if (!promo.promo_productos || promo.promo_productos.length === 0) return 0;
      const combos = promo.promo_productos.map((item) => {
        if (!item.cantidad) return 0;
        const remaining = getRemainingStock(item.producto_id);
        return Math.floor(remaining / item.cantidad);
      });
      const byStock = Math.max(0, Math.min(...combos));
      if (!promo.limite_uso) return byStock;
      const usosDisponibles = promo.limite_uso - (promo.usos_registrados || 0);
      return Math.max(0, Math.min(byStock, usosDisponibles));
    },
    [getRemainingStock]
  );

  const handleAddPromo = (promo: Promo) => {
    if (getPromoAvailability(promo) <= 0) {
      showError("No hay stock suficiente para esta promo");
      return;
    }
    addPromoToCart(promo);
  };

  const handleConfirmSale = async () => {
    try {
      if (!user) {
        showError("Usuario no autenticado. Por favor, inicia sesión.");
        return;
      }

      if (ventaAlFiado && !clienteSeleccionado) {
        showError("Debe seleccionar un cliente para la venta al fiado");
        return;
      }

      const notasVenta = ventaNotas || undefined;
      const notasFiado =
        ventaAlFiado && clienteSeleccionado
          ? `${ventaNotas ? ventaNotas + " - " : ""}Venta al fiado a ${
              clienteSeleccionado.nombre
            } ${clienteSeleccionado.apellido || ""}`
          : undefined;

      console.log("POS: Confirming sale with user:", user?.id);

      await confirmSale(
        ventaAlFiado ? clienteSeleccionado?.id : undefined,
        undefined,
        notasVenta,
        notasFiado,
        user?.id,
        metodoPago
      );

      // Guardar datos de la venta para el modal de confirmación
      setLastSaleData({
        cart: [...cart], // Copia del carrito actual
        total: total,
        isCreditSale: ventaAlFiado,
        clientName:
          ventaAlFiado && clienteSeleccionado
            ? `${clienteSeleccionado.nombre} ${
                clienteSeleccionado.apellido || ""
              }`.trim()
            : undefined,
      });

      setVentaNotas("");
      setVentaAlFiado(false);
      setClienteSeleccionado(null);
      setMetodoPago("efectivo");

      await refreshProducts();

      // Mostrar modal de confirmación en lugar de notificación simple
      setShowSaleConfirmation(true);
    } catch (error) {
      console.error("Error confirming sale:", error);
      showError(
        `Error al confirmar la venta: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  };

  return (
    <div className="h-full bg-[#0a0a0a] flex flex-col">
      {/* Error Messages */}
      {(productsError || saleError || promosError) && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 w-11/12 md:w-auto">
          <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
            {productsError || saleError || promosError}
          </div>
        </div>
      )}

      {/* Main Content - Products and Cart Side by Side */}
      <div className="flex-1 flex overflow-hidden">
        <ProductSearchGrid
          search={search}
          onSearchChange={setSearch}
          productsLoading={productsLoading}
           promosLoading={promosLoading}
          filteredProducts={filteredProducts}
          onAddToCart={addToCart}
          filteredPromos={filteredPromos}
          onAddPromo={handleAddPromo}
          getRemainingStock={getRemainingStock}
          getUnitsInCart={getUnitsInCart}
          getPromoAvailability={getPromoAvailability}
        />

        <CartSidebar
          cart={cart}
          total={total}
          ventaAlFiado={ventaAlFiado}
          onVentaAlFiadoChange={handleVentaAlFiadoChange}
          onRemoveItem={removeFromCart}
          clienteSeleccionado={clienteSeleccionado}
          onOpenClienteModal={() => setClienteDropdownOpen(true)}
          ventaNotas={ventaNotas}
          onNotasChange={setVentaNotas}
          metodoPago={metodoPago}
          onMetodoPagoChange={setMetodoPago}
          onConfirmSale={handleConfirmSale}
          saleLoading={saleLoading}
        />
      </div>

      <MobileCartSummary
        cart={cart}
        total={total}
        ventaAlFiado={ventaAlFiado}
        onVentaAlFiadoChange={handleVentaAlFiadoChange}
        onRemoveItem={removeFromCart}
        clienteSeleccionado={clienteSeleccionado}
        onOpenClienteModal={() => setClienteDropdownOpen(true)}
        metodoPago={metodoPago}
        onMetodoPagoChange={setMetodoPago}
        ventaNotas={ventaNotas}
        onNotasChange={setVentaNotas}
        saleLoading={saleLoading}
        onConfirmSale={handleConfirmSale}
      />

      {/* Modal de selección de cliente */}
      {clienteDropdownOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setClienteDropdownOpen(false);
            setSearchCliente("");
          }}
        >
          <div
            className="bg-[#111111] border border-neutral-800/50 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-800/50">
              <h3 className="text-sm font-medium text-white mb-3">
                Seleccionar Cliente
              </h3>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchCliente}
                onChange={(e) => setSearchCliente(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white rounded-lg text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredClientes.length === 0 ? (
                <div className="px-4 py-12 text-center text-neutral-500 text-sm">
                  <CreditCard className="mx-auto mb-2 opacity-30" size={24} />
                  <p className="text-xs">{clientes.length === 0
                    ? "No hay clientes registrados"
                    : "No se encontraron clientes"}</p>
                </div>
              ) : (
                filteredClientes.map((cliente) => (
                  <button
                    key={cliente.id}
                    onClick={() => {
                      setClienteSeleccionado(cliente);
                      setClienteDropdownOpen(false);
                      setSearchCliente("");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800/30 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-neutral-400 text-xs font-medium">
                          {cliente.nombre.charAt(0)}
                          {cliente.apellido?.charAt(0) || ""}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">
                          {cliente.nombre} {cliente.apellido || ""}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {cliente.telefono || cliente.email || ""}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <Notification notification={notification} onClose={hideNotification} />
      <SaleConfirmationModal
        isOpen={showSaleConfirmation}
        onClose={() => {
          setShowSaleConfirmation(false);
          setLastSaleData(null);
        }}
        cart={lastSaleData?.cart || []}
        total={lastSaleData?.total || 0}
        isCreditSale={lastSaleData?.isCreditSale || false}
        clientName={lastSaleData?.clientName}
      />
    </div>
  );
};

export default POS;
