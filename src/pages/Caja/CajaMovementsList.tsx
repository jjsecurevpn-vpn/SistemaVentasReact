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
  MdInfo,
  MdPayment,
} from 'react-icons/md';
import { formatCurrency } from '../../utils/api';
import { getLocalDateString, getGroupDateLabel, getLocalTimeString } from '../../hooks/useDateUtils';

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
  isAdmin: boolean;
  onEditMovement: (movimiento: Movimiento) => void;
  onDeleteMovement: (movimiento: Movimiento) => void;
  onShowDetails: (movimiento: Movimiento) => void;
}

const CajaMovementsList: React.FC<CajaMovementsListProps> = ({
  movimientos,
  isMobile,
  isAdmin,
  onEditMovement,
  onDeleteMovement,
  onShowDetails,
}) => {
  const [expandedDias, setExpandedDias] = useState<Set<string>>(new Set());

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

  const formatMetodoPago = (metodo?: string) => {
    if (!metodo) return null;
    const normalized = metodo.toLowerCase();
    if (normalized === 'efectivo') return 'Efectivo';
    if (normalized === 'transferencia') return 'Transferencia';
    return metodo.charAt(0).toUpperCase() + metodo.slice(1);
  };

  // Agrupar por día
  const movimientosPorDia = movimientos.reduce((acc, mov) => {
    const fechaDia = getLocalDateString(mov.fecha);
    if (!acc[fechaDia]) acc[fechaDia] = [];
    acc[fechaDia].push(mov);
    return acc;
  }, {} as Record<string, Movimiento[]>);

  const diasOrdenados = Object.keys(movimientosPorDia).sort().reverse();

  // ==============================================
  // =============== VISTA MÓVIL ==================
  // ==============================================
  if (isMobile) {
    return (
      <div className="space-y-6 pb-8">
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
                className="w-full bg-neutral-900/95 px-4 py-3 border-b border-neutral-800/80 hover:bg-neutral-850/95 transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {isDiaExpanded ? (
                      <MdExpandLess className="text-blue-400 text-xl" />
                    ) : (
                      <MdExpandMore className="text-neutral-500 text-xl" />
                    )}
                    <h3 className="font-bold text-neutral-100 text-base">
                      {getGroupDateLabel(fechaDia)}
                    </h3>
                  </div>
                  <span
                    className={`font-bold px-3 py-1.5 rounded-xl text-xs border ${
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
                <div className="p-4 space-y-4">
                  {movimientosDelDia.map((mov) => {
                    const config = getTipoConfig(mov.tipo);
                    const Icon = config.icon;
                    const movimientoHora = getLocalTimeString(mov.fecha);

                    return (
                      <div
                        key={mov.id}
                        className="rounded-2xl border border-neutral-700/70 bg-neutral-850/90 shadow-lg"
                      >
                        <div className="p-4 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl ${config.bg} shadow-md`}>
                              <Icon className={`${config.color} text-lg`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="font-semibold text-neutral-100 text-base truncate">
                                  {mov.descripcion}
                                </h4>
                                <span className={`text-lg font-bold ${config.color}`}>
                                  {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1">
                                {movimientoHora} · {config.label}
                              </p>
                              {formatMetodoPago(mov.metodo_pago) && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-neutral-400">
                                  <MdPayment className="text-sm" />
                                  <span>Método: {formatMetodoPago(mov.metodo_pago)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 justify-between">
                            <button
                              onClick={() => onShowDetails(mov)}
                              className="flex items-center gap-1 text-xs font-semibold text-blue-300 hover:text-blue-200"
                            >
                              <MdInfo className="text-sm" /> Ver detalles
                            </button>
                            {isAdmin && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => onEditMovement(mov)}
                                  className="p-2 rounded-lg bg-neutral-800/60 hover:bg-blue-500/30 text-neutral-400 hover:text-blue-400 transition"
                                >
                                  <MdEdit className="text-base" />
                                </button>
                                <button
                                  onClick={() => onDeleteMovement(mov)}
                                  className="p-2 rounded-lg bg-neutral-800/60 hover:bg-red-500/30 text-neutral-400 hover:text-red-400 transition"
                                >
                                  <MdDelete className="text-base" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
                    {getGroupDateLabel(fechaDia)}
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
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-neutral-800/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Método</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Monto</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {movimientosDelDia.map((mov) => {
                        const config = getTipoConfig(mov.tipo);
                        const Icon = config.icon;
                        const movimientoHora = getLocalTimeString(mov.fecha);

                        return (
                          <tr
                            key={mov.id}
                            className="hover:bg-neutral-800/60 transition"
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
                            <td className="px-6 py-4 text-sm text-neutral-400">
                              {formatMetodoPago(mov.metodo_pago) || '—'}
                            </td>
                            <td className={`px-6 py-4 font-bold ${config.color}`}>
                              {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-400">
                              {movimientoHora}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => onShowDetails(mov)}
                                  className="text-neutral-400 hover:text-emerald-400 transition"
                                >
                                  <MdInfo size={18} />
                                </button>
                                {isAdmin && (
                                  <>
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
                                  </>
                                )}
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