import React from "react";
import { Plus } from "lucide-react";

interface ProductHeaderProps {
  isAdmin: boolean;
  onNewProduct: () => void;
  onNewPromo: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ isAdmin, onNewProduct, onNewPromo }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-200 mb-2">
          Gestión de Productos
        </h1>
        <p className="text-neutral-400 text-sm">Administra tu inventario</p>
      </div>
      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onNewPromo}
            className="flex items-center gap-2 rounded-lg border border-emerald-700/60 bg-emerald-600/10 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:border-emerald-500 hover:bg-emerald-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Nueva Promo</span>
          </button>
          <button
            onClick={onNewProduct}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 hover:border-neutral-500 hover:bg-neutral-700 transition-all"
          >
            <Plus size={16} />
            <span>Nuevo Producto</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductHeader;