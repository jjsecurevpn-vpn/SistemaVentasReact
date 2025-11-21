import React, { useState } from 'react';
import {
  MdDelete,
  MdEdit,
  MdArrowUpward,
  MdArrowDownward,
  MdAccountBalance,
  MdCreditCard,
  MdExpandMore,
  MdExpandLess,
  MdPerson,
} from 'react-icons/md';
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
  usuario?: { id: string; email: string };
  cliente?: { id: number; nombre: string; apellido: string; email: string };
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
  created_at: string;
}

interface CajaMovementsListProps {
  movimientos: Movimiento[];
  isMobile: boolean;
  onEditMovement: (movimiento: Movimiento) => void;
  onDeleteMovement: (movimiento: Movimiento) => void;
}

const CajaMovementsList: React.FC<CajaMovementsListProps> = ({
  movimientos,
  isMobile,
  onEditMovement,
  onDeleteMovement,
}) => {
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [expandedDias, setExpandedDias] = useState<Set<string>>(new Set());

  const toggleExpand = (id: number) => {
    setOpenedId((prev) => (prev === id ? null : id));
  };

  const toggleDia = (fechaDia: string) => {
    setExpandedDias((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fechaDia)) {
        newSet.delete(fechaDia);
      } else {
        newSet.clear(); // solo un día abierto a la vez (mejor UX en móvil)
        newSet.add(fechaDia);
      }
      return newSet;
    });
  };

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ingreso':
        return { icon: MdArrowUpward, color: 'text-green-400', label: 'Ingreso', bg: 'bg-green-500/20' };
      case 'gasto':
        return { icon: MdArrowDownward, color: 'text-red-400', label: 'Gasto', bg: 'bg-red-500/20' };
      case 'fiado':
        return { icon: MdCreditCard, color: 'text-yellow-400', label: 'Fiado', bg: 'bg-yellow-500/20' };
      case 'pago_fiado':
        return { icon: MdAccountBalance, color: 'text-blue-400', label: 'Pago Fiado', bg: 'bg-blue-500/20' };
      default:
        return { icon: MdAccountBalance, color: 'text-gray-400', label: tipo, bg: 'bg-gray-500/20' };
    }
  };

  // Agrupar por día
  const movimientosPorDia = movimientos.reduce((acc, mov) => {
    const fechaDia = mov.fecha.split('T')[0];
    if (!acc[fechaDia]) acc[fechaDia] = [];
    acc[fechaDia].push(mov);
    return acc;
  }, {} as Record<string, Movimiento[]>);

  const diasOrdenados = Object.keys(movimientosPorDia).sort().reverse();

  const formatearFechaGrupo = (fechaDia: string) => {
    const fecha = new Date(fechaDia + 'T00:00:00');
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    const esHoy = fecha.toDateString() === hoy.toDateString();
    const esAyer = fecha.toDateString() === ayer.toDateString();

    const diaNombre = diasSemana[fecha.getDay()];
    const diaNum = fecha.getDate();
    const mesNombre = meses[fecha.getMonth()];

    if (esHoy) return `Hoy - ${diaNombre}, ${diaNum} de ${mesNombre}`;
    if (esAyer) return `Ayer - ${diaNombre}, ${diaNum} de ${mesNombre}`;
    return `${diaNombre}, ${diaNum} de ${mesNombre}`;
  };

  const renderProductos = (
    productos: Array<{ producto_id: number; nombre: string; cantidad: number; subtotal: number }> | undefined,
    movementId: number
  ) => {
    if (!productos || productos.length === 0) return null;

    const MAX_COLLAPSED = 3;
    const isExpanded = openedId === movementId;
    const shouldCollapse = productos.length > MAX_COLLAPSED;
    const visible = isExpanded ? productos : productos.slice(0, MAX_COLLAPSED);

    return (
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <p className="text-sm font-semibold text-neutral-300 mb-3">Productos vendidos:</p>
        <div className="space-y-2">
          {visible.map((p, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-neutral-400 truncate max-w-[70%]">
                {p.nombre} × {p.cantidad}
              </span>
              <span className="text-green-400 font-medium">${p.subtotal.toFixed(2)}</span>
            </div>
          ))}
          {shouldCollapse && (
            <button
              onClick={() => toggleExpand(movementId)}
              className="flex items-center gap-1.5 mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {isExpanded ? (
                <>
                  <MdExpandLess size={18} /> Ocultar
                </>
              ) : (
                <>
                  <MdExpandMore size={18} /> Ver {productos.length - MAX_COLLAPSED} más
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  // ==============================================
  // =============== VISTA MÓVIL ==================
  // ==============================================
  if (isMobile) {
    return (
      <div className="space-y-7 pb-8">
        {diasOrdenados.map((fechaDia) => {
          const movimientosDelDia = movimientosPorDia[fechaDia];
          const montoTotalDia = movimientosDelDia.reduce((sum, mov) => {
            return mov.tipo === 'gasto' ? sum - mov.monto : sum + mov.monto;
          }, 0);

          const isDiaExpanded = expandedDias.has(fechaDia);

          return (
            <div
              key={fechaDia}
              className="rounded-2xl overflow-hidden bg-neutral-900/70 border border-neutral-800/60 shadow-lg"
            >
              {/* Header del día */}
              <button
                onClick={() => toggleDia(fechaDia)}
                className="w-full bg-neutral-900/95 px-5 py-4 border-b border-neutral-800/80 hover:bg-neutral-850/95 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {isDiaExpanded ? (
                      <MdExpandLess size={26} className="text-blue-400" />
                    ) : (
                      <MdExpandMore size={26} className="text-neutral-500" />
                    )}
                    <h3 className="font-bold text-neutral-100 text-lg">
                      {formatearFechaGrupo(fechaDia)}
                    </h3>
                  </div>
                  <span
                    className={`font-bold px-4 py-2 rounded-xl text-sm border ${
                      montoTotalDia >= 0
                        ? 'text-green-400 bg-green-500/20 border-green-500/40'
                        : 'text-red-400 bg-red-500/20 border-red-500/40'
                    }`}
                  >
                    {montoTotalDia >= 0 ? '+' : ''}{formatCurrency(montoTotalDia)}
                  </span>
                </div>
              </button>

              {/* Movimientos */}
              {isDiaExpanded && (
                <div className="p-5 space-y-5">
                  {movimientosDelDia.map((mov) => {
                    const config = getTipoConfig(mov.tipo);
                    const Icon = config.icon;
                    const hasProductos = mov.venta?.productos && mov.venta.productos.length > 0;
                    const isMovExpanded = openedId === mov.id;
                    const usuarioEmail = mov.usuario?.email || 'Desconocido';

                    return (
                      <div
                        key={mov.id}
                        className={`
                          rounded-2xl border overflow-hidden shadow-lg transition-all duration-300
                          ${isMovExpanded ? 'ring-2 ring-blue-500/50 border-blue-500/60' : 'border-neutral-700/70'}
                          bg-neutral-850/90
                        `}
                      >
                        <div className="p-5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={`p-3 rounded-xl ${config.bg} shadow-md`}>
                                <Icon size={26} className={config.color} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-neutral-100 text-lg truncate">
                                  {mov.descripcion}
                                </h4>

                                {mov.cliente && (
                                  <p className="text-blue-400 font-semibold text-sm mt-1">
                                    {mov.cliente.nombre} {mov.cliente.apellido}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 mt-3 text-xs text-neutral-500">
                                  <MdPerson size={15} />
                                  <span className="truncate">{usuarioEmail}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => onEditMovement(mov)}
                                className="p-2.5 rounded-lg bg-neutral-800/60 hover:bg-blue-500/30 text-neutral-400 hover:text-blue-400 transition"
                              >
                                <MdEdit size={20} />
                              </button>
                              <button
                                onClick={() => onDeleteMovement(mov)}
                                className="p-2.5 rounded-lg bg-neutral-800/60 hover:bg-red-500/30 text-neutral-400 hover:text-red-400 transition"
                              >
                                <MdDelete size={20} />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-end mt-6 pt-5 border-t border-neutral-700/60">
                            <div>
                              <p className={`font-bold text-lg ${config.color}`}>{config.label}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {new Date(mov.fecha).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <span className={`text-2xl font-bold ${config.color}`}>
                              {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                            </span>
                          </div>
                        </div>

                        {/* Productos */}
                        {hasProductos && (
                          <>
                            {isMovExpanded && (
                              <div className="px-5 pb-5 border-t border-neutral-700/50 bg-neutral-800/40">
                                {renderProductos(mov.venta!.productos, mov.id)}
                              </div>
                            )}

                            {!isMovExpanded && (
                              <div className="px-5 pb-4">
                                <span className="text-xs font-medium text-neutral-400 bg-neutral-700/70 px-3 py-1.5 rounded-full">
                                  {mov.venta!.productos.length} producto{mov.venta!.productos.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            <button
                              onClick={() => toggleExpand(mov.id)}
                              className="w-full py-4 bg-neutral-800/80 hover:bg-neutral-750 border-t border-neutral-700/70 flex items-center justify-center gap-2 text-blue-400 font-semibold transition"
                            >
                              {isMovExpanded ? (
                                <>Ocultar productos <MdExpandLess size={22} /></>
                              ) : (
                                <>Ver productos <MdExpandMore size={22} /></>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {movimientos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500 text-lg">No hay movimientos para mostrar</p>
          </div>
        )}
      </div>
    );
  }

  // ==============================================
  // =============== VISTA ESCRITORIO =============
  // ==============================================
  return (
    <div className="space-y-7 pb-8">
      {diasOrdenados.map((fechaDia) => {
        const movimientosDelDia = movimientosPorDia[fechaDia];
        const montoTotalDia = movimientosDelDia.reduce((sum, mov) => {
          return mov.tipo === 'gasto' ? sum - mov.monto : sum + mov.monto;
        }, 0);

        const isDiaExpanded = expandedDias.has(fechaDia);

        return (
          <div key={fechaDia} className="space-y-4">
            {/* Header día escritorio */}
            <button
              onClick={() => toggleDia(fechaDia)}
              className="w-full bg-neutral-900/90 border border-neutral-700/70 rounded-2xl px-6 py-5 hover:bg-neutral-800/90 transition-all shadow-lg"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {isDiaExpanded ? (
                    <MdExpandLess size={26} className="text-blue-400" />
                  ) : (
                    <MdExpandMore size={26} className="text-neutral-500" />
                  )}
                  <h3 className="font-bold text-neutral-100 text-xl">
                    {formatearFechaGrupo(fechaDia)}
                  </h3>
                </div>
                <span
                  className={`font-bold px-5 py-2.5 rounded-xl text-sm border ${
                    montoTotalDia >= 0
                      ? 'text-green-400 bg-green-500/20 border-green-500/40'
                      : 'text-red-400 bg-red-500/20 border-red-500/40'
                  }`}
                >
                  {montoTotalDia >= 0 ? '+' : ''}{formatCurrency(montoTotalDia)}
                </span>
              </div>
            </button>

            {/* Tabla */}
            {isDiaExpanded && (
              <div className="bg-neutral-900/95 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-neutral-800/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Cliente / Productos</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Usuario</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {movimientosDelDia.map((mov) => {
                        const config = getTipoConfig(mov.tipo);
                        const Icon = config.icon;
                        const hasProductos = mov.venta?.productos && mov.venta.productos.length > 0;
                        const isMovExpanded = openedId === mov.id;

                        return (
                          <tr
                            key={mov.id}
                            className={`hover:bg-neutral-800/60 transition ${isMovExpanded ? 'bg-neutral-800/40' : ''}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Icon size={20} className={config.color} />
                                <span className={`font-medium ${config.color}`}>{config.label}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-300 max-w-xs truncate">
                              {mov.descripcion}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {mov.cliente ? (
                                <div className="text-blue-400 font-medium">
                                  {mov.cliente.nombre} {mov.cliente.apellido}
                                </div>
                              ) : (
                                <span className="text-neutral-600">-</span>
                              )}
                              {hasProductos && (
                                <button
                                  onClick={() => toggleExpand(mov.id)}
                                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                  {isMovExpanded ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />}
                                  {mov.venta!.productos.length} producto{mov.venta!.productos.length > 1 ? 's' : ''}
                                </button>
                              )}
                              {isMovExpanded && hasProductos && (
                                <div className="mt-4">{renderProductos(mov.venta!.productos, mov.id)}</div>
                              )}
                            </td>
                            <td className={`px-6 py-4 font-bold ${config.color}`}>
                              {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-400">
                              {new Date(mov.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-400">
                              {mov.usuario?.email || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => onEditMovement(mov)}
                                  className="text-neutral-400 hover:text-blue-400 transition"
                                >
                                  <MdEdit size={18} />
                                </button>
                                <button
                                  onClick={() => onDeleteMovement(mov)}
                                  className="text-neutral-400 hover:text-red-400 transition"
                                >
                                  <MdDelete size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {movimientos.length === 0 && (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-lg">No hay movimientos para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default CajaMovementsList;