import React from 'react';
import { DollarSign, TrendingDown, CreditCard } from 'lucide-react';
import type { DashboardStats } from '../../hooks/useDashboard';

interface FinancialStatsProps {
  stats: DashboardStats | null;
  formatCurrency: (amount: number) => string;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({ stats, formatCurrency }) => {
  const financialItems = [
    {
      label: 'Total Acumulado',
      value: stats?.dinero_disponible || 0,
      icon: DollarSign,
      description: 'Saldo total del negocio',
      badge: 'Disponible',
      badgeColor: 'text-blue-400 bg-blue-500/10'
    },
    {
      label: 'Gastos del Mes',
      value: stats?.gastos_mes || 0,
      icon: TrendingDown,
      description: 'Mes actual',
      badge: 'Gastos',
      badgeColor: 'text-red-400 bg-red-500/10'
    },
    {
      label: 'Dinero Fiado',
      value: stats?.dinero_fiado_pendiente || 0,
      icon: CreditCard,
      description: 'Pendiente de pago',
      badge: 'Pendiente',
      badgeColor: 'text-orange-400 bg-orange-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-6 lg:mb-8">
      {financialItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div 
            key={index}
            className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/50 hover:border-neutral-700/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-neutral-500" strokeWidth={1.5} />
                <span className="text-xs text-neutral-500 font-medium">{item.label}</span>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                {item.badge}
              </span>
            </div>
            <p className="text-xl font-semibold text-white truncate mb-1">
              {formatCurrency(item.value)}
            </p>
            <p className="text-[10px] text-neutral-600">{item.description}</p>
          </div>
        );
      })}
    </div>
  );
};

export default FinancialStats;