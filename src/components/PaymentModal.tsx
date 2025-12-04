import React, { useMemo, useState } from "react";
import Modal from "./Modal";
import type { VentaFiada } from "../hooks/useClientes";
import { formatCurrency } from "../utils/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deudas: VentaFiada[];
  registrarPago: (
    pagos: { ventaFiadaId: number; monto: number }[],
    metodoPago?: string,
    notas?: string
  ) => Promise<void>;
  onPaid?: () => void;
}

type Item = {
  id: string;
  ventaFiadaId: number;
  ventaId: number;
  productoNombre: string;
  cantidad: number;
  subtotal: number;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  deudas,
  registrarPago,
  onPaid,
}) => {
  const items: Item[] = useMemo(() => {
    const out: Item[] = [];
    deudas.forEach((d) => {
      d.venta.venta_productos.forEach((vp, idx) => {
        out.push({
          id: `${d.id}-${idx}`,
          ventaFiadaId: d.id,
          ventaId: d.venta.id,
          productoNombre: vp.productos.nombre,
          cantidad: vp.cantidad,
          subtotal: vp.subtotal,
        });
      });
    });
    return out;
  }, [deudas]);

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const allSelected =
    items.length > 0 && items.every((it) => !!selected[it.id]);

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const map: Record<string, boolean> = {};
      items.forEach((it) => (map[it.id] = true));
      setSelected(map);
    }
  };

  const toggle = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const selectedItems = items.filter((it) => selected[it.id]);
  const total = selectedItems.reduce((s, it) => s + it.subtotal, 0);

  const groupedByVenta = useMemo(() => {
    const map = new Map<number, number>();
    selectedItems.forEach((it) => {
      map.set(it.ventaFiadaId, (map.get(it.ventaFiadaId) || 0) + it.subtotal);
    });
    return map;
  }, [selectedItems]);

  const pagosSeleccionados = useMemo(
    () =>
      Array.from(groupedByVenta.entries()).map(([ventaFiadaId, monto]) => ({
        ventaFiadaId,
        monto,
      })),
    [groupedByVenta]
  );

  const handlePay = async () => {
    if (total <= 0 || pagosSeleccionados.length === 0) return;
    setLoading(true);
    try {
      await registrarPago(
        pagosSeleccionados,
        method || undefined,
        notes || undefined
      );
      if (onPaid) onPaid();
      onClose();
    } catch (err) {
      console.error("Error al pagar seleccionados:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago" size="lg">
      <div className="space-y-4">
        {/* Header */}
        <div className="pb-3 border-b border-neutral-800/50">
          <p className="text-xs text-neutral-500">
            Selecciona los productos que deseas pagar
          </p>
        </div>

        {/* Lista de productos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
              Productos ({items.length})
            </span>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-[10px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {allSelected ? "Limpiar" : "Seleccionar todo"}
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-8 text-neutral-600 text-sm">
                No hay productos adeudados
              </div>
            ) : (
              items.map((it) => (
                <label
                  key={it.id}
                  className={`
                    flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer
                    ${
                      selected[it.id]
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : "bg-neutral-900/40 border-neutral-800/50 hover:border-neutral-700/50"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={!!selected[it.id]}
                    onChange={() => toggle(it.id)}
                    className="mt-0.5 w-4 h-4 rounded border-neutral-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 bg-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-sm text-white truncate">
                        {it.productoNombre}
                      </span>
                      <span className="text-sm font-medium text-white whitespace-nowrap">
                        {formatCurrency(it.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                      <span>Venta #{it.ventaId}</span>
                      <span>•</span>
                      <span>×{it.cantidad}</span>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Detalles del pago */}
        <div className="space-y-3 pt-3 border-t border-neutral-800/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                Método de pago
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 transition-colors"
              >
                <option value="">Seleccionar</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                Notas
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 px-4 bg-neutral-900/40 rounded-xl border border-neutral-800/50">
            <span className="text-xs text-neutral-500">Total a pagar</span>
            <span className="text-xl font-semibold text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={total <= 0 || loading}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
          >
            {loading ? "Procesando..." : "Confirmar Pago"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentModal;
