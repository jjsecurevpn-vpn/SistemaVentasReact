import React from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Coins } from 'lucide-react';
import type { DashboardStats } from '../../hooks/useDashboard';

interface StatsCardsProps {
  stats: DashboardStats | null;
  formatCurrency: (amount: number) => string;
  meses: string[];
  mes: number;
  ultimoDiaMes: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, formatCurrency, meses, mes, ultimoDiaMes }) => {
  const statItems = [
    {
      label: 'Productos',
      value: stats?.total_productos || 0,
      icon: Package,
      format: 'number'
    },
    {
      label: 'Clientes',
      value: stats?.total_clientes || 0,
      icon: Users,
      format: 'number'
    },
    {
      label: 'Ventas Hoy',
      value: stats?.ventas_hoy || 0,
      icon: ShoppingCart,
      format: 'currency',
      highlight: true
    },
    {
      label: 'Ganancia Hoy',
      value: stats?.ganancia_hoy || 0,
      icon: Coins,
      format: 'currency',
      accent: 'emerald'
    },
    {
      label: `Ventas ${meses[mes - 1]}`,
      value: stats?.ventas_mes || 0,
      icon: TrendingUp,
      format: 'currency',
      subtitle: `1 - ${ultimoDiaMes}`
    },
    {
      label: `Ganancia ${meses[mes - 1]}`,
      value: stats?.ganancia_mes || 0,
      icon: Coins,
      format: 'currency',
      subtitle: `1 - ${ultimoDiaMes}`,
      accent: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-8">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const displayValue = item.format === 'currency' 
          ? formatCurrency(item.value as number) 
          : item.value;
        
        return (
          <div 
            key={index}
            className={`
              relative p-4 rounded-xl border transition-all
              ${item.highlight 
                ? 'bg-neutral-900/80 border-neutral-700/50' 
                : 'bg-neutral-900/40 border-neutral-800/50 hover:border-neutral-700/50'
              }
            `}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon 
                size={16} 
                className={`
                  ${item.accent === 'emerald' ? 'text-emerald-500' : ''}
                  ${item.accent === 'amber' ? 'text-amber-500' : ''}
                  ${!item.accent ? 'text-neutral-500' : ''}
                `} 
                strokeWidth={1.5} 
              />
              <span className="text-xs text-neutral-500 font-medium">{item.label}</span>
            </div>
            <p className={`
              text-lg sm:text-xl font-semibold truncate
              ${item.accent === 'emerald' ? 'text-emerald-400' : ''}
              ${item.accent === 'amber' ? 'text-amber-400' : ''}
              ${!item.accent ? 'text-white' : ''}
            `}>
              {displayValue}
            </p>
            {item.subtitle && (
              <p className="text-[10px] text-neutral-600 mt-1">{item.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;