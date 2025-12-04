import React from "react";
import { ShoppingCart, Banknote, CreditCard, ChevronDown, X } from "lucide-react";
import type { CartItem } from "../../../hooks/useSales";
import type { Cliente } from "../../../hooks/useClientes";

interface CartSidebarProps {
  cart: CartItem[];
  total: number;
  ventaAlFiado: boolean;
  onVentaAlFiadoChange: (value: boolean) => void;
  onRemoveItem: (index: number) => void;
  clienteSeleccionado: Cliente | null;
  onOpenClienteModal: () => void;
  ventaNotas: string;
  onNotasChange: (value: string) => void;
  metodoPago: string;
  onMetodoPagoChange: (value: string) => void;
  onConfirmSale: () => void;
  saleLoading: boolean;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  total,
  ventaAlFiado,
  onVentaAlFiadoChange,
  onRemoveItem,
  clienteSeleccionado,
  onOpenClienteModal,
  ventaNotas,
  onNotasChange,
  metodoPago,
  onMetodoPagoChange,
  onConfirmSale,
  saleLoading,
}) => (
  <div className="hidden md:flex md:w-80 lg:w-96 flex-col bg-[#0a0a0a] border-l border-neutral-800/50 h-full">
    {/* Header */}
    <div className="px-4 py-3 border-b border-neutral-800/50 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-neutral-500" />
          <span className="text-sm font-medium text-white">Carrito</span>
        </div>
        <span className="text-xs text-neutral-600 bg-neutral-800/50 px-2 py-0.5 rounded">{cart.length}</span>
      </div>
    </div>

    {/* Cart Items */}
    <div className="flex-1 overflow-auto min-h-0 max-h-[55vh] p-3">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-600">
          <ShoppingCart className="mb-2 opacity-30" size={32} />
          <p className="text-xs">Carrito vacío</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cart.map((item, index) => (
            <div key={index} className="bg-neutral-900/40 border border-neutral-800/50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-2">
                  {item.type === "promo" && (
                    <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                      Promo
                    </span>
                  )}
                  <p className="font-medium text-white text-sm truncate">
                    {item.type === "promo" ? item.promo.nombre : item.product.nombre}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="p-1 hover:bg-red-500/10 text-neutral-500 hover:text-red-400 rounded transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">×{item.quantity}</span>
                <span className="text-sm font-medium text-emerald-400">${item.subtotal.toFixed(2)}</span>
              </div>
              {item.type === "promo" && (
                <p className="text-[10px] text-neutral-600 mt-2 leading-relaxed">
                  {item.promo.promo_productos
                    ?.map((pp) => `${pp.cantidad * item.quantity}× ${pp.producto?.nombre || "Producto"}`)
                    .join(" · ") || "Sin detalle"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Footer */}
    <div className="border-t border-neutral-800/50 bg-[#0a0a0a] flex-shrink-0">
      {/* Payment Type */}
      <div className="px-3 py-3 border-b border-neutral-800/30">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onVentaAlFiadoChange(false)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              !ventaAlFiado 
                ? "bg-white text-black" 
                : "bg-neutral-800/50 text-neutral-500 hover:bg-neutral-800"
            }`}
          >
            <Banknote size={14} />
            Contado
          </button>
          <button
            onClick={() => onVentaAlFiadoChange(true)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
              ventaAlFiado 
                ? "bg-amber-500 text-black" 
                : "bg-neutral-800/50 text-neutral-500 hover:bg-neutral-800"
            }`}
          >
            <CreditCard size={14} />
            Fiado
          </button>
        </div>
      </div>

      {/* Client Selector (for Fiado) */}
      {ventaAlFiado && (
        <div className="px-3 py-3 border-b border-neutral-800/30">
          <label className="block text-[10px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Cliente</label>
          <button
            onClick={onOpenClienteModal}
            className="w-full flex items-center justify-between px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white rounded-lg text-xs hover:border-neutral-600 transition-all"
          >
            <span className={clienteSeleccionado ? "text-white" : "text-neutral-500"}>
              {clienteSeleccionado
                ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`
                : "Seleccionar..."}
            </span>
            <ChevronDown size={14} className="text-neutral-500" />
          </button>
        </div>
      )}

      {/* Payment Method (for Contado) */}
      {!ventaAlFiado && (
        <div className="px-3 py-3 border-b border-neutral-800/30">
          <label className="block text-[10px] font-medium text-neutral-500 mb-1.5 uppercase tracking-wider">Método de pago</label>
          <select
            value={metodoPago}
            onChange={(e) => onMetodoPagoChange(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white text-xs rounded-lg focus:outline-none focus:border-neutral-600 transition-colors"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="px-3 py-3 border-b border-neutral-800/30">
        <textarea
          value={ventaNotas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Notas (opcional)"
          rows={2}
          className="w-full px-3 py-2 bg-neutral-900/50 border border-neutral-800 text-white text-xs rounded-lg resize-none focus:outline-none focus:border-neutral-600 transition-colors placeholder-neutral-600"
        />
      </div>

      {/* Total and Confirm */}
      <div className="px-3 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-neutral-500 text-xs font-medium">Total</span>
          <span className="text-xl font-semibold text-white">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={onConfirmSale}
          disabled={cart.length === 0 || saleLoading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-black py-2.5 rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed"
        >
          {saleLoading ? "Procesando..." : "Confirmar Venta"}
        </button>
      </div>
    </div>
  </div>
);

export default CartSidebar;
