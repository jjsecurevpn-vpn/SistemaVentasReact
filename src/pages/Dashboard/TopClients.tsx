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
    <div className="rounded-xl bg-neutral-900/40 border border-neutral-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-neutral-500" strokeWidth={1.5} />
            <h2 className="text-sm font-medium text-white">Clientes Top</h2>
          </div>
          <span className="text-xs text-neutral-500">{meses[mes - 1]} {año}</span>
        </div>
      </div>
      
      <div className="divide-y divide-neutral-800/30">
        {clientesTop.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-neutral-500">Sin datos disponibles</p>
          </div>
        ) : (
          clientesTop.slice(0, 5).map((cliente, index) => (
            <div key={cliente.id} className="px-4 py-3 hover:bg-neutral-800/20 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-medium text-neutral-600 w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {cliente.nombre} {cliente.apellido || ''}
                    </p>
                    <p className="text-xs text-neutral-500">{cliente.total_compras_fiadas} compras</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-white">{formatCurrency(cliente.total_comprado)}</p>
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