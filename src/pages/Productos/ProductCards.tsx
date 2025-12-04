import React from "react";
import type { Product } from "../../utils/api";
import { Edit2, Trash2, FileText, StickyNote } from "lucide-react";
import { calcularGanancia, calcularMargen, getGananciaColorClass } from "../../utils/financialUtils";

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
    <div className="md:hidden space-y-2">
      {products.map((product) => {
        const ganancia = calcularGanancia(product.precio, product.precio_compra);
        const margen = calcularMargen(product.precio, product.precio_compra);
        
        return (
          <div
            key={product.id}
            className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white text-sm truncate">
                  {product.nombre}
                </h3>
                {product.descripcion && (
                  <p className="text-[11px] text-neutral-600 mt-0.5 truncate">
                    {product.descripcion}
                  </p>
                )}
              </div>
              <span
                className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium ${
                  product.stock === 0
                    ? "bg-red-500/10 text-red-400"
                    : product.stock < 5
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {product.stock}
              </span>
            </div>

            {/* Prices Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3 py-2 border-y border-neutral-800/30">
              <div>
                <p className="text-[10px] text-neutral-600">Costo</p>
                <p className="text-sm text-neutral-500">${product.precio_compra || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-600">Precio</p>
                <p className="text-sm text-emerald-400 font-medium">${product.precio}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-600">Ganancia</p>
                <p className={`text-sm font-medium ${getGananciaColorClass(ganancia)}`}>
                  ${ganancia.toFixed(0)}
                  {margen !== null && <span className="text-[10px] text-neutral-600 ml-0.5">({margen.toFixed(0)}%)</span>}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {product.descripcion && (
                  <button
                    onClick={() => onOpenModal("Descripción", product.descripcion!)}
                    className="p-1.5 text-neutral-600 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                  >
                    <FileText size={14} />
                  </button>
                )}
                {product.notas && (
                  <button
                    onClick={() => onOpenModal("Notas", product.notas!)}
                    className="p-1.5 text-neutral-600 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                  >
                    <StickyNote size={14} />
                  </button>
                )}
              </div>
              
              {isAdmin && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onEdit(product)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 rounded-lg transition-colors text-xs"
                  >
                    <Edit2 size={12} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-xs"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {products.length === 0 && (
        <div className="text-center py-12 text-neutral-600 text-sm">
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default ProductCards;