import React from 'react';
import { formatTime, formatDate } from '../../utils/api';

interface DashboardHeaderProps {
  currentTime: Date;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentTime }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-200 mb-1">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Resumen general de tu negocio</p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-center md:text-right">
            <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-blue-400">
              {formatTime(currentTime.toISOString())}
            </div>
            <div className="text-xs text-neutral-500">
              {formatDate(currentTime.toISOString())}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;