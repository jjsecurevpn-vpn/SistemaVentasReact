import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useRealtimeSubscription } from "./useRealtimeSubscription";
import { getMonthRange, getTodayString, getLocalDateString } from "./useDateUtils";

export interface DashboardStats {
  total_productos: number;
  total_clientes: number;
  ventas_hoy: number;
  ventas_mes: number;
  ingresos_mes: number;
  gastos_mes: number;
  dinero_fiado_pendiente: number;
  dinero_disponible: number;
  ganancia_hoy: number;
  ganancia_mes: number;
}

export interface ProductoVendido {
  id: number;
  nombre: string;
  precio: number;
  precio_compra: number;
  total_vendido: number;
  total_ingresos: number;
  ganancia: number;
}

export interface ClienteTop {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string | null;
  total_compras_fiadas: number;
  total_comprado: number;
}

export interface DetalleVentaDia {
  id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  precio_compra: number;
  subtotal: number;
  costo_total: number;
  ganancia: number;
  sinPrecioCosto?: boolean;
}

export interface DetallesDelDia {
  productos: DetalleVentaDia[];
  total_ventas: number;
  total_ventas_con_costo: number; // Solo ventas de productos que tienen precio de compra
  total_costo: number;
  total_ganancia: number;
  cantidad_productos_vendidos: number;
  cantidad_ventas: number;
}

export const useDashboard = (mes?: number, año?: number, fechaDia?: string) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>(
    []
  );
  const [clientesTop, setClientesTop] = useState<ClienteTop[]>([]);
  const [detallesDelDia, setDetallesDelDia] = useState<DetallesDelDia | null>(null);
  const [loadingInicial, setLoadingInicial] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      // Solo mostrar loading inicial si es la primera carga
      if (!hasFetchedOnce) {
        setLoadingInicial(true);
      } else {
        setLoadingUpdate(true);
      }
      setError(null);

      const now = new Date();
      const mesActual = mes ?? now.getMonth() + 1;
      const añoActual = año ?? now.getFullYear();

      // Usar hook centralizado para manejo de fechas
      const { start: fechaInicioISO, end: fechaFinISO } = getMonthRange(añoActual, mesActual);
      // Usar fecha seleccionada o hoy por defecto
      const diaSeleccionadoISO = fechaDia || getTodayString();

      // Ejecutar todas las queries principales en paralelo
      // NOTA: Traemos todos los movimientos y filtramos en cliente para manejar correctamente timezone
      const [
        { data: todosMovimientos, error: todosMovError },
        { data: fiadoData },
        { data: productosData },
        { data: clientesData },
      ] = await Promise.all([
        // TODOS los movimientos con fecha para filtrar en cliente
        supabase
          .from("movimientos_caja")
          .select("monto, tipo, fecha, venta_id"),
        // Dinero fiado pendiente
        supabase
          .from("ventas_fiadas")
          .select("ventas(total)")
          .eq("estado", "pendiente"),
        // Total productos
        supabase
          .from("productos")
          .select("id", { count: "exact" }),
        // Total clientes
        supabase
          .from("clientes")
          .select("id", { count: "exact" }),
      ]);

      if (todosMovError) throw todosMovError;

      // Filtrar movimientos por fecha LOCAL (Argentina)
      const movimientosDelMes = (todosMovimientos || []).filter(m => {
        const fechaLocal = getLocalDateString(m.fecha);
        return fechaLocal >= fechaInicioISO && fechaLocal <= fechaFinISO;
      });

      const movimientosDelDia = (todosMovimientos || []).filter(m => {
        const fechaLocal = getLocalDateString(m.fecha);
        return fechaLocal === diaSeleccionadoISO;
      });

      // Calcular ingresos, gastos y ventas del mes
      const ingresosMes = movimientosDelMes
        .filter(m => m.tipo === 'ingreso' || m.tipo === 'pago_fiado')
        .reduce((sum, m) => sum + (m.monto || 0), 0);

      const gastosMes = movimientosDelMes
        .filter(m => m.tipo === 'gasto')
        .reduce((sum, m) => sum + (m.monto || 0), 0);

      // Ventas del día seleccionado (monto en caja)
      const ventasDiaMonto = movimientosDelDia
        .filter(m => m.tipo === 'ingreso' || m.tipo === 'pago_fiado')
        .reduce((sum, m) => sum + (m.monto || 0), 0);

      // Dinero fiado pendiente
      let dineroFiadoPendiente = 0;
      if (fiadoData) {
        dineroFiadoPendiente = fiadoData.reduce((sum: number, f: any) => {
          return sum + (f.ventas?.total || 0);
        }, 0);
      }

      // Dinero disponible: calcular a partir de todos los movimientos
      const dineroDisponibleTotal = (todosMovimientos || []).reduce((sum, m) => {
        if (m.tipo === 'ingreso' || m.tipo === 'pago_fiado') {
          return sum + (m.monto || 0);
        } else if (m.tipo === 'gasto') {
          return sum - (m.monto || 0);
        }
        return sum;
      }, 0);

      // Obtener IDs de ventas pagadas del mes (filtrado por fecha local)
      // Incluir tanto ventas directas (ingreso) como pagos de ventas fiadas (pago_fiado)
      const movimientosIngresoMes = movimientosDelMes
        .filter(m => (m.tipo === 'ingreso' || m.tipo === 'pago_fiado') && m.venta_id);
      
      const movimientosIngresoDia = movimientosDelDia
        .filter(m => (m.tipo === 'ingreso' || m.tipo === 'pago_fiado') && m.venta_id);

      // Procesar productos más vendidos si hay ventas PAGADAS en el mes
      // Solo contamos ventas que impactaron la caja (tipo 'ingreso')
      let productosVendidosFinal: ProductoVendido[] = [];
      let gananciaMes = 0;
      
      // Obtener IDs de ventas pagadas del mes (ya filtrado por fecha local)
      const ventasIdsDelMes = movimientosIngresoMes.map(m => m.venta_id);
      
      if (ventasIdsDelMes.length > 0) {
        // Obtener productos vendidos con precios históricos guardados en venta_productos
        // Usamos precio_unitario y precio_compra de venta_productos (precio al momento de la venta)
        // Si no existen (ventas antiguas), fallback a los precios actuales del producto
        const { data: productosVendidosData, error: productosVendidosError } = await supabase
          .from("venta_productos")
          .select("producto_id, cantidad, subtotal, precio_unitario, precio_compra, productos(id, nombre, precio, precio_compra)")
          .in("venta_id", ventasIdsDelMes);

        if (productosVendidosError) throw productosVendidosError;

        // Agrupar productos en una sola pasada
        const productosMap = new Map<number, any>();
        if (productosVendidosData) {
          for (const item of productosVendidosData) {
            const productoId = item.producto_id;
            const producto = Array.isArray(item.productos) ? item.productos[0] : item.productos;
            
            // Usar precios históricos de venta_productos, fallback a precios actuales del producto
            const precioVentaHistorico = item.precio_unitario || producto?.precio || 0;
            // Para precio de compra: intentar histórico, luego actual del producto
            const precioCompraItem = item.precio_compra || producto?.precio_compra || 0;
            // Si no hay precio de compra, no podemos calcular ganancia para este item
            const tienePrecionCompra = precioCompraItem > 0;
            
            if (!productosMap.has(productoId)) {
              productosMap.set(productoId, {
                cantidad: 0,
                subtotal: 0,
                costoTotal: 0,
                subtotalConCosto: 0, // Solo subtotal de items que tienen precio de compra
                nombre: producto?.nombre,
                precio: precioVentaHistorico,
                precio_compra: precioCompraItem
              });
            }
            const current = productosMap.get(productoId);
            current.cantidad += item.cantidad || 0;
            current.subtotal += item.subtotal || 0;
            // Solo sumar al costo y subtotalConCosto si tiene precio de compra
            if (tienePrecionCompra) {
              current.costoTotal += (precioCompraItem * (item.cantidad || 0));
              current.subtotalConCosto += item.subtotal || 0;
            }
        }
        }

        // Convertir a array y calcular ganancia usando costoTotal acumulado (precios históricos)
        productosVendidosFinal = Array.from(productosMap.entries())
          .map(([id, data]) => {
            // Ganancia = solo de items con precio de compra (subtotalConCosto - costoTotal)
            // Si no tiene precio de compra, ganancia = 0
            const gananciaProducto = data.subtotalConCosto - data.costoTotal;
            return {
              id,
              nombre: data.nombre,
              precio: data.precio,
              precio_compra: data.precio_compra,
              total_vendido: data.cantidad,
              total_ingresos: data.subtotal,
              ganancia: gananciaProducto,
            };
          })
          .sort((a, b) => b.total_vendido - a.total_vendido)
          .slice(0, 10);

        // Calcular ganancia total del mes: solo de items con precio de compra
        gananciaMes = Array.from(productosMap.values()).reduce((sum, data) => {
          return sum + (data.subtotalConCosto - data.costoTotal);
        }, 0);
      }

      // Calcular ganancia del día seleccionado (solo de ventas PAGADAS ese día)
      let gananciaDia = 0;
      const ventasIdsDia = movimientosIngresoDia.map(m => m.venta_id);
      let detallesDelDiaFinal: DetallesDelDia = {
        productos: [],
        total_ventas: 0,
        total_ventas_con_costo: 0,
        total_costo: 0,
        total_ganancia: 0,
        cantidad_productos_vendidos: 0,
        cantidad_ventas: ventasIdsDia.length,
      };
      
      if (ventasIdsDia.length > 0) {
        // Usar precios históricos de venta_productos para ganancia del día
        const { data: productosDiaData } = await supabase
          .from("venta_productos")
          .select("producto_id, cantidad, subtotal, precio_unitario, precio_compra, productos(id, nombre, precio, precio_compra)")
          .in("venta_id", ventasIdsDia);

        if (productosDiaData) {
          // Agrupar productos del día para mostrar detalles
          const productosDiaMap = new Map<number, any>();
          
          for (const item of productosDiaData) {
            const productoId = item.producto_id;
            const producto = Array.isArray(item.productos) ? item.productos[0] : item.productos;
            
            // Usar precios históricos de venta_productos, fallback a precios actuales del producto
            const precioVentaHistorico = item.precio_unitario || producto?.precio || 0;
            // Para precio de compra: intentar histórico, luego actual del producto
            const precioCompraItem = item.precio_compra || producto?.precio_compra || 0;
            // Si no hay precio de compra, no podemos calcular ganancia para este item
            const tienePrecionCompra = precioCompraItem > 0;
            
            if (!productosDiaMap.has(productoId)) {
              productosDiaMap.set(productoId, {
                cantidad: 0,
                subtotal: 0,
                costoTotal: 0,
                subtotalConCosto: 0, // Solo subtotal de items que tienen precio de compra
                nombre: producto?.nombre || 'Producto eliminado',
                precio_unitario: precioVentaHistorico,
                precio_compra: precioCompraItem,
                sinPrecioCosto: false // Flag para indicar si algún item no tiene precio de compra
              });
            }
            const current = productosDiaMap.get(productoId);
            current.cantidad += item.cantidad || 0;
            current.subtotal += item.subtotal || 0;
            // Solo sumar al costo y subtotalConCosto si tiene precio de compra
            if (tienePrecionCompra) {
              current.costoTotal += (precioCompraItem * (item.cantidad || 0));
              current.subtotalConCosto += item.subtotal || 0;
            } else {
              current.sinPrecioCosto = true;
            }
          }

          // Convertir a array de detalles
          const productosDetalles: DetalleVentaDia[] = Array.from(productosDiaMap.entries())
            .map(([id, data]) => ({
              id,
              nombre: data.nombre,
              cantidad: data.cantidad,
              precio_unitario: data.precio_unitario,
              precio_compra: data.precio_compra,
              subtotal: data.subtotal,
              costo_total: data.costoTotal,
              // Ganancia = solo de items con precio de compra (subtotalConCosto - costoTotal)
              ganancia: data.subtotalConCosto - data.costoTotal,
              sinPrecioCosto: data.sinPrecioCosto,
            }))
            .sort((a, b) => b.ganancia - a.ganancia);

          gananciaDia = productosDetalles.reduce((sum, p) => sum + p.ganancia, 0);
          const totalVentas = productosDetalles.reduce((sum, p) => sum + p.subtotal, 0);
          // Ventas solo de productos con costo (para mostrar la fórmula correcta)
          const totalVentasConCosto = productosDetalles
            .filter(p => !p.sinPrecioCosto)
            .reduce((sum, p) => sum + p.subtotal, 0);
          const totalCosto = productosDetalles.reduce((sum, p) => sum + p.costo_total, 0);
          const cantidadProductos = productosDetalles.reduce((sum, p) => sum + p.cantidad, 0);

          detallesDelDiaFinal = {
            productos: productosDetalles,
            total_ventas: totalVentas,
            total_ventas_con_costo: totalVentasConCosto,
            total_costo: totalCosto,
            total_ganancia: gananciaDia,
            cantidad_productos_vendidos: cantidadProductos,
            cantidad_ventas: ventasIdsDia.length,
          };
        }
      }

      // Procesar clientes top (basado en ventas fiadas del mes)
      // Obtenemos las ventas fiadas que se realizaron en el mes seleccionado
      let clientesTopFinal: ClienteTop[] = [];
      
      // Obtener ventas fiadas del mes
      const { data: ventasFiadasMes, error: ventasFiadasMesError } = await supabase
        .from("ventas_fiadas")
        .select("cliente_id, venta_id, ventas(id, total, fecha), clientes(id, nombre, apellido, email)")
        .gte("ventas.fecha", `${fechaInicioISO}T00:00:00`)
        .lte("ventas.fecha", `${fechaFinISO}T23:59:59`);

      if (ventasFiadasMesError) throw ventasFiadasMesError;

      if (ventasFiadasMes && ventasFiadasMes.length > 0) {
        const clientesMap = new Map<number, any>();
        
        for (const item of ventasFiadasMes) {
          const venta = Array.isArray(item.ventas) ? item.ventas[0] : item.ventas;
          const cliente = Array.isArray(item.clientes) ? item.clientes[0] : item.clientes;
          const clienteId = item.cliente_id;
          
          // Solo procesar si la venta tiene datos (el filtro de fecha puede dejar algunos null)
          if (venta && venta.total && cliente) {
            if (!clientesMap.has(clienteId)) {
              clientesMap.set(clienteId, {
                total: 0,
                compras: 0,
                nombre: cliente?.nombre,
                apellido: cliente?.apellido,
                email: cliente?.email
              });
            }
            const current = clientesMap.get(clienteId);
            current.total += venta.total || 0;
            current.compras += 1;
          }
        }

        // Convertir a array y ordenar
        clientesTopFinal = Array.from(clientesMap.entries())
          .map(([id, data]) => ({
            id,
            nombre: data.nombre,
            apellido: data.apellido,
            email: data.email,
            total_compras_fiadas: data.compras,
            total_comprado: data.total,
          }))
          .sort((a, b) => b.total_comprado - a.total_comprado)
          .slice(0, 10);
      }

      setStats({
        total_productos: productosData?.length || 0,
        total_clientes: clientesData?.length || 0,
        ventas_hoy: ventasDiaMonto,
        ventas_mes: ingresosMes,
        ingresos_mes: ingresosMes,
        gastos_mes: gastosMes,
        dinero_fiado_pendiente: dineroFiadoPendiente,
        dinero_disponible: dineroDisponibleTotal,
        ganancia_hoy: gananciaDia,
        ganancia_mes: gananciaMes,
      });
      setProductosVendidos(productosVendidosFinal);
      setClientesTop(clientesTopFinal);
      setDetallesDelDia(detallesDelDiaFinal);
      setHasFetchedOnce(true);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar datos del dashboard"
      );
    } finally {
      setLoadingInicial(false);
      setLoadingUpdate(false);
    }
  }, [mes, año, fechaDia, hasFetchedOnce]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Suscripción en tiempo real solo para cambios relevantes
  const dashboardSubscriptions = useMemo(
    () => [
      { table: "movimientos_caja" },
      { table: "ventas_fiadas" },
    ],
    []
  );

  useRealtimeSubscription("dashboard-realtime", dashboardSubscriptions, () => {
    // Debounce para evitar múltiples recargas
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 500);
    
    return () => clearTimeout(timer);
  });

  return {
    stats,
    productosVendidos,
    clientesTop,
    detallesDelDia,
    loading: loadingInicial,
    loadingUpdate,
    error,
    refetch: fetchDashboardData,
  };
};
