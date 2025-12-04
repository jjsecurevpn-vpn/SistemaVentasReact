import React from 'react';
import { MdClose, MdInventory2, MdPayment, MdPerson, MdInfo } from 'react-icons/md';
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

const infoRows = (
  label: string,
  value: React.ReactNode,
  icon?: React.ReactNode
) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-900/50 border border-neutral-800">
    {icon && <div className="text-neutral-400 text-xl mt-0.5">{icon}</div>}
    <div>
      <p className="text-xs uppercase tracking-widest text-neutral-500">{label}</p>
      <div className="text-sm text-neutral-100 font-medium mt-1 break-words">
        {value}
      </div>
    </div>
  </div>
);

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
    <div className="fixed inset-0 z-[10500] bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center md:items-start justify-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 pt-16 sm:pt-20 md:pt-32 pb-10 md:pb-12">
        <div className="w-full max-w-5xl xl:max-w-6xl rounded-3xl border border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col max-h-[calc(100vh-6rem)] overflow-hidden">
          <div className="relative border-b border-neutral-800 px-5 sm:px-7 py-5">
            <div className="pr-10 sm:pr-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Movimiento</p>
              <h2 className="text-xl font-bold text-neutral-100 leading-snug break-words">{movimiento.descripcion}</h2>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-6 p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Cerrar"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoRows('Tipo', movimiento.tipo.replace('_', ' ').toUpperCase(), <MdInfo />)}
                  {infoRows('Monto', formatCurrency(movimiento.monto), <MdPayment />)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoRows('Fecha', fechaLocal)}
                  {metodoPago && infoRows('Método de pago', metodoPago, <MdPayment />)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {clienteNombre &&
                    infoRows('Cliente', clienteNombre, <MdPerson />)}
                  {movimiento.usuario?.email &&
                    infoRows('Registrado por', movimiento.usuario.email, <MdPerson />)}
                </div>
                {notasLimpias && infoRows('Notas', notasLimpias)}
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 h-full flex flex-col">
                <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
                  <MdInventory2 className="text-blue-400" />
                  <p className="text-sm font-semibold text-neutral-200">
                    Productos ({productos.length})
                  </p>
                </div>
                {productos.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-neutral-500">
                    No hay productos asociados a este movimiento
                  </p>
                ) : (
                  <div className="flex-1 overflow-y-auto divide-y divide-neutral-800">
                    {productos.map((producto) => (
                      <div
                        key={`${producto.producto_id}-${producto.nombre}`}
                        className="px-4 py-3 text-sm flex items-center justify-between gap-4"
                      >
                        <div className="text-neutral-200">
                          <p className="font-medium">{producto.nombre}</p>
                          <p className="text-xs text-neutral-500">
                            Cantidad: {producto.cantidad}
                          </p>
                        </div>
                        <span className="text-blue-400 font-semibold">
                          {formatCurrency(producto.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaMovementDetailsModal;
