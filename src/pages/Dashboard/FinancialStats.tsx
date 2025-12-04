import React from 'react';
import { DollarSign, TrendingDown, CreditCard } from 'lucide-react';
import type { DashboardStats } from '../../hooks/useDashboard';

interface FinancialStatsProps {
  stats: DashboardStats | null;
  formatCurrency: (amount: number) => string;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ stats, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8 w-full">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-all min-w-0 w-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="text-blue-400" size={24} strokeWidth={1.5} />
          </div>
          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
            Disponible
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Total Acumulado</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-200 truncate">{formatCurrency(stats?.dinero_disponible || 0)}</p>
          <p className="text-xs text-neutral-600 mt-2">Saldo total del negocio</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <TrendingDown className="text-red-400" size={24} strokeWidth={1.5} />
          </div>
          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
            Gastos
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Total Mes</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-200 truncate">{formatCurrency(stats?.gastos_mes || 0)}</p>
          <p className="text-xs text-neutral-600 mt-2">Mes actual</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <CreditCard className="text-orange-400" size={24} strokeWidth={1.5} />
          </div>
          <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
            Pendiente
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Dinero Fiado</p>
          <p className="text-xl sm:text-2xl font-bold text-neutral-200 truncate">{formatCurrency(stats?.dinero_fiado_pendiente || 0)}</p>
          <p className="text-xs text-neutral-600 mt-2">Pendiente de pago</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialStats;