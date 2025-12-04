import React from 'react';
import { formatCurrency } from '../../utils/api';

interface CajaStatsProps {
  ingresos: number;
  gastos: number;
  dineroFiado: number;
  pagosFiado: number;
  dineroDisponible: number;
  dineroPendienteFiado: number;
}

const CajaStats: React.FC<CajaStatsProps> = ({
  ingresos,
  gastos,
  dineroFiado,
  pagosFiado,
  dineroDisponible,
  dineroPendienteFiado
}) => {
  const stats = [
    { label: 'Ingresos', value: ingresos, color: 'text-emerald-500' },
    { label: 'Gastos', value: gastos, color: 'text-red-400' },
    { label: 'Fiado', value: dineroFiado, color: 'text-amber-500' },
    { label: 'Pagos Fiado', value: pagosFiado, color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3"
          >
            <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-lg font-semibold ${stat.color}`}>
              {formatCurrency(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Disponible Card */}
      <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
              Disponible en Caja
            </p>
            <p className={`text-2xl font-semibold ${dineroDisponible >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {formatCurrency(dineroDisponible)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-neutral-600">Pendiente</p>
            <p className="text-sm text-amber-500">{formatCurrency(dineroPendienteFiado)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CajaStats;