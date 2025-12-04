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
  <div className="hidden md:flex md:w-80 lg:w-96 flex-col bg-neutral-900 h-full">
    <div className="py-3.5 border-b border-neutral-800 flex-shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-200 flex items-center gap-2 pl-3">
          <ShoppingCart size={18} />
          Carrito
        </h3>
        <span className="text-xs text-neutral-400 pr-3">{cart.length}</span>
      </div>
    </div>

    <div className="flex-1 overflow-auto min-h-0 max-h-[60vh] p-3">
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-neutral-500">
          <ShoppingCart className="mb-2 opacity-50" size={40} />
          <p className="text-sm">Carrito vacío</p>
        </div>
      ) : (
        <div className="space-y-2">
          {cart.map((item, index) => (
            <div key={index} className="bg-[#181818] border border-neutral-800 rounded-lg p-2.5">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-medium text-neutral-200 text-sm truncate">{item.product.nombre}</p>
                  <p className="text-green-400 font-semibold text-base">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  className="p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Cantidad:</span>
                <span className="text-neutral-400">×{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div className="border-t border-neutral-800 bg-neutral-900 flex-shrink-0 min-h-[120px] sticky bottom-0">
      <div className="px-3 py-2 border-b border-neutral-800">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onVentaAlFiadoChange(false);
            }}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              !ventaAlFiado ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            <Banknote size={14} />
            Contado
          </button>
          <button
            onClick={() => onVentaAlFiadoChange(true)}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              ventaAlFiado ? "bg-yellow-600 text-white" : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
            }`}
          >
            <CreditCard size={14} />
            Fiado
          </button>
        </div>
      </div>

      {ventaAlFiado && (
        <div className="px-3 py-2 border-b border-neutral-800">
          <label className="block text-xs font-medium text-neutral-400 mb-2">Cliente</label>
          <button
            onClick={onOpenClienteModal}
            className="w-full flex items-center justify-between px-2.5 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-xs hover:border-neutral-600 transition-all"
          >
            <span className={clienteSeleccionado ? "text-neutral-200" : "text-neutral-500"}>
              {clienteSeleccionado
                ? `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido || ""}`
                : "Seleccionar..."}
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {!ventaAlFiado && (
        <div className="px-3 py-2 border-b border-neutral-800">
          <label className="block text-xs font-medium text-neutral-400 mb-2">Método de pago</label>
          <select
            value={metodoPago}
            onChange={(e) => onMetodoPagoChange(e.target.value)}
            className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>
      )}

      <div className="px-3 py-2 border-b border-neutral-800">
        <textarea
          value={ventaNotas}
          onChange={(e) => onNotasChange(e.target.value)}
          placeholder="Comentarios..."
          rows={2}
          className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-400 text-sm font-medium">Total</span>
          <span className="text-xl font-bold text-green-400">${total.toFixed(2)}</span>
        </div>
        <button
          onClick={onConfirmSale}
          disabled={cart.length === 0 || saleLoading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:cursor-not-allowed"
        >
          {saleLoading ? "Procesando..." : "Confirmar Venta"}
        </button>
      </div>
    </div>
  </div>
);

export default CartSidebar;
