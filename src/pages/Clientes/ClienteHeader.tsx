import React from 'react';
import type { Cliente } from '../../hooks/useClientes';

interface ClienteHeaderProps {
  selectedCliente: Cliente | null;
  onOpenBottomSheet: () => void;
  onAddCliente: () => void;
  onPayAll: () => void;
}

const ClienteHeader: React.FC<ClienteHeaderProps> = ({
  selectedCliente,
  onOpenBottomSheet,
  onAddCliente,
  onPayAll,
}) => {
  return (
    <div className="md:hidden bg-[#0a0a0a] border-b border-neutral-800/50 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onOpenBottomSheet}
        className="p-2 hover:bg-neutral-800/50 rounded-lg transition-colors text-neutral-400"
        aria-label="Abrir lista de clientes"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M4 12H20M4 8H20M4 16H12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {selectedCliente && (selectedCliente as any).deuda > 0 && (
          <button
            onClick={onPayAll}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            aria-label="Pagar todo"
          >
            Pagar
          </button>
        )}

        <button
          onClick={onAddCliente}
          className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 transition-colors"
          aria-label="Nuevo cliente"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>
    </div>
  );
};

export default ClienteHeader;