import React from "react";
import { Search, ShoppingCart, Plus, X } from "lucide-react";
import type { Product } from "../../../utils/api";
import type { CartItem } from "../../../hooks/useSales";

interface ProductSearchGridProps {
  search: string;
  onSearchChange: (value: string) => void;
  productsLoading: boolean;
  filteredProducts: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
}

const ProductSearchGrid: React.FC<ProductSearchGridProps> = ({
  search,
  onSearchChange,
  productsLoading,
  filteredProducts,
  cart,
  onAddToCart,
}) => {
  const showPrompt = search.trim() === "";

  const getQuantityInCart = (productId: number) =>
    cart.find((item) => item.product.id === productId)?.quantity ?? 0;

  return (
    <div className="flex-1 flex flex-col border-r border-neutral-800 overflow-hidden">
      <div className="border-b border-neutral-800 bg-neutral-900 relative">
        <Search
          className="absolute left-3 md:left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 z-10"
          size={18}
        />
        <input
          type="text"
          placeholder="Escribe para buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-9 py-4 text-sm border-0 bg-neutral-900 md:bg-[#181818] text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors z-10"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {productsLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-neutral-500">Cargando...</p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4">
            {showPrompt ? (
              <div className="text-center py-12 text-neutral-500">
                <ShoppingCart className="mx-auto mb-3 opacity-50" size={48} />
                <p>Escribe para buscar productos</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                  {filteredProducts.map((product) => {
                    const quantityInCart = getQuantityInCart(product.id);
                    const remainingStock = Math.max(product.stock - quantityInCart, 0);

                    return (
                      <button
                        key={product.id}
                        onClick={() => onAddToCart(product)}
                        disabled={remainingStock === 0}
                        className="group relative bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg p-3 md:p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      >
                        <div className="absolute top-2 right-2">
                          <span
                            className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full font-medium ${
                              remainingStock === 0
                                ? "bg-red-900/50 text-red-400"
                                : remainingStock < 5
                                ? "bg-yellow-900/50 text-yellow-400"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {remainingStock}
                          </span>
                        </div>

                        <div className="pr-8">
                          <h3 className="font-semibold text-neutral-200 text-sm md:text-base mb-1 line-clamp-2">
                            {product.nombre}
                          </h3>
                          <p className="text-green-400 font-bold text-base md:text-lg">
                            ${product.precio}
                          </p>
                          {quantityInCart > 0 && (
                            <p className="text-[11px] md:text-xs text-blue-400 mt-0.5">
                              En carrito: {quantityInCart}
                            </p>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-blue-600 text-white p-2 rounded-full">
                            <Plus size={20} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    <ShoppingCart className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No se encontraron productos</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearchGrid;
