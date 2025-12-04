import React from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/api';

interface Movimiento {
  id: number;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  usuario_id: string;
  venta_id?: number;
  cliente_id?: number;
  metodo_pago?: string;
  notas?: string;
  usuario?: { id: string; email: string };
  cliente?: { id: number; nombre: string; apellido: string; email: string };
  venta?: {
    id: number;
    total: number;
    fecha: string;
    productos: Array<{ producto_id: number; nombre: string; cantidad: number; subtotal: number }>;
  };
}

interface CajaDeleteModalProps {
  isOpen: boolean;
  movimiento: Movimiento | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const CajaDeleteModal: React.FC<CajaDeleteModalProps> = ({
  isOpen,
  movimiento,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!isOpen || !movimiento) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
          <h2 className="text-sm font-medium text-white">Eliminar Movimiento</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-500 hover:text-white transition-colors"
            disabled={isDeleting}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-neutral-400">
            ¿Eliminar este movimiento?
          </p>

          <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 space-y-2">
            <p className="text-sm text-white">{movimiento.descripcion}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-500 capitalize">{movimiento.tipo.replace('_', ' ')}</span>
              <span className="text-white font-medium">{formatCurrency(movimiento.monto)}</span>
            </div>
          </div>

          <p className="text-[10px] text-red-400">
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-4 border-t border-neutral-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-neutral-800 disabled:text-neutral-600 rounded-lg text-white text-sm font-medium transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CajaDeleteModal;