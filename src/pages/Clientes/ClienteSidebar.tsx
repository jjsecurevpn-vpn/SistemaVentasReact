import React from 'react';
import { formatCurrency } from '../../utils/api';
import type { Cliente } from '../../hooks/useClientes';
import { useAuth } from '../../hooks/useAuth';

interface ClienteSidebarProps {
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
  onAddCliente: () => void;
  onEditCliente: (cliente: Cliente) => void;
  onDeleteCliente: (cliente: Cliente) => void;
}

const ClienteSidebar: React.FC<ClienteSidebarProps> = ({
  clientes,
  selectedCliente,
  onSelectCliente,
  onAddCliente,
  onEditCliente,
  onDeleteCliente,
}) => {
  const { isAdmin } = useAuth();
  return (
    <div className="hidden md:flex md:w-72 md:border-r md:border-neutral-800/50 md:flex-col bg-[#0a0a0a]">
      <div className="p-4 border-b border-neutral-800/50 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-medium text-white">Clientes</h2>
          <p className="text-xs text-neutral-600">{clientes.length} registrados</p>
        </div>
        <button
          onClick={onAddCliente}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {clientes.map((cliente) => {
          const isSelected = selectedCliente?.id === cliente.id;
          return (
            <div
              key={cliente.id}
              onClick={() => onSelectCliente(cliente)}
              className={`px-4 py-3 border-b border-neutral-800/30 hover:bg-neutral-800/30 transition-colors flex justify-between items-start cursor-pointer ${
                isSelected ? 'bg-neutral-800/40 border-l-2 border-l-white' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm truncate ${isSelected ? 'text-white font-medium' : 'text-neutral-400'}`}>
                  {cliente.nombre}
                </h3>
                {cliente.telefono && (
                  <p className="text-xs text-neutral-600 truncate">{cliente.telefono}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 ml-2">
                {cliente.deuda && cliente.deuda > 0 && (
                  <span className="text-xs font-medium text-red-400">
                    {formatCurrency(cliente.deuda)}
                  </span>
                )}
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditCliente(cliente); }}
                      className="p-1 text-neutral-600 hover:text-white transition-colors text-xs"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteCliente(cliente); }}
                      className="p-1 text-neutral-600 hover:text-red-400 transition-colors text-xs"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClienteSidebar;