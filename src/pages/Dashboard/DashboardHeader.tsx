import React from 'react';
import { formatTime, formatDate } from '../../utils/api';

interface DashboardHeaderProps {
  currentTime: Date;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentTime }) => {
  return (
    <div className="mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Resumen general del negocio</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/50 border border-neutral-800 rounded-lg">
            <span className="text-neutral-400 font-medium tabular-nums">
              {formatTime(currentTime.toISOString())}
            </span>
            <span className="w-px h-4 bg-neutral-700"></span>
            <span className="text-neutral-500 text-xs">
              {formatDate(currentTime.toISOString())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;