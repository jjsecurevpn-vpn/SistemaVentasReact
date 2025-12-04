import React from 'react';
import { Plus } from 'lucide-react';

interface CajaHeaderProps {
  isAdmin: boolean;
  onNewMovement: () => void;
}

const CajaHeader: React.FC<CajaHeaderProps> = ({ isAdmin, onNewMovement }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-lg font-semibold text-white">Caja</h1>
        <p className="text-xs text-neutral-600">Control de movimientos</p>
      </div>
      {isAdmin && (
        <button
          onClick={onNewMovement}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 rounded-lg text-black text-xs font-medium transition-colors"
        >
          <Plus size={14} />
          Movimiento
        </button>
      )}
    </div>
  );
};

export default CajaHeader;