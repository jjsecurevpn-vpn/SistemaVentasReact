import React from 'react';
import { X, CheckCircle, ShoppingCart } from 'lucide-react';
import type { CartItem } from '../hooks/useSales';

interface SaleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  total: number;
  isCreditSale: boolean;
  clientName?: string;
}

const SaleConfirmationModal: React.FC<SaleConfirmationModalProps> = ({
  isOpen,
  onClose,
  cart,
  total,
  isCreditSale,
  clientName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-neutral-800/50 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <CheckCircle className="text-emerald-400" size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">
                  Venta Confirmada
                </h3>
                <p className="text-xs text-neutral-500">
                  {isCreditSale ? 'Registrada al fiado' : 'Completada'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors"
            >
              <X size={16} className="text-neutral-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Client Info (if credit sale) */}
          {isCreditSale && clientName && (
            <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-400">
                <span className="font-medium">Cliente:</span> {clientName}
              </p>
            </div>
          )}

          {/* Products List */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={14} className="text-neutral-500" />
              <span className="text-xs font-medium text-neutral-500">Productos</span>
            </div>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 px-3 bg-neutral-900/40 border border-neutral-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.type === 'promo' && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-medium">
                          Promo
                        </span>
                      )}
                      <p className="text-sm text-white truncate">
                        {item.type === 'promo' ? item.promo.nombre : item.product.nombre}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {item.type === 'promo'
                        ? `${item.quantity} combo(s)`
                        : `$${item.product.precio.toFixed(2)} × ${item.quantity}`}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-medium text-emerald-400">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-neutral-800/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Total</span>
              <span className="text-xl font-semibold text-white">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/50">
          <button
            onClick={onClose}
            className="w-full bg-white hover:bg-neutral-200 text-black py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmationModal;