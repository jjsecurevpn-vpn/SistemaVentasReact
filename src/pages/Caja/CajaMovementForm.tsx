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
    <div className="fixed inset-0 z-[11000] bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 pt-24 sm:pt-28 md:pt-32 pb-12">
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-5xl xl:max-w-6xl shadow-2xl max-h-[calc(100vh-6rem)] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-5 sm:p-6 border-b border-neutral-800">
          <h2 className="text-base sm:text-lg font-semibold text-neutral-200">
            {movimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)]">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
            <div className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 sm:py-2.5 border border-neutral-700 bg-neutral-800 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Descripción del movimiento..."
                  required
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                    Tipo
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-neutral-700 bg-neutral-800 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                    <option value="fiado">Fiado</option>
                    <option value="pago_fiado">Pago Fiado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago ?? ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-neutral-700 bg-neutral-800 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                    Monto
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-neutral-700 bg-neutral-800 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-300 mb-1">
                    Usuario Responsable
                  </label>
                  <select
                    name="usuario_id"
                    value={formData.usuario_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:py-2.5 border border-neutral-700 bg-neutral-800 text-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={loadingUsers}
                  >
                    {loadingUsers ? (
                      <option>Cargando usuarios...</option>
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
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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