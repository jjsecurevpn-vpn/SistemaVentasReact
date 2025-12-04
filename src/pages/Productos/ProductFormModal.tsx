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
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                onFormDataChange({ ...formData, nombre: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Stock *
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                onFormDataChange({ ...formData, stock: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Precio de Compra (Costo)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_compra}
              onChange={(e) =>
                onFormDataChange({ ...formData, precio_compra: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">
              Precio de Venta *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.precio}
              onChange={(e) =>
                onFormDataChange({ ...formData, precio: e.target.value })
              }
              className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          {/* Mostrar ganancia calculada */}
          {formData.precio && formData.precio_compra && (
            <div className="md:col-span-2">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="text-sm text-green-400">
                  <span className="font-medium">Ganancia por unidad:</span>{" "}
                  <span className="font-bold">
                    ${(parseFloat(formData.precio || "0") - parseFloat(formData.precio_compra || "0")).toFixed(2)}
                  </span>
                  {parseFloat(formData.precio_compra || "0") > 0 && (
                    <span className="text-green-400/70 ml-2">
                      ({(((parseFloat(formData.precio || "0") - parseFloat(formData.precio_compra || "0")) / parseFloat(formData.precio_compra || "1")) * 100).toFixed(1)}% de margen)
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">
            Descripción
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) =>
              onFormDataChange({ ...formData, descripcion: e.target.value })
            }
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            rows={3}
            placeholder="Descripción del producto (opcional)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">
            Notas
          </label>
          <textarea
            value={formData.notas}
            onChange={(e) =>
              onFormDataChange({ ...formData, notas: e.target.value })
            }
            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-200 p-3 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            rows={3}
            placeholder="Notas adicionales (opcional)"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            {isEditing ? "Actualizar" : "Crear Producto"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;