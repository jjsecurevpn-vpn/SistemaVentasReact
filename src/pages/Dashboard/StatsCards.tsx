import React from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Calendar, Coins } from 'lucide-react';
import type { DashboardStats } from '../../hooks/useDashboard';

interface StatsCardsProps {
  stats: DashboardStats | null;
  formatCurrency: (amount: number) => string;
  meses: string[];
  mes: number;
  ultimoDiaMes: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, formatCurrency, meses, mes, ultimoDiaMes }) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8 w-full">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-all min-w-0 w-full">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Package className="text-blue-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Total Productos</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-200 leading-tight">{stats?.total_productos || 0}</p>
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Users className="text-green-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-neutral-500 mb-1">Total Clientes</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-200 leading-tight">{stats?.total_clientes || 0}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 hover:border-blue-500/30 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <ShoppingCart className="text-blue-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-blue-400/80 mb-1">Ventas Hoy</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400 leading-tight truncate">{formatCurrency(stats?.ventas_hoy || 0)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-4 hover:border-emerald-500/30 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Coins className="text-emerald-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-emerald-400/80 mb-1">Ganancia Hoy</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-400 leading-tight truncate">{formatCurrency(stats?.ganancia_hoy || 0)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500/5 to-green-600/5 border border-green-500/20 rounded-lg p-4 hover:border-green-500/30 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <TrendingUp className="text-green-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-green-400/80 mb-1">Ventas {meses[mes - 1]}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 truncate leading-tight">{formatCurrency(stats?.ventas_mes || 0)}</p>
          <div className="flex items-center gap-1 mt-1 sm:mt-2 md:mt-3 text-xs text-green-400/70 min-w-0">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">1 - {ultimoDiaMes} de {meses[mes - 1]}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/20 rounded-lg p-4 hover:border-amber-500/30 transition-all min-w-0">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Coins className="text-amber-400" size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-amber-400/80 mb-1">Ganancia {meses[mes - 1]}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400 truncate leading-tight">{formatCurrency(stats?.ganancia_mes || 0)}</p>
          <div className="flex items-center gap-1 mt-1 sm:mt-2 md:mt-3 text-xs text-amber-400/70 min-w-0">
            <Calendar size={12} className="sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">1 - {ultimoDiaMes} de {meses[mes - 1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;