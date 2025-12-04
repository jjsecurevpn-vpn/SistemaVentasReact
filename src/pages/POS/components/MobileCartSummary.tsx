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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-neutral-800/50 z-20 max-h-[65vh] flex flex-col">
      {/* Cart Items */}
      {cart.length > 0 && (
        <div className="overflow-auto max-h-40 border-b border-neutral-800/30">
          <div className="p-3 space-y-2">
            {cart.map((item, index) => (
              <div key={index} className="bg-neutral-900/40 border border-neutral-800/50 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    {item.type === "promo" && (
                      <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-0.5">
                        Promo
                      </span>
                    )}
                    <p className="font-medium text-white text-xs truncate">
                      {item.type === "promo" ? item.promo.nombre : item.product.nombre}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-neutral-500">×{item.quantity}</span>
                      <span className="text-xs text-emerald-400 font-medium">${item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="p-1 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-3 flex-shrink-0 space-y-2.5">
        {/* Total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={14} className="text-neutral-500" />
            <span className="text-xs text-neutral-500">{cart.length} items</span>
          </div>
          <span className="text-lg font-semibold text-white">${total.toFixed(2)}</span>
        </div>

        {/* Payment Type */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onVentaAlFiadoChange(false)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              !ventaAlFiado ? "bg-white text-black" : "bg-neutral-800/50 text-neutral-500"
            }`}
          >
            <Banknote size={12} />
            Contado
          </button>
          <button
            onClick={() => onVentaAlFiadoChange(true)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              ventaAlFiado ? "bg-amber-500 text-black" : "bg-neutral-800/50 text-neutral-500"
            }`}
          >
            <CreditCard size={12} />
            Fiado
          </button>
        </div>

        {/* Client Selector or Payment Method */}
        {ventaAlFiado ? (
          <button
            onClick={onOpenClienteModal}
            className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white rounded-lg text-xs"
          >
            <span className={clienteSeleccionado ? "text-white" : "text-neutral-500"}>
              {clienteSeleccionado
                ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`
                : "Seleccionar cliente..."}
            </span>
            <ChevronDown size={12} className="text-neutral-500" />
          </button>
        ) : (
          <select
            value={metodoPago}
            onChange={(e) => onMetodoPagoChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-600"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        )}

        {/* Notes */}
        <textarea
          value={ventaNotas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Notas (opcional)"
          rows={2}
          className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white text-xs rounded-lg resize-none focus:outline-none focus:border-neutral-600 placeholder-neutral-600"
        />

        {/* Confirm Button */}
        <button
          onClick={onConfirmSale}
          disabled={cart.length === 0 || saleLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black py-3 rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed"
        >
          {saleLoading ? "Procesando..." : "Confirmar Venta"}
        </button>
      </div>
    </div>

    {/* Spacer for content */}
    <div className="md:hidden h-36" />
  </>
);

export default MobileCartSummary;
