import React from 'react';
import { formatCurrency } from '../../utils/api';
import type { Cliente } from '../../hooks/useClientes';

interface ClientListBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  clientes: Cliente[];
  selectedCliente: Cliente | null;
  onSelectCliente: (cliente: Cliente) => void;
}

const ClientListBottomSheet: React.FC<ClientListBottomSheetProps> = ({
  isOpen,
  onClose,
  clientes,
  selectedCliente,
  onSelectCliente,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-neutral-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } max-h-[80vh] rounded-t-2xl overflow-hidden`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-neutral-700 rounded-full"></div>
        </div>
        
        {/* Header */}
        <div className="px-4 pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-medium text-white">Seleccionar Cliente</h2>
            <p className="text-xs text-neutral-600">{clientes.length} clientes</p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-600 hover:text-white p-1.5 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] border-t border-neutral-800/50">
          {clientes.map((cliente) => {
            const isSelected = selectedCliente?.id === cliente.id;
            return (
              <div
                key={cliente.id}
                className={`px-4 py-3 border-b border-neutral-800/30 active:bg-neutral-800/50 transition-colors flex justify-between items-center ${
                  isSelected ? 'bg-neutral-800/40' : ''
                }`}
                onClick={() => { onSelectCliente(cliente); onClose(); }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm truncate ${isSelected ? 'text-white font-medium' : 'text-neutral-300'}`}>
                    {cliente.nombre}
                  </h3>
                  {cliente.telefono && (
                    <p className="text-xs text-neutral-600">{cliente.telefono}</p>
                  )}
                </div>
                {cliente.deuda && cliente.deuda > 0 && (
                  <span className="text-xs font-medium text-red-400 ml-2">
                    {formatCurrency(cliente.deuda)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ClientListBottomSheet;
