import React from "react";
import type { Product } from "../../utils/api";
import { Edit2, Trash2, FileText, StickyNote } from "lucide-react";
import { calcularGanancia, calcularMargen, getGananciaColorClass } from "../../utils/financialUtils";

interface ProductTableProps {
  products: Product[];
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onOpenModal: (title: string, content: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isAdmin,
  onEdit,
  onDelete,
  onOpenModal,
}) => {
  return (
    <div className="hidden md:block bg-neutral-900/40 border border-neutral-800/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-800/50">
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Ganancia
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Info
              </th>
              <th className="px-4 py-3 text-right text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/30">
            {products.map((product) => {
              const ganancia = calcularGanancia(product.precio, product.precio_compra);
              const margen = calcularMargen(product.precio, product.precio_compra);
              
              return (
                <tr
                  key={product.id}
                  className="hover:bg-neutral-800/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white text-sm truncate">
                      {product.nombre}
                    </div>
                    {product.descripcion && (
                      <div className="text-xs text-neutral-600 mt-0.5 truncate max-w-xs">
                        {product.descripcion}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-neutral-500 text-sm">
                      ${product.precio_compra || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-medium text-sm">
                      ${product.precio}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className={`font-medium text-sm ${getGananciaColorClass(ganancia)}`}>
                        ${ganancia.toFixed(2)}
                      </span>
                      {margen !== null && (
                        <span className="text-[10px] text-neutral-600">
                          {margen.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                        product.stock === 0
                          ? "bg-red-500/10 text-red-400"
                          : product.stock < 5
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {product.descripcion && (
                        <button
                          onClick={() =>
                            onOpenModal("Descripción", product.descripcion!)
                          }
                          className="p-1.5 text-neutral-600 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          title="Ver descripción"
                        >
                          <FileText size={14} />
                        </button>
                      )}
                      {product.notas && (
                        <button
                          onClick={() =>
                            onOpenModal("Notas", product.notas!)
                          }
                          className="p-1.5 text-neutral-600 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          title="Ver notas"
                        >
                          <StickyNote size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => onEdit(product)}
                            className="p-1.5 text-neutral-600 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(product.id)}
                            className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <span className="text-neutral-700 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-neutral-600 text-sm">
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default ProductTable;