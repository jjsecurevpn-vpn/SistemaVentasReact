import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthSelectorProps {
  mes: number;
  año: number;
  meses: string[];
  isCurrentMonth: boolean;
  onMesAnterior: () => void;
  onMesSiguiente: () => void;
  onMesActual: () => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({
  mes,
  año,
  meses,
  isCurrentMonth,
  onMesAnterior,
  onMesSiguiente,
  onMesActual
}) => {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex items-center justify-between sm:justify-start gap-4 pb-4 border-b border-neutral-800/50">
        <div className="flex items-center gap-1">
          <button
            onClick={onMesAnterior}
            className="p-2 hover:bg-neutral-800/50 rounded-md transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft size={18} className="text-neutral-400" />
          </button>
          
          <div className="flex items-baseline gap-2 px-3">
            <span className="text-lg font-medium text-white">{meses[mes - 1]}</span>
            <span className="text-sm text-neutral-500">{año}</span>
          </div>

          <button
            onClick={onMesSiguiente}
            className="p-2 hover:bg-neutral-800/50 rounded-md transition-colors"
            title="Mes siguiente"
          >
            <ChevronRight size={18} className="text-neutral-400" />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={onMesActual}
            className="text-xs font-medium text-neutral-400 hover:text-white px-3 py-1.5 hover:bg-neutral-800/50 rounded-md transition-colors"
          >
            Hoy
          </button>
        )}
      </div>
    </div>
  );
};

export default MonthSelector;