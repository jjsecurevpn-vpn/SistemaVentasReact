import React, { useState } from 'react';
import { Trash2, Edit2, ChevronDown, ChevronUp, Info, CreditCard, ArrowUp, ArrowDown, Wallet } from 'lucide-react';
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
        newSet.clear();
        newSet.add(fechaDia);
      }
      return newSet;
    });
  };

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ingreso':
        return { icon: ArrowUp, color: 'text-emerald-500', label: 'Ingreso', bg: 'bg-emerald-500/10' };
      case 'gasto':
        return { icon: ArrowDown, color: 'text-red-400', label: 'Gasto', bg: 'bg-red-500/10' };
      case 'fiado':
        return { icon: CreditCard, color: 'text-amber-500', label: 'Fiado', bg: 'bg-amber-500/10' };
      case 'pago_fiado':
        return { icon: Wallet, color: 'text-blue-400', label: 'Pago Fiado', bg: 'bg-blue-500/10' };
      default:
        return { icon: Wallet, color: 'text-neutral-400', label: tipo, bg: 'bg-neutral-500/10' };
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

  // Vista Móvil
  if (isMobile) {
    return (
      <div className="space-y-3 pb-8">
        {diasOrdenados.map((fechaDia) => {
          const movimientosDelDia = movimientosPorDia[fechaDia];
          const montoTotalDia = movimientosDelDia.reduce((sum, mov) => {
            return mov.tipo === 'gasto' ? sum - mov.monto : sum + mov.monto;
          }, 0);

          const isDiaExpanded = expandedDias.has(fechaDia);

          return (
            <div
              key={fechaDia}
              className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden"
            >
              {/* Header del día */}
              <button
                onClick={() => toggleDia(fechaDia)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isDiaExpanded ? (
                    <ChevronUp size={16} className="text-neutral-500" />
                  ) : (
                    <ChevronDown size={16} className="text-neutral-500" />
                  )}
                  <span className="text-sm font-medium text-white">
                    {getGroupDateLabel(fechaDia)}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    montoTotalDia >= 0 ? 'text-emerald-500' : 'text-red-400'
                  }`}
                >
                  {montoTotalDia >= 0 ? '+' : ''}{formatCurrency(montoTotalDia)}
                </span>
              </button>

              {/* Movimientos */}
              {isDiaExpanded && (
                <div className="border-t border-neutral-800/50 divide-y divide-neutral-800/50">
                  {movimientosDelDia.map((mov) => {
                    const config = getTipoConfig(mov.tipo);
                    const Icon = config.icon;
                    const movimientoHora = getLocalTimeString(mov.fecha);

                    return (
                      <div key={mov.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${config.bg}`}>
                            <Icon size={14} className={config.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-white truncate">{mov.descripcion}</p>
                              <span className={`text-sm font-medium ${config.color} whitespace-nowrap`}>
                                {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-neutral-600">{movimientoHora}</span>
                              <span className="text-[10px] text-neutral-700">•</span>
                              <span className={`text-[10px] ${config.color}`}>{config.label}</span>
                              {formatMetodoPago(mov.metodo_pago) && (
                                <>
                                  <span className="text-[10px] text-neutral-700">•</span>
                                  <span className="text-[10px] text-neutral-600">{formatMetodoPago(mov.metodo_pago)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/30">
                          <button
                            onClick={() => onShowDetails(mov)}
                            className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-white transition-colors"
                          >
                            <Info size={12} /> Detalles
                          </button>
                          {isAdmin && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => onEditMovement(mov)}
                                className="p-1.5 text-neutral-600 hover:text-blue-400 transition-colors"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => onDeleteMovement(mov)}
                                className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
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
          <div className="text-center py-12">
            <p className="text-sm text-neutral-600">No hay movimientos</p>
          </div>
        )}
      </div>
    );
  }

  // Vista Escritorio
  return (
    <div className="space-y-4 pb-8">
      {diasOrdenados.map((fechaDia) => {
        const movimientosDelDia = movimientosPorDia[fechaDia];
        const montoTotalDia = movimientosDelDia.reduce((sum, mov) => {
          return mov.tipo === 'gasto' ? sum - mov.monto : sum + mov.monto;
        }, 0);

        const isDiaExpanded = expandedDias.has(fechaDia);

        return (
          <div key={fechaDia} className="space-y-2">
            {/* Header día */}
            <button
              onClick={() => toggleDia(fechaDia)}
              className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-5 py-3 flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDiaExpanded ? (
                  <ChevronUp size={18} className="text-neutral-500" />
                ) : (
                  <ChevronDown size={18} className="text-neutral-500" />
                )}
                <span className="text-sm font-medium text-white">
                  {getGroupDateLabel(fechaDia)}
                </span>
                <span className="text-xs text-neutral-600">
                  {movimientosDelDia.length} {movimientosDelDia.length === 1 ? 'movimiento' : 'movimientos'}
                </span>
              </div>
              <span
                className={`text-sm font-semibold ${
                  montoTotalDia >= 0 ? 'text-emerald-500' : 'text-red-400'
                }`}
              >
                {montoTotalDia >= 0 ? '+' : ''}{formatCurrency(montoTotalDia)}
              </span>
            </button>

            {/* Tabla */}
            {isDiaExpanded && (
              <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-800/50">
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Método</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Monto</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Hora</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/30">
                    {movimientosDelDia.map((mov) => {
                      const config = getTipoConfig(mov.tipo);
                      const Icon = config.icon;
                      const movimientoHora = getLocalTimeString(mov.fecha);

                      return (
                        <tr
                          key={mov.id}
                          className="hover:bg-neutral-800/20 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Icon size={14} className={config.color} />
                              <span className={`text-xs ${config.color}`}>{config.label}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-white">{mov.descripcion}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-neutral-500">
                              {formatMetodoPago(mov.metodo_pago) || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-sm font-medium ${config.color}`}>
                              {mov.tipo === 'gasto' ? '-' : '+'}{formatCurrency(mov.monto)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-neutral-500">{movimientoHora}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onShowDetails(mov)}
                                className="p-1.5 text-neutral-600 hover:text-white transition-colors"
                              >
                                <Info size={14} />
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => onEditMovement(mov)}
                                    className="p-1.5 text-neutral-600 hover:text-blue-400 transition-colors"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => onDeleteMovement(mov)}
                                    className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 size={14} />
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
            )}
          </div>
        );
      })}

      {movimientos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-neutral-600">No hay movimientos</p>
        </div>
      )}
    </div>
  );
};

export default CajaMovementsList;