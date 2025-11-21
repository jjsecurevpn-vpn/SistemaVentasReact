import React from "react";
import type { Product } from "../../utils/api";
import { Edit2, Trash2, FileText, StickyNote } from "lucide-react";

interface ProductCardsProps {
  products: Product[];
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onOpenModal: (title: string, content: string) => void;
}

const ProductCards: React.FC<ProductCardsProps> = ({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onOpenModal,
}) => {
  return (
    <div className="md:hidden space-y-3 w-full box-border">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 w-full"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-200 truncate">
                {product.nombre}
              </h3>
              {product.descripcion && (
                <p className="text-xs sm:text-sm text-neutral-500 mt-1 truncate">
                  {product.descripcion}
                </p>
              )}
            </div>
            <span
              className={`ml-2 inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                product.stock === 0
                  ? "bg-red-900/50 text-red-400"
                  : product.stock < 5
                  ? "bg-yellow-900/50 text-yellow-400"
                  : "bg-green-900/50 text-green-400"
              }`}
            >
              {product.stock}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-base sm:text-lg font-bold text-green-400">
              ${product.precio}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              {product.descripcion && (
                <button
                  onClick={() =>
                    onOpenModal("Descripción", product.descripcion!)
                  }
                  className="p-1 sm:p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <FileText size={16} />
                </button>
              )}
              {product.notas && (
                <button
                  onClick={() => onOpenModal("Notas", product.notas!)}
                  className="p-1 sm:p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <StickyNote size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                >
                  <Edit2 size={14} />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm"
                >
                  <Trash2 size={14} />
                  <span>Eliminar</span>
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500 p-2">
                <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-neutral-800 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <line
                      x1="5"
                      y1="5"
                      x2="19"
                      y2="19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
      {products.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default ProductCards;