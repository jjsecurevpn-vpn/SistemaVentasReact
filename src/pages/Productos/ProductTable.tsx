import React from "react";
import type { Product } from "../../utils/api";
import { Edit2, Trash2, FileText, StickyNote } from "lucide-react";

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
    <div className="hidden md:block bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden w-full box-border">
      <div className="overflow-x-auto w-full box-border">
        <table className="w-full border-collapse box-border">
          <thead className="bg-neutral-800/50 border-b border-neutral-800">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Info
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-neutral-800/30 border-b border-neutral-800"
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="font-medium text-neutral-200 truncate">
                    {product.nombre}
                  </div>
                  {product.descripcion && (
                    <div className="text-sm text-neutral-500 mt-1 truncate max-w-xs">
                      {product.descripcion}
                    </div>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <span className="text-green-400 font-semibold">
                    ${product.precio}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                      product.stock === 0
                        ? "bg-red-900/50 text-red-400"
                        : product.stock < 5
                        ? "bg-yellow-900/50 text-yellow-400"
                        : "bg-green-900/50 text-green-400"
                    }`}
                  >
                    {product.stock} unidades
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    {product.descripcion && (
                      <button
                        onClick={() =>
                          onOpenModal("Descripción", product.descripcion!)
                        }
                        className="text-neutral-400 hover:text-blue-400"
                        title="Ver descripción"
                      >
                        <FileText size={16} />
                      </button>
                    )}
                    {product.notas && (
                      <button
                        onClick={() =>
                          onOpenModal("Notas", product.notas!)
                        }
                        className="text-neutral-400 hover:text-blue-400"
                        title="Ver notas"
                      >
                        <StickyNote size={16} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin ? (
                      <>
                        <button
                          onClick={() => onEdit(product)}
                          className="p-1 sm:p-2 text-neutral-400 hover:text-blue-400 hover:bg-neutral-800 rounded-lg"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(product.id)}
                          className="p-1 sm:p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : (
                      <div
                        title="Sin permisos"
                        className="text-neutral-500 p-1 sm:p-2"
                      >
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && (
        <div className="text-center py-12 text-neutral-500">
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default ProductTable;