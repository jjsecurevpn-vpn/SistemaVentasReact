import React, { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  email: string;
}

interface Movimiento {
  id?: number;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  usuario_id: string;
  venta_id?: number;
  cliente_id?: number;
  metodo_pago?: string;
  notas?: string;
  usuario?: {
    id: string;
    email: string;
  };
  cliente?: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  venta?: {
    id: number;
    total: number;
    fecha: string;
    productos: Array<{
      producto_id: number;
      nombre: string;
      cantidad: number;
      subtotal: number;
    }>;
  };
}

interface MovementFormData {
  tipo: string;
  descripcion: string;
  monto: number;
  usuario_id: string;
  metodo_pago: string | null;
}

interface CajaMovementFormProps {
  isOpen: boolean;
  movimiento: Movimiento | null;
  onClose: () => void;
  onSave: (movimiento: MovementFormData & { fecha: string }) => void;
  currentUserId: string;
}

const CajaMovementForm: React.FC<CajaMovementFormProps> = ({
  isOpen,
  movimiento,
  onClose,
  onSave,
  currentUserId
}) => {
  const [formData, setFormData] = useState<MovementFormData>({
    tipo: 'ingreso',
    descripcion: '',
    monto: 0,
    usuario_id: currentUserId,
    metodo_pago: null
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Cargar usuarios disponibles
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        // Obtener IDs de roles admin y cajero
        const { data: roles, error: rolesError } = await supabase
          .from('roles')
          .select('id, name')
          .in('name', ['admin', 'cajero']);

        if (rolesError) throw rolesError;

        const adminRoleId = roles?.find(r => r.name === 'admin')?.id;
        const cajeroRoleId = roles?.find(r => r.name === 'cajero')?.id;

        if (adminRoleId || cajeroRoleId) {
          // Obtener user_ids de user_roles
          const roleIds = [adminRoleId, cajeroRoleId].filter(Boolean);
          const { data: userRoles, error: userRolesError } = await supabase
            .from('user_roles')
            .select('user_id')
            .in('role_id', roleIds);

          if (userRolesError) throw userRolesError;

          const userIds = userRoles?.map(ur => ur.user_id) || [];

          if (userIds.length > 0) {
            // Obtener detalles de usuarios de auth.users
            const { data: users, error: usersError } = await supabase
              .from('auth.users')
              .select('id, email')
              .in('id', userIds);

            if (usersError) throw usersError;
            setAvailableUsers(users || []);
          } else {
            setAvailableUsers([]);
          }
        } else {
          setAvailableUsers([]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback: usar solo el usuario actual si hay error
        setAvailableUsers(currentUserId ? [{ id: currentUserId, email: 'Usuario actual' }] : []);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, currentUserId]);

  useEffect(() => {
    if (movimiento) {
      setFormData({
        tipo: movimiento.tipo,
        descripcion: movimiento.descripcion,
        monto: movimiento.monto,
        usuario_id: movimiento.usuario_id,
        metodo_pago: movimiento.metodo_pago || null
      });
    } else {
      setFormData({
        tipo: 'ingreso',
        descripcion: '',
        monto: 0,
        usuario_id: currentUserId,
        metodo_pago: null
      });
    }
  }, [movimiento, currentUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Agregar la fecha actual al enviar
    const movementDataWithDate = {
      ...formData,
      fecha: new Date().toISOString(),
      metodo_pago: formData.metodo_pago || null
    };
    onSave(movementDataWithDate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monto'
        ? parseFloat(value) || 0
        : name === 'metodo_pago'
          ? (value === '' ? null : value)
          : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 pt-20 pb-8">
        <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
            <h2 className="text-sm font-medium text-white">
              {movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-neutral-500 hover:text-white transition-colors"
            >
              <MdClose size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 resize-none transition-colors"
                rows={3}
                placeholder="Descripción del movimiento..."
                required
              />
            </div>

            {/* Grid 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 transition-colors"
                  required
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                  <option value="fiado">Fiado</option>
                  <option value="pago_fiado">Pago Fiado</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                  Monto
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 transition-colors"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Grid 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                  Método de Pago
                </label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 transition-colors"
                >
                  <option value="">Seleccionar</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider">
                  Usuario
                </label>
                <select
                  name="usuario_id"
                  value={formData.usuario_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700 transition-colors"
                  required
                  disabled={loadingUsers}
                >
                  {loadingUsers ? (
                    <option>Cargando...</option>
                  ) : (
                    availableUsers.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Acciones */}
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
                className="flex-1 px-4 py-2 bg-white hover:bg-neutral-200 rounded-lg text-black text-sm font-medium transition-colors"
              >
                {movimiento ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CajaMovementForm;