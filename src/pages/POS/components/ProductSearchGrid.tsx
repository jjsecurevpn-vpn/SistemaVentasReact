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
    <div className="flex-1 flex flex-col border-r border-neutral-800/50 overflow-hidden">
      {/* Search Bar */}
      <div className="border-b border-neutral-800/50 bg-[#0a0a0a] relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-600"
          size={16}
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3.5 text-sm bg-transparent text-white placeholder-neutral-600 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-neutral-700 border-t-neutral-400 mx-auto mb-3"></div>
              <p className="text-xs text-neutral-600">Cargando...</p>
            </div>
          </div>
        ) : (
          <div className="p-4 pb-40 md:pb-4">
            {showPrompt ? (
              <div className="text-center py-16 text-neutral-600">
                <Search className="mx-auto mb-3 opacity-30" size={32} />
                <p className="text-sm">Busca productos para agregar</p>
              </div>
            ) : (
              <div>
                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {filteredProducts.map((product) => {
                    const quantityInCart = getUnitsInCart(product.id);
                    const remainingStock = getRemainingStock(product.id);

                    return (
                      <button
                        key={product.id}
                        onClick={() => onAddToCart(product)}
                        disabled={remainingStock === 0}
                        className="group relative bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800/50 hover:border-neutral-700/50 rounded-xl p-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                      >
                        {/* Stock Badge */}
                        <div className="absolute top-2 right-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              remainingStock === 0
                                ? "bg-red-500/20 text-red-400"
                                : remainingStock < 5
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-neutral-800/80 text-neutral-500"
                            }`}
                          >
                            {remainingStock}
                          </span>
                        </div>

                        <div className="pr-6">
                          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2 leading-tight">
                            {product.nombre}
                          </h3>
                          <p className="text-emerald-400 font-semibold text-base">
                            ${product.precio}
                          </p>
                          {quantityInCart > 0 && (
                            <p className="text-[10px] text-blue-400 mt-1">
                              {quantityInCart} en carrito
                            </p>
                          )}
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="bg-white text-black p-1.5 rounded-full">
                            <Plus size={14} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Promos Section */}
                {filteredPromos.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-neutral-500">
                      <Gift size={14} />
                      <span>Promociones</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filteredPromos.map((promo) => {
                        const combosDisponibles = getPromoAvailability(promo);
                        const disabled = combosDisponibles <= 0;
                        return (
                          <button
                            key={promo.id}
                            onClick={() => onAddPromo(promo)}
                            disabled={disabled}
                            className={`relative text-left border rounded-xl p-4 transition-all ${
                              disabled
                                ? "border-neutral-800/50 bg-neutral-900/20 opacity-40"
                                : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">
                                Promo
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-400">
                                {combosDisponibles > 0 ? `${combosDisponibles} disp.` : "Sin stock"}
                              </span>
                            </div>
                            <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                              {promo.nombre}
                            </h3>
                            <p className="text-emerald-400 text-lg font-semibold mb-2">
                              ${promo.precio_promocional.toFixed(2)}
                            </p>
                            <ul className="space-y-0.5 text-xs text-neutral-500 mb-3">
                              {promo.promo_productos?.map((item) => (
                                <li key={`${promo.id}-${item.producto_id}`}>
                                  ×{item.cantidad} {item.producto?.nombre || `Producto #${item.producto_id}`}
                                </li>
                              ))}
                            </ul>
                            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-black bg-emerald-400 rounded-lg py-1.5">
                              <Plus size={12} />
                              Agregar
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {filteredProducts.length === 0 && filteredPromos.length === 0 && (
                  <div className="text-center py-16 text-neutral-600">
                    <ShoppingCart className="mx-auto mb-3 opacity-30" size={32} />
                    <p className="text-sm">Sin resultados</p>
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
