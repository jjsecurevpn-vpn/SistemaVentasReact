import React from "react";
import { Search, ShoppingCart, Plus, X, Gift } from "lucide-react";
import type { Product, Promo } from "../../../utils/api";

interface ProductSearchGridProps {
  search: string;
  onSearchChange: (value: string) => void;
  productsLoading: boolean;
  promosLoading: boolean;
  filteredProducts: Product[];
  filteredPromos: Promo[];
  onAddToCart: (product: Product) => void;
  onAddPromo: (promo: Promo) => void;
  getRemainingStock: (productId: number) => number;
  getUnitsInCart: (productId: number) => number;
  getPromoAvailability: (promo: Promo) => number;
}

const ProductSearchGrid: React.FC<ProductSearchGridProps> = ({
  search,
  onSearchChange,
  productsLoading,
  promosLoading,
  filteredProducts,
  filteredPromos,
  onAddToCart,
  onAddPromo,
  getRemainingStock,
  getUnitsInCart,
  getPromoAvailability,
}) => {
  const showPrompt = search.trim() === "";
  const isLoading = productsLoading || promosLoading;

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

      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-sm text-neutral-500">Cargando...</p>
            </div>
          </div>
        ) : (
          <div className="p-3 md:p-4 pb-40 md:pb-4">
            {showPrompt ? (
              <div className="text-center py-12 text-neutral-500">
                <ShoppingCart className="mx-auto mb-3 opacity-50" size={48} />
                <p>Escribe para buscar productos</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                  {filteredProducts.map((product) => {
                    const quantityInCart = getUnitsInCart(product.id);
                    const remainingStock = getRemainingStock(product.id);

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

                {filteredPromos.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3 text-sm text-emerald-300">
                      <Gift size={16} />
                      <span>Promos disponibles</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredPromos.map((promo) => {
                        const combosDisponibles = getPromoAvailability(promo);
                        const disabled = combosDisponibles <= 0;
                        return (
                          <button
                            key={promo.id}
                            onClick={() => onAddPromo(promo)}
                            disabled={disabled}
                            className={`relative text-left border rounded-xl p-4 bg-gradient-to-br from-emerald-600/5 to-neutral-900 hover:border-emerald-500/40 transition-all ${
                              disabled
                                ? "border-neutral-800 text-neutral-500"
                                : "border-emerald-600/30 hover:bg-emerald-600/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                Promo
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-900/60 border border-neutral-700 text-neutral-300">
                                {combosDisponibles > 0
                                  ? `${combosDisponibles} disp.`
                                  : "Sin stock"}
                              </span>
                            </div>
                            <h3 className="font-semibold text-neutral-100 text-lg mb-1 line-clamp-2">
                              {promo.nombre}
                            </h3>
                            <p className="text-emerald-400 text-xl font-bold mb-3">
                              ${promo.precio_promocional.toFixed(2)}
                            </p>
                            <ul className="space-y-1 text-sm text-neutral-400 mb-4">
                              {promo.promo_productos?.map((item) => (
                                <li key={`${promo.id}-${item.producto_id}`}>
                                  ×{item.cantidad} - {item.producto?.nombre || `Producto #${item.producto_id}`}
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-neutral-900 bg-emerald-400 rounded-lg py-1.5">
                              <Plus size={16} />
                              Agregar promo
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredProducts.length === 0 && filteredPromos.length === 0 && (
                  <div className="text-center py-12 text-neutral-500">
                    <ShoppingCart className="mx-auto mb-3 opacity-50" size={48} />
                    <p>No se encontraron resultados</p>
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
