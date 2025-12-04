import React from 'react';
import { MdTrendingUp, MdTrendingDown, MdAccountBalanceWallet } from 'react-icons/md';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Row 1 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 md:p-6 hover:border-neutral-700 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <MdTrendingUp className="text-green-500 text-xl sm:text-2xl flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-300">Ingresos</h3>
        </div>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 truncate">{formatCurrency(ingresos)}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 md:p-6 hover:border-neutral-700 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <MdTrendingDown className="text-red-500 text-xl sm:text-2xl flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-300">Gastos</h3>
        </div>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-400 truncate">{formatCurrency(gastos)}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 md:p-6 hover:border-neutral-700 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <MdAccountBalanceWallet className="text-blue-500 text-xl sm:text-2xl flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-300">Fiado</h3>
        </div>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 truncate">{formatCurrency(dineroFiado)}</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 md:p-6 hover:border-neutral-700 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <MdTrendingUp className="text-amber-500 text-xl sm:text-2xl flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-300">Pagos Fiado</h3>
        </div>
        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400 truncate">{formatCurrency(pagosFiado)}</p>
      </div>

      {/* Row 2 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 md:p-6 hover:border-neutral-700 transition-colors md:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3 mb-2">
          <MdAccountBalanceWallet className={`text-xl sm:text-2xl flex-shrink-0 ${dineroDisponible >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-300">Disponible</h3>
        </div>
        <p className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${dineroDisponible >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatCurrency(dineroDisponible)}
        </p>
        <p className="text-[11px] sm:text-xs text-neutral-500 mt-2 truncate">
          Pendiente: {formatCurrency(dineroPendienteFiado)}
        </p>
      </div>
    </div>
  );
};

export default CajaStats;