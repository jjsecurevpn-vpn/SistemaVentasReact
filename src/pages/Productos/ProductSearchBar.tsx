import React from "react";
import { Search, Filter } from "lucide-react";

interface ProductSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  stockFilter: "all" | "in-stock" | "low-stock" | "out-of-stock";
  onStockFilterChange: (filter: "all" | "in-stock" | "low-stock" | "out-of-stock") => void;
  isFilterDropdownOpen: boolean;
  onFilterDropdownToggle: () => void;
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
}

const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  search,
  onSearchChange,
  stockFilter,
  onStockFilterChange,
  isFilterDropdownOpen,
  onFilterDropdownToggle,
  totalProducts,
  outOfStockCount,
  lowStockCount,
}) => {
  return (
    <div className="mb-4 w-full">
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600"
          size={16} strokeWidth={1.5}
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 bg-neutral-900/60 border border-neutral-800/50 text-white text-sm rounded-xl placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
        />
        <button
          onClick={onFilterDropdownToggle}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${
            stockFilter !== "all"
              ? "text-white bg-neutral-700"
              : "text-neutral-600 hover:text-neutral-400"
          }`}
        >
          <Filter size={14} />
        </button>

        {/* Filter Dropdown */}
        {isFilterDropdownOpen && (
          <div className="filter-dropdown absolute right-0 top-full mt-2 w-44 bg-neutral-900 border border-neutral-800/50 rounded-xl shadow-xl overflow-hidden z-50">
            <div className="p-1.5">
              <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide mb-1 px-2 py-1">
                Filtrar por stock
              </div>
              <button
                onClick={() => {
                  onStockFilterChange("all");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                  stockFilter === "all"
                    ? "bg-white text-black font-medium"
                    : "text-neutral-400 hover:bg-neutral-800/50"
                }`}
              >
                Todos ({totalProducts})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("in-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                  stockFilter === "in-stock"
                    ? "bg-emerald-500 text-white font-medium"
                    : "text-neutral-400 hover:bg-neutral-800/50"
                }`}
              >
                Con Stock ({totalProducts - outOfStockCount - lowStockCount})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("low-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                  stockFilter === "low-stock"
                    ? "bg-amber-500 text-black font-medium"
                    : "text-neutral-400 hover:bg-neutral-800/50"
                }`}
              >
                Stock Bajo ({lowStockCount})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("out-of-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${
                  stockFilter === "out-of-stock"
                    ? "bg-red-500 text-white font-medium"
                    : "text-neutral-400 hover:bg-neutral-800/50"
                }`}
              >
                Sin Stock ({outOfStockCount})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearchBar;