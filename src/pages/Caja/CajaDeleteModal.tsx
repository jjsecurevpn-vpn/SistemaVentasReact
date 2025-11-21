import React from 'react';
import { MdWarning, MdClose } from 'react-icons/md';

interface Movimiento {
  id: number;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  usuario_id: string;
  venta_id?: number;
  cliente_id?: number;
  usuario?: {
    id: string;
    email: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  venta?: {
    id: number;
    total: number;
    fecha: string;
    productos: Array<{
      producto_id: number;
      nombre: string;
      cantidad: number;
      subtotal: number;
    }>;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <MdWarning className="text-red-500" size={24} />
            <h2 className="text-lg font-semibold text-neutral-200">
              Eliminar Movimiento
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
            disabled={isDeleting}
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-neutral-300 mb-4">
            ¿Estás seguro de que quieres eliminar este movimiento?
          </p>

          <div className="bg-neutral-800 rounded-lg p-3 mb-4">
            <div className="text-sm text-neutral-400 mb-1">Descripción:</div>
            <div className="text-neutral-200 font-medium mb-2">{movimiento.descripcion}</div>

            {movimiento.cliente && (
              <>
                <div className="text-sm text-neutral-400 mb-1">Cliente:</div>
                <div className="text-blue-400 font-medium mb-2">
                  {movimiento.cliente.nombre} {movimiento.cliente.apellido}
                </div>
              </>
            )}

            {movimiento.venta?.productos && movimiento.venta.productos.length > 0 && (
              <>
                <div className="text-sm text-neutral-400 mb-1">Productos:</div>
                <div className="text-green-400 mb-2">
                  <ul className="text-sm">
                    {movimiento.venta.productos.map((producto, index) => (
                      <li key={index}>
                        {producto.nombre} x{producto.cantidad} - ${producto.subtotal.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Tipo:</span>
              <span className="text-neutral-200 capitalize">{movimiento.tipo.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Monto:</span>
              <span className="text-neutral-200">
                ${movimiento.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Fecha:</span>
              <span className="text-neutral-200">
                {new Date(movimiento.fecha).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <p className="text-sm text-red-400 mb-4">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaDeleteModal;