import React from "react";
import { Plus } from "lucide-react";

interface ProductHeaderProps {
  isAdmin: boolean;
  onNewProduct: () => void;
  onNewPromo: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ isAdmin, onNewProduct, onNewPromo }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-white">Productos</h1>
        <p className="text-neutral-500 text-xs mt-0.5">Gestiona tu inventario</p>
      </div>
      {isAdmin && (
        <div className="flex gap-2">
          <button
            onClick={onNewPromo}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            <Plus size={14} />
            <span>Promo</span>
          </button>
          <button
            onClick={onNewProduct}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-200 transition-colors"
          >
            <Plus size={14} />
            <span>Producto</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductHeader;