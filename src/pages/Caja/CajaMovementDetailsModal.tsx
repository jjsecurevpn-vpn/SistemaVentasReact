import React from 'react';
import { X, Package } from 'lucide-react';
import { formatCurrency } from '../../utils/api';

interface ProductoVenta {
  producto_id: number;
  nombre: string;
  cantidad: number;
  subtotal: number;
}

interface MovimientoDetalle {
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
  cliente?: { id: number; nombre: string; apellido?: string; email?: string };
  venta?: {
    id: number;
    total: number;
    fecha: string;
    productos: ProductoVenta[];
  };
}

interface CajaMovementDetailsModalProps {
  movimiento: MovimientoDetalle | null;
  isOpen: boolean;
  onClose: () => void;
}

const parseNotas = (notas?: string | null, descripcion?: string) => {
  if (!notas) return { notas: null, metodo: null };

  let working = notas.trim();
  let extractedMetodo: string | null = null;

  const metodoRegex = /m[ée]todo\s*:\s*([a-z0-9áéíóúüñ\s]+)/i;
  const metodoMatch = working.match(metodoRegex);
  if (metodoMatch && metodoMatch.index !== undefined) {
    extractedMetodo = metodoMatch[1].trim();
    working = `${working.slice(0, metodoMatch.index)} ${working.slice(metodoMatch.index + metodoMatch[0].length)}`.replace(/\s{2,}/g, ' ').trim();
  }

  const segments = working
    .split(/[\n\.]/)
    .map(segment => segment.trim())
    .filter(Boolean)
    .filter(segment => !/^cliente id:/i.test(segment) && !/^productos( vendidos)?:/i.test(segment));

  let cleaned = segments.join('. ').trim();

  if (descripcion) {
    const descTrimmed = descripcion.trim();
    if (descTrimmed.length > 0) {
      const endings = [descTrimmed, descTrimmed.replace(/^Venta\s+/i, ''), descTrimmed.replace(/^Pago\s+/i, '')];
      for (const ending of endings) {
        if (ending && cleaned.toLowerCase().endsWith(ending.toLowerCase())) {
          cleaned = cleaned.slice(0, cleaned.length - ending.length).replace(/[-–—]\s*$/, '').trim();
          break;
        }
      }
    }
  }

  return {
    notas: cleaned.length > 0 ? cleaned : null,
    metodo: extractedMetodo && extractedMetodo.length > 0 ? extractedMetodo : null
  };
};

const CajaMovementDetailsModal: React.FC<CajaMovementDetailsModalProps> = ({
  movimiento,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !movimiento) return null;

  const productos = movimiento.venta?.productos || [];
  const clienteNombre = movimiento.cliente
    ? `${movimiento.cliente.nombre} ${movimiento.cliente.apellido || ''}`.trim()
    : null;
  const fechaLocal = new Date(movimiento.fecha).toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const { notas: notasLimpias, metodo: metodoDesdeNotas } = parseNotas(movimiento.notas, movimiento.descripcion);
  const metodoPago = movimiento.metodo_pago || metodoDesdeNotas || null;

  return (
    <div className="fixed inset-0 z-[10500] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 pt-20 pb-8">
        <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800/50 rounded-2xl">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-neutral-800/50">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">Movimiento</p>
              <h2 className="text-sm font-medium text-white truncate">{movimiento.descripcion}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Tipo</p>
                <p className="text-sm text-white capitalize">{movimiento.tipo.replace('_', ' ')}</p>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Monto</p>
                <p className="text-sm font-semibold text-emerald-500">{formatCurrency(movimiento.monto)}</p>
              </div>
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Fecha</p>
                <p className="text-sm text-white">{fechaLocal}</p>
              </div>
              {metodoPago && (
                <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                  <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Método</p>
                  <p className="text-sm text-white capitalize">{metodoPago}</p>
                </div>
              )}
            </div>

            {/* Cliente */}
            {clienteNombre && (
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Cliente</p>
                <p className="text-sm text-white">{clienteNombre}</p>
              </div>
            )}

            {/* Usuario */}
            {movimiento.usuario?.email && (
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Registrado por</p>
                <p className="text-sm text-white">{movimiento.usuario.email}</p>
              </div>
            )}

            {/* Notas */}
            {notasLimpias && (
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3">
                <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">Notas</p>
                <p className="text-sm text-white">{notasLimpias}</p>
              </div>
            )}

            {/* Productos */}
            {productos.length > 0 && (
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800/50">
                  <Package size={14} className="text-neutral-500" />
                  <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                    Productos ({productos.length})
                  </p>
                </div>
                <div className="divide-y divide-neutral-800/30 max-h-40 overflow-y-auto">
                  {productos.map((producto) => (
                    <div
                      key={`${producto.producto_id}-${producto.nombre}`}
                      className="px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-white">{producto.nombre}</p>
                        <p className="text-[10px] text-neutral-600">×{producto.cantidad}</p>
                      </div>
                      <span className="text-sm text-emerald-500">{formatCurrency(producto.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-800/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-white text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaMovementDetailsModal;
