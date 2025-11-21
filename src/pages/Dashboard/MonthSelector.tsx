import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
    <div className="mb-8 flex justify-center w-full box-border">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg bg-gradient-to-br from-blue-500/15 to-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 hover:border-blue-500/40 transition-all shadow-lg">
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <button
            onClick={onMesAnterior}
            className="p-2 sm:p-3 hover:bg-blue-500/25 rounded-lg transition-colors flex-shrink-0"
            title="Mes anterior"
          >
            <ChevronLeft size={24} className="sm:w-7 sm:h-7 text-blue-400" />
          </button>

          <div className="text-center flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2 md:mb-3">
              <Calendar size={18} className="sm:w-5.5 sm:h-5.5 md:w-5.5 md:h-5.5 text-blue-400" />
              <p className="text-xs font-semibold text-blue-400/80 tracking-wide">PERIODO</p>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-1 truncate">
              {meses[mes - 1]}
            </p>
            <p className="text-sm sm:text-base md:text-lg text-blue-400/70 font-medium">{año}</p>
          </div>

          <button
            onClick={onMesSiguiente}
            className="p-2 sm:p-3 hover:bg-blue-500/25 rounded-lg transition-colors flex-shrink-0"
            title="Mes siguiente"
          >
            <ChevronRight size={24} className="sm:w-7 sm:h-7 text-blue-400" />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={onMesActual}
            className="w-full mt-4 sm:mt-5 px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500/40 to-blue-600/30 hover:from-blue-500/50 hover:to-blue-600/40 text-blue-300 font-semibold rounded-lg transition-all text-sm"
          >
            Volver a Hoy
          </button>
        )}
      </div>
    </div>
  );
};

export default MonthSelector;