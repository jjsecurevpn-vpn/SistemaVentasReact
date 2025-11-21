import React from 'react';
import { X, CheckCircle, ShoppingCart } from 'lucide-react';

interface SaleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Array<{
    product: {
      id: number;
      nombre: string;
      precio: number;
    };
    quantity: number;
    subtotal: number;
  }>;
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-200">
                  ¡Venta Confirmada!
                </h3>
                <p className="text-sm text-neutral-400">
                  {isCreditSale ? 'Venta al fiado registrada' : 'Venta completada exitosamente'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Client Info (if credit sale) */}
          {isCreditSale && clientName && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Cliente:</span> {clientName}
              </p>
            </div>
          )}

          {/* Products List */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart size={18} className="text-neutral-400" />
              <h4 className="font-medium text-neutral-200">Productos Vendidos</h4>
            </div>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-neutral-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-200 truncate">
                      {item.product.nombre}
                    </p>
                    <p className="text-sm text-neutral-400">
                      ${item.product.precio.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="font-semibold text-green-400">
                      ${item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-neutral-800 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-neutral-200">Total</span>
              <span className="text-xl font-bold text-green-400">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleConfirmationModal;