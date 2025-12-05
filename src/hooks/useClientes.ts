import { useState, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useRealtimeSubscription } from "./useRealtimeSubscription";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

export interface Cliente {
  id: number;
  nombre: string;
  apellido?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  fecha_registro: string;
  notas?: string;
  deuda?: number;
}

export interface VentaFiada {
  id: number;
  venta_id: number;
  cliente_id: number;
  fecha_vencimiento?: string;
  estado: "pendiente" | "pagada" | "vencida";
  notas?: string;
  venta: {
    id: number;
    fecha: string;
    total: number;
    venta_productos: Array<{
      cantidad: number;
      subtotal: number;
      productos: { nombre: string };
    }>;
  };
}

export interface PagoFiado {
  id: number;
  venta_fiada_id: number;
  monto: number;
  fecha_pago: string;
  metodo_pago?: string;
  notas?: string;
  ventas_fiadas?: {
    cliente_id: number;
    venta?: {
      id: number;
      fecha: string;
      total: number;
      venta_productos?: Array<{
        cantidad: number;
        subtotal: number;
        productos: { nombre: string };
      }>;
    } | null;
  };
}

type ClienteConVentas = Cliente & {
  ventas_fiadas?: Array<{
    estado: "pendiente" | "pagada" | "vencida";
    venta?: { total?: number | null } | null;
  }>;
};

type VentaFiadaBasica = {
  id: number;
  cliente_id: number;
  venta_id: number | null;
};

type VentaResumen = {
  id: number;
  total: number | null;
};

type PagoFiadoResumen = {
  venta_fiada_id: number;
  monto: number | null;
};

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("clientes")
        .select(
          `
          *,
          ventas_fiadas (
            estado,
            venta:ventas (
              total
            )
          )
        `
        )
        .order("nombre");

      if (error) throw error;

      const clientesFiltrados = ((data ?? []) as ClienteConVentas[]).map(
        (cliente) => {
          const deudaPendiente =
            cliente.ventas_fiadas
              ?.filter((vf) => vf.estado === "pendiente")
              .reduce(
                (sum, vf) => sum + (vf.venta?.total ?? 0),
                0
              ) ?? 0;

          return {
            ...(cliente as Cliente),
            deuda: deudaPendiente,
          } as Cliente;
        }
      );

      setClientes(clientesFiltrados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarCliente = useCallback(
    async (cliente: Omit<Cliente, "id" | "fecha_registro">) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("clientes")
          .insert([cliente])
          .select()
          .single();

        if (error) throw error;

        setClientes((prev) => [...prev, data]);
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al agregar cliente"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const editarCliente = useCallback(
    async (
      id: number,
      cliente: Partial<Omit<Cliente, "id" | "fecha_registro">>
    ) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("clientes")
          .update(cliente)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        setClientes((prev) => prev.map((c) => (c.id === id ? data : c)));
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al editar cliente"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const eliminarCliente = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("clientes").delete().eq("id", id);

      if (error) throw error;

      setClientes((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al eliminar cliente"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarDeudasCliente = useCallback(async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from("ventas_fiadas")
        .select(
          `
          *,
          venta:ventas (
            id,
            fecha,
            total,
            venta_productos (
              cantidad,
              subtotal,
              productos (
                nombre
              )
            )
          )
        `
        )
        .eq("cliente_id", clienteId)
        .eq("estado", "pendiente");

      if (error) throw error;

      // Filtrar solo deudas donde el cliente aún existe (por si hay datos huérfanos)
      const validDeudas = (data || []).filter(
        (deuda) => deuda.cliente_id === clienteId
      );

      return validDeudas;
    } catch (err) {
      console.error("Error al cargar deudas:", err);
      return [];
    }
  }, []);

  const cargarPagosCliente = useCallback(async (clienteId: number) => {
    try {
      const { data, error } = await supabase
        .from("pagos_fiados")
        .select(
          `
          *,
          ventas_fiadas!inner (
            cliente_id,
            venta:ventas (
              id,
              fecha,
              total,
              venta_productos (
                cantidad,
                subtotal,
                productos (
                  nombre
                )
              )
            )
          )
        `
        )
        .eq("ventas_fiadas.cliente_id", clienteId)
        .order("fecha_pago", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error("Error al cargar pagos:", err);
      return [];
    }
  }, []);

  const registrarPago = useCallback(
    async (
      pagos: { ventaFiadaId: number; monto: number }[],
      metodoPago?: string,
      notas?: string
    ): Promise<void> => {
      if (!pagos.length) {
        throw new Error("No hay pagos seleccionados");
      }

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const pagoRecords = pagos.map((pago) => ({
          venta_fiada_id: pago.ventaFiadaId,
          monto: pago.monto,
          metodo_pago: metodoPago,
          notas,
          usuario_id: user?.id,
        }));

        const { error: pagoError } = await supabase
          .from("pagos_fiados")
          .insert(pagoRecords);

        if (pagoError) throw pagoError;

        const ventaFiadaIds = pagos.map((p) => p.ventaFiadaId);
        const { data: ventasFiadasInfo, error: vfError } = await supabase
          .from("ventas_fiadas")
          .select("id, cliente_id, venta_id")
          .in("id", ventaFiadaIds);

        if (vfError) throw vfError;

        const ventasFiadas = (ventasFiadasInfo ?? []) as VentaFiadaBasica[];

        const clienteIds = new Set(ventasFiadas.map((vf) => vf.cliente_id));
        if (clienteIds.size > 1) {
          throw new Error(
            "Los pagos seleccionados pertenecen a distintos clientes"
          );
        }

        const clienteId = ventasFiadas[0]?.cliente_id ?? null;

        const detallePago = pagos
          .map(
            (p) => `#${p.ventaFiadaId}: ${currencyFormatter.format(p.monto)}`
          )
          .join(" | ");

        const notasMovimiento = [
          metodoPago ? `Método: ${metodoPago}` : null,
          notas,
          detallePago ? `Detalle: ${detallePago}` : null,
        ]
          .filter(Boolean)
          .join(" | ");

        // Crear un movimiento por cada venta pagada para poder calcular ganancias correctamente
        // Cada movimiento incluye el venta_id correspondiente
        const movimientosAInsertar = pagos.map((pago) => {
          const ventaFiada = ventasFiadas.find((vf) => vf.id === pago.ventaFiadaId);
          return {
            tipo: "pago_fiado",
            descripcion: `Pago de deuda #${pago.ventaFiadaId}`,
            monto: pago.monto,
            categoria: "pagos_fiados",
            notas: notasMovimiento || null,
            cliente_id: clienteId,
            usuario_id: user?.id,
            metodo_pago: metodoPago,
            venta_id: ventaFiada?.venta_id || null,
          };
        });

        const { error: movimientoError } = await supabase
          .from("movimientos_caja")
          .insert(movimientosAInsertar);

        if (movimientoError) throw movimientoError;

        try {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("reload-caja-movimientos"));
          }, 1000);
        } catch (reloadError) {
          console.warn("Error al enviar evento de recarga:", reloadError);
        }

        try {
          const ventaIds = ventasFiadas
            .map((vf) => vf.venta_id)
            .filter((id): id is number => typeof id === "number");

          let ventasMap = new Map<number, number>();
          if (ventaIds.length) {
            const { data: ventasData, error: ventasError } = await supabase
              .from("ventas")
              .select("id, total")
              .in("id", ventaIds);

            if (ventasError) throw ventasError;

            ventasMap = new Map(
              ((ventasData ?? []) as VentaResumen[]).map((venta) => [
                venta.id,
                venta.total ?? 0,
              ])
            );
          }

          const { data: pagosData, error: pagosError } = await supabase
            .from("pagos_fiados")
            .select("venta_fiada_id, monto")
            .in("venta_fiada_id", ventaFiadaIds);

          if (pagosError) throw pagosError;

          const pagosPorDeuda = new Map<number, number>();
          ((pagosData ?? []) as PagoFiadoResumen[]).forEach((pago) => {
            pagosPorDeuda.set(
              pago.venta_fiada_id,
              (pagosPorDeuda.get(pago.venta_fiada_id) || 0) + (pago.monto ?? 0)
            );
          });

          const deudasSaldadas = ventasFiadas
            .filter((vf) => {
              const ventaId = vf.venta_id;
              if (!ventaId) return false;
              const totalVenta = ventasMap.get(ventaId) || 0;
              const totalPagado = pagosPorDeuda.get(vf.id) || 0;
              return totalPagado >= totalVenta && totalVenta > 0;
            })
            .map((vf) => vf.id);

          if (deudasSaldadas.length) {
            await supabase
              .from("ventas_fiadas")
              .update({ estado: "pagada" })
              .in("id", deudasSaldadas);
          }
        } catch (innerErr) {
          console.error(
            "Error al verificar estado de deuda después del pago:",
            innerErr
          );
        }

      } catch (err) {
        console.error("Error al registrar pago:", err);
        throw err;
      }
    },
    []
  );

  const crearVentaFiada = useCallback(
    async (
      ventaId: number,
      clienteId: number,
      fechaVencimiento?: string,
      notas?: string
    ) => {
      try {
        const { data, error } = await supabase
          .from("ventas_fiadas")
          .insert([
            {
              venta_id: ventaId,
              cliente_id: clienteId,
              fecha_vencimiento: fechaVencimiento,
              estado: "pendiente",
              notas,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (err) {
        console.error("Error al crear venta al fiado:", err);
        throw err;
      }
    },
    []
  );

  const clienteSubscriptions = useMemo(
    () => [
      { table: "clientes" },
      { table: "ventas_fiadas" },
      { table: "pagos_fiados" },
    ],
    []
  );

  useRealtimeSubscription("clientes-realtime", clienteSubscriptions, () => {
    cargarClientes();
  });

  return {
    clientes,
    loading,
    error,
    cargarClientes,
    agregarCliente,
    editarCliente,
    eliminarCliente,
    cargarDeudasCliente,
    cargarPagosCliente,
    registrarPago,
    crearVentaFiada,
  };
};
