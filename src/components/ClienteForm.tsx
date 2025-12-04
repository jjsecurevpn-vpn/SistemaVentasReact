import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { supabase } from '../lib/supabase';
import { useNotification } from '../hooks/useNotification';

interface Cliente {
  id?: string | number;
  nombre: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  notas?: string;
}

interface ClienteFormProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente;
  onSave: () => void;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ isOpen, onClose, cliente, onSave }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState<Cliente>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    notas: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData(cliente);
    } else {
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
        notas: ''
      });
    }
  }, [cliente]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (cliente?.id) {
        // Actualizar cliente existente
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', cliente.id);
        
        if (error) throw error;
        showNotification('Cliente actualizado exitosamente', 'success');
      } else {
        // Crear nuevo cliente
        const { error } = await supabase
          .from('clientes')
          .insert(formData);
        
        if (error) throw error;
        showNotification('Cliente creado exitosamente', 'success');
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar el cliente', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            Teléfono
          </label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono || ''}
            onChange={handleChange}
            className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            Dirección
          </label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion || ''}
            onChange={handleChange}
            className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            Notas
          </label>
          <textarea
            name="notas"
            value={formData.notas || ''}
            onChange={handleChange}
            rows={2}
            className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neutral-700 transition-colors resize-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
          >
            {cliente ? 'Guardar' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClienteForm;