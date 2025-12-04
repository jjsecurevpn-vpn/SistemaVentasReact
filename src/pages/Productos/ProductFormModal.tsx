import React from "react";
import Modal from "../../components/Modal";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  formData: {
    nombre: string;
    precio: string;
    precio_compra: string;
    stock: string;
    descripcion: string;
    notas: string;
  };
  onFormDataChange: (data: {
    nombre: string;
    precio: string;
    precio_compra: string;
    stock: string;
    descripcion: string;
    notas: string;
  }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  formData,
  onFormDataChange,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Producto" : "Nuevo Producto"}
      size="md"
    >
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Nombre */}
        <div>
          <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              onFormDataChange({ ...formData, nombre: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
            required
          />
        </div>

        {/* Stock y Costo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                onFormDataChange({ ...formData, stock: e.target.value })
              }
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
              Costo
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_compra}
              onChange={(e) =>
                onFormDataChange({ ...formData, precio_compra: e.target.value })
              }
              className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Precio venta */}
        <div>
          <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
            Precio venta *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.precio}
            onChange={(e) =>
              onFormDataChange({ ...formData, precio: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
            required
          />
        </div>

        {/* Ganancia calculada */}
        {formData.precio && formData.precio_compra && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <p className="text-xs text-emerald-400">
              <span className="text-emerald-400/70">Ganancia:</span>{" "}
              <span className="font-semibold">
                ${(parseFloat(formData.precio || "0") - parseFloat(formData.precio_compra || "0")).toFixed(2)}
              </span>
              {parseFloat(formData.precio_compra || "0") > 0 && (
                <span className="text-emerald-400/60 ml-1.5">
                  ({(((parseFloat(formData.precio || "0") - parseFloat(formData.precio_compra || "0")) / parseFloat(formData.precio_compra || "1")) * 100).toFixed(0)}%)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              onFormDataChange({ ...formData, descripcion: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors resize-none"
            rows={2}
            placeholder="Opcional"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-[10px] font-medium text-neutral-600 uppercase tracking-wider mb-1">
            Notas
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) =>
              onFormDataChange({ ...formData, notas: e.target.value })
            }
            className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors resize-none"
            rows={2}
            placeholder="Opcional"
          />
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
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;