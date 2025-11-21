import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

export interface DashboardStats {
  total_productos: number;
  total_clientes: number;
  ventas_hoy: number;
  ventas_mes: number;
  ingresos_mes: number;
  gastos_mes: number;
  dinero_fiado_pendiente: number;
  dinero_disponible: number;
}

export interface ProductoVendido {
  id: number;
  nombre: string;
  precio: number;
  total_vendido: number;
  total_ingresos: number;
}

export interface ClienteTop {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string | null;
  total_compras_fiadas: number;
  total_comprado: number;
}

export const useDashboard = (mes?: number, año?: number) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>(
    []
  );
  const [clientesTop, setClientesTop] = useState<ClienteTop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const mesActual = mes ?? now.getMonth() + 1;
      const añoActual = año ?? now.getFullYear();

      // Calcular rango de fechas
      const fechaInicio = new Date(añoActual, mesActual - 1, 1);
      const fechaFin = new Date(añoActual, mesActual, 0, 23, 59, 59);

      const fechaInicioISO = fechaInicio.toISOString().split('T')[0];
      const fechaFinISO = fechaFin.toISOString().split('T')[0];
      const hoyISO = new Date().toISOString().split('T')[0];

      // Ejecutar todas las queries principales en paralelo
      const [
        { data: todosMovimientos, error: todosMovError },
        { data: ventasHoyData },
        { data: fiadoData },
        { data: productosData },
        { data: clientesData },
        { data: ventasDelMes, error: ventasDelMesError },
        { data: todosMovimientosTotal }
      ] = await Promise.all([
        // Movimientos del mes
        supabase
          .from("movimientos_caja")
          .select("monto, tipo")
          .gte("fecha", `${fechaInicioISO}T00:00:00`)
          .lte("fecha", `${fechaFinISO}T23:59:59`),
        // Ventas de hoy
        supabase
          .from("movimientos_caja")
          .select("monto")
          .in("tipo", ["ingreso", "pago_fiado"])
          .gte("fecha", `${hoyISO}T00:00:00`)
          .lte("fecha", `${hoyISO}T23:59:59`),
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
        // Ventas del mes (una sola query)
        supabase
          .from("ventas")
          .select("id")
          .gte("fecha", `${fechaInicioISO}T00:00:00`)
          .lte("fecha", `${fechaFinISO}T23:59:59`),
        // TODOS los movimientos para dinero disponible total
        supabase
          .from("movimientos_caja")
          .select("monto, tipo")
      ]);

      if (todosMovError) throw todosMovError;
      if (ventasDelMesError) throw ventasDelMesError;

      // Calcular ingresos, gastos y ventas del mes
      const ingresosMes = (todosMovimientos || [])
        .filter(m => m.tipo === 'ingreso' || m.tipo === 'pago_fiado')
        .reduce((sum, m) => sum + (m.monto || 0), 0);

      const gastosMes = (todosMovimientos || [])
        .filter(m => m.tipo === 'gasto')
        .reduce((sum, m) => sum + (m.monto || 0), 0);

      // Ventas hoy
      let ventasHoy = 0;
      if (ventasHoyData) {
        ventasHoy = ventasHoyData.reduce((sum, v) => sum + (v.monto || 0), 0);
      }

      // Dinero fiado pendiente
      let dineroFiadoPendiente = 0;
      if (fiadoData) {
        dineroFiadoPendiente = fiadoData.reduce((sum: number, f: any) => {
          return sum + (f.ventas?.total || 0);
        }, 0);
      }

      // Dinero disponible: calcular a partir de todos los movimientos
      let dineroDisponibleTotal = 0;
      if (todosMovimientosTotal) {
        dineroDisponibleTotal = todosMovimientosTotal.reduce((sum, m) => {
          if (m.tipo === 'ingreso' || m.tipo === 'pago_fiado') {
            return sum + (m.monto || 0);
          } else if (m.tipo === 'gasto') {
            return sum - (m.monto || 0);
          }
          return sum;
        }, 0);
      }

      // Procesar productos más vendidos si hay ventas en el mes
      let productosVendidosFinal: ProductoVendido[] = [];
      
      if (ventasDelMes && ventasDelMes.length > 0) {
        const ventasIds = ventasDelMes.map(v => v.id);

        // Obtener productos vendidos con JOIN para evitar múltiples queries
        const { data: productosVendidosData, error: productosVendidosError } = await supabase
          .from("venta_productos")
          .select("producto_id, cantidad, subtotal, productos(id, nombre, precio)")
          .in("venta_id", ventasIds);

        if (productosVendidosError) throw productosVendidosError;

        // Agrupar productos en una sola pasada
        const productosMap = new Map<number, any>();
        if (productosVendidosData) {
          for (const item of productosVendidosData) {
            const productoId = item.producto_id;
            const producto = Array.isArray(item.productos) ? item.productos[0] : item.productos;
            if (!productosMap.has(productoId)) {
              productosMap.set(productoId, {
                cantidad: 0,
                subtotal: 0,
                nombre: producto?.nombre,
                precio: producto?.precio
              });
            }
            const current = productosMap.get(productoId);
            current.cantidad += item.cantidad || 0;
            current.subtotal += item.subtotal || 0;
          }
        }

        // Convertir a array y ordenar
        productosVendidosFinal = Array.from(productosMap.entries())
          .map(([id, data]) => ({
            id,
            nombre: data.nombre,
            precio: data.precio,
            total_vendido: data.cantidad,
            total_ingresos: data.subtotal,
          }))
          .sort((a, b) => b.total_vendido - a.total_vendido)
          .slice(0, 10);
      }

      // Procesar clientes top
      let clientesTopFinal: ClienteTop[] = [];
      
      if (ventasDelMes && ventasDelMes.length > 0) {
        const ventasIds = ventasDelMes.map(v => v.id);
        
        // Obtener ventas fiadas con JOIN para evitar múltiples queries
        const { data: ventasConClientes, error: ventasConClientesError } = await supabase
          .from("ventas_fiadas")
          .select("cliente_id, ventas(total), clientes(id, nombre, apellido, email)")
          .in("venta_id", ventasIds);

        if (ventasConClientesError) throw ventasConClientesError;

        if (ventasConClientes && ventasConClientes.length > 0) {
          const clientesMap = new Map<number, any>();
          
          for (const item of ventasConClientes) {
            const venta = Array.isArray(item.ventas) ? item.ventas[0] : item.ventas;
            const cliente = Array.isArray(item.clientes) ? item.clientes[0] : item.clientes;
            const clienteId = item.cliente_id;
            
            if (venta && venta.total) {
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
      }

      setStats({
        total_productos: productosData?.length || 0,
        total_clientes: clientesData?.length || 0,
        ventas_hoy: ventasHoy,
        ventas_mes: ingresosMes,
        ingresos_mes: ingresosMes,
        gastos_mes: gastosMes,
        dinero_fiado_pendiente: dineroFiadoPendiente,
        dinero_disponible: dineroDisponibleTotal,
      });
      setProductosVendidos(productosVendidosFinal);
      setClientesTop(clientesTopFinal);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar datos del dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, [mes, año]);

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
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
