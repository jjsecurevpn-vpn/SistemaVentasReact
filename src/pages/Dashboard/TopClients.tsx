import React from 'react';
import { Users } from 'lucide-react';
import type { ClienteTop } from '../../hooks/useDashboard';

interface TopClientsProps {
  clientesTop: ClienteTop[];
  formatCurrency: (amount: number) => string;
  meses: string[];
  mes: number;
  año: number;
}

const TopClients: React.FC<TopClientsProps> = ({ clientesTop, formatCurrency, meses, mes, año }) => {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Users className="text-green-400" size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-200">Clientes Top</h2>
            <p className="text-xs text-neutral-500 mt-1">{meses[mes - 1]} {año}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-neutral-800">
        {clientesTop.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-neutral-500">
            No hay datos disponibles
          </div>
        ) : (
          clientesTop.slice(0, 5).map((cliente, index) => (
            <div key={cliente.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 text-green-400 font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 font-medium truncate">
                      {cliente.nombre} {cliente.apellido || ''}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                      {cliente.total_compras_fiadas} compras fiadas
                    </p>
                  </div>
                </div>
                <div className="text-right ml-3 sm:ml-4 flex-shrink-0">
                  <p className="text-blue-400 font-semibold truncate">{formatCurrency(cliente.total_comprado)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopClients;