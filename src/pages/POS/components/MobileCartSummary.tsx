import React from "react";
import { ShoppingCart, Banknote, CreditCard, ChevronDown, X } from "lucide-react";
import type { CartItem } from "../../../hooks/useSales";
import type { Cliente } from "../../../hooks/useClientes";

interface MobileCartSummaryProps {
  cart: CartItem[];
  total: number;
  ventaAlFiado: boolean;
  onVentaAlFiadoChange: (value: boolean) => void;
  onRemoveItem: (index: number) => void;
  clienteSeleccionado: Cliente | null;
  onOpenClienteModal: () => void;
  metodoPago: string;
  onMetodoPagoChange: (value: string) => void;
  ventaNotas: string;
  onNotasChange: (value: string) => void;
  saleLoading: boolean;
  onConfirmSale: () => void;
}

const MobileCartSummary: React.FC<MobileCartSummaryProps> = ({
  cart,
  total,
  ventaAlFiado,
  onVentaAlFiadoChange,
  onRemoveItem,
  clienteSeleccionado,
  onOpenClienteModal,
  metodoPago,
  onMetodoPagoChange,
  ventaNotas,
  onNotasChange,
  saleLoading,
  onConfirmSale,
}) => (
  <>
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 z-20 max-h-[60vh] flex flex-col">
      {cart.length > 0 && (
        <div className="overflow-auto max-h-48 border-b border-neutral-800">
          <div className="p-3 space-y-2">
            {cart.map((item, index) => (
              <div key={index} className="bg-[#181818] border border-neutral-800 rounded-lg p-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    {item.type === "promo" && (
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border border-emerald-600/40 bg-emerald-600/10 text-emerald-300 mb-0.5">
                        Promo
                      </span>
                    )}
                    <p className="font-medium text-neutral-200 text-xs truncate">
                      {item.type === "promo" ? item.promo.nombre : item.product.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400">
                        ×{item.quantity} {item.type === "promo" ? "promo(s)" : "unidad(es)"}
                      </span>
                      <span className="text-xs text-green-400 font-semibold">${item.subtotal.toFixed(2)}</span>
                    </div>
                    {item.type === "promo" && (
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        {item.promo.promo_productos
                          ?.map(
                            (pp) =>
                              `×${pp.cantidad * item.quantity} ${pp.producto?.nombre || "Producto"}`
                          )
                          .join(" • ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-neutral-400" />
            <span className="text-sm text-neutral-400">{cart.length} items</span>
          </div>
          <span className="text-xl font-bold text-green-400">${total.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => {
              onVentaAlFiadoChange(false);
            }}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all ${
              !ventaAlFiado ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            <Banknote size={14} />
            Contado
          </button>
          <button
            onClick={() => onVentaAlFiadoChange(true)}
            className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-all ${
              ventaAlFiado ? "bg-yellow-600 text-white" : "bg-neutral-800 text-neutral-400"
            }`}
          >
            <CreditCard size={14} />
            Fiado
          </button>
        </div>

        {ventaAlFiado && (
          <div className="mb-2">
            <button
              onClick={onOpenClienteModal}
              className="w-full flex items-center justify-between px-2 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded text-xs"
            >
              <span className={clienteSeleccionado ? "text-neutral-200" : "text-neutral-500"}>
                {clienteSeleccionado
                  ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`
                  : "Cliente..."}
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        )}

        {!ventaAlFiado && (
          <div className="mb-2">
            <select
              value={metodoPago}
              onChange={(e) => onMetodoPagoChange(e.target.value)}
              className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        )}

        <div className="mb-2">
          <textarea
            value={ventaNotas}
            onChange={(e) => onNotasChange(e.target.value)}
            placeholder="Comentarios..."
            rows={2}
            className="w-full px-2 py-1.5 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={onConfirmSale}
          disabled={cart.length === 0 || saleLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed"
        >
          {saleLoading ? "Procesando..." : "Confirmar Venta"}
        </button>
      </div>
    </div>

    <div className="md:hidden h-32" />
  </>
);

export default MobileCartSummary;
