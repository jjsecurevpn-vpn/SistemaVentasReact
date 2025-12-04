import React from 'react';
import { MdAdd } from 'react-icons/md';

interface CajaHeaderProps {
  isAdmin: boolean;
  onNewMovement: () => void;
}

const CajaHeader: React.FC<CajaHeaderProps> = ({ isAdmin, onNewMovement }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-xl sm:text-2xl font-bold text-neutral-200">Control de Caja</h1>
      {isAdmin && (
        <button
          onClick={onNewMovement}
          className="w-full sm:w-auto flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs sm:text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-700 transition-all"
        >
          <MdAdd className="text-base sm:text-lg" />
          Nuevo Movimiento
        </button>
      )}
    </div>
  );
};

export default CajaHeader;