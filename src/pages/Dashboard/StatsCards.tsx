import React from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Coins, ChevronLeft, ChevronRight, Calendar, Loader2, Info } from 'lucide-react';
import type { DashboardStats } from '../../hooks/useDashboard';
import { getTodayString } from '../../hooks/useDateUtils';

interface StatsCardsProps {
  stats: DashboardStats | null;
  formatCurrency: (amount: number) => string;
  meses: string[];
  mes: number;
  año: number;
  ultimoDiaMes: number;
  fechaDia: string;
  onFechaDiaChange: (fecha: string) => void;
  loadingUpdate?: boolean;
  onShowDayDetails?: () => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, formatCurrency, meses, mes, año, ultimoDiaMes, fechaDia, onFechaDiaChange, loadingUpdate = false, onShowDayDetails }) => {
  const hoy = getTodayString();
  const esHoy = fechaDia === hoy;
  
  // Calcular límites del mes seleccionado
  const primerDiaMes = `${año}-${String(mes).padStart(2, '0')}-01`;
  const ultimoDiaMesStr = `${año}-${String(mes).padStart(2, '0')}-${String(ultimoDiaMes).padStart(2, '0')}`;
  
  // Verificar si podemos ir al día anterior (no salir del mes)
  const puedeIrAnterior = fechaDia > primerDiaMes;
  
  // Verificar si podemos ir al día siguiente (no salir del mes y no ir al futuro)
  const puedeIrSiguiente = fechaDia < ultimoDiaMesStr && fechaDia < hoy;

  // Formatear fecha para mostrar
  const formatearFechaMostrar = (fechaStr: string): string => {
    const [year, month, day] = fechaStr.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${diasSemana[fecha.getDay()]} ${day}/${month}`;
  };

  // Navegar al día anterior
  const handleDiaAnterior = () => {
    if (!puedeIrAnterior) return;
    const [year, month, day] = fechaDia.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    fecha.setDate(fecha.getDate() - 1);
    const nuevaFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    onFechaDiaChange(nuevaFecha);
  };

  // Navegar al día siguiente
  const handleDiaSiguiente = () => {
    if (!puedeIrSiguiente) return;
    const [year, month, day] = fechaDia.split('-').map(Number);
    const fecha = new Date(year, month - 1, day);
    fecha.setDate(fecha.getDate() + 1);
    const nuevaFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    onFechaDiaChange(nuevaFecha);
  };

  // Volver a hoy
  const handleIrAHoy = () => {
    onFechaDiaChange(hoy);
  };

  const labelDia = esHoy ? 'Hoy' : formatearFechaMostrar(fechaDia);
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
      label: `Ventas ${labelDia}`,
      value: stats?.ventas_hoy || 0,
      icon: ShoppingCart,
      format: 'currency',
      highlight: true,
      hasDateSelector: true,
      showDetailsButton: true
    },
    {
      label: `Ganancia ${labelDia}`,
      value: stats?.ganancia_hoy || 0,
      icon: Coins,
      format: 'currency',
      accent: 'emerald',
      hasDateSelector: true,
      showDetailsButton: true
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
    <div className="mb-6 lg:mb-8">
      {/* Selector de fecha para estadísticas diarias */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={handleDiaAnterior}
          disabled={!puedeIrAnterior}
          className={`p-1.5 rounded-lg transition-all ${
            !puedeIrAnterior 
              ? 'bg-neutral-800/30 text-neutral-600 cursor-not-allowed' 
              : 'bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white'
          }`}
          title="Día anterior"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800/50 min-w-[140px] justify-center">
          <Calendar size={14} className="text-neutral-500" />
          <span className="text-sm font-medium text-neutral-300">
            {esHoy ? 'Hoy' : formatearFechaMostrar(fechaDia)}
          </span>
        </div>

        <button
          onClick={handleDiaSiguiente}
          disabled={!puedeIrSiguiente}
          className={`p-1.5 rounded-lg transition-all ${
            !puedeIrSiguiente 
              ? 'bg-neutral-800/30 text-neutral-600 cursor-not-allowed' 
              : 'bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white'
          }`}
          title="Día siguiente"
        >
          <ChevronRight size={18} />
        </button>

        {!esHoy && (
          <button
            onClick={handleIrAHoy}
            className="ml-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
          >
            Ir a Hoy
          </button>
        )}
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          const displayValue = item.format === 'currency' 
            ? formatCurrency(item.value as number) 
            : item.value;
          
          // Mostrar loading solo en tarjetas dinámicas (día y mes)
          const showLoading = loadingUpdate && item.format === 'currency';
          
          return (
            <div 
              key={index}
              className={`
                relative p-4 rounded-xl border transition-all
                ${item.highlight 
                  ? 'bg-neutral-900/80 border-neutral-700/50' 
                  : 'bg-neutral-900/40 border-neutral-800/50 hover:border-neutral-700/50'
                }
                ${item.hasDateSelector && !esHoy ? 'ring-1 ring-blue-500/30' : ''}
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
                <span className="text-xs text-neutral-500 font-medium truncate flex-1">{item.label}</span>
                {showLoading && (
                  <Loader2 size={12} className="animate-spin text-neutral-500" />
                )}
                {item.showDetailsButton && onShowDayDetails && !showLoading && (
                  <button
                    onClick={onShowDayDetails}
                    className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-700/50 transition-all"
                    title="Ver detalles"
                  >
                    <Info size={14} />
                  </button>
                )}
              </div>
              <p className={`
                text-lg sm:text-xl font-semibold truncate transition-opacity
                ${item.accent === 'emerald' ? 'text-emerald-400' : ''}
                ${item.accent === 'amber' ? 'text-amber-400' : ''}
                ${!item.accent ? 'text-white' : ''}
                ${showLoading ? 'opacity-50' : 'opacity-100'}
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
    </div>
  );
};

export default StatsCards;