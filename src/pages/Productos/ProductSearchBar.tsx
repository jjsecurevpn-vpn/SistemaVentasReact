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
    <div className="mb-6 w-full">
      <div className="relative w-full">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
          size={18} strokeWidth={1.5}
        />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-12 py-2.5 sm:py-3 bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-lg placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          onClick={onFilterDropdownToggle}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
            stockFilter !== "all"
              ? "text-blue-400"
              : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Filter size={16} />
        </button>

        {/* Filter Dropdown */}
        {isFilterDropdownOpen && (
          <div className="filter-dropdown absolute right-0 top-full mt-1 w-44 sm:w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2 px-2">
                Filtrar por stock
              </div>
              <button
                onClick={() => {
                  onStockFilterChange("all");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                  stockFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Todos ({totalProducts})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("in-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                  stockFilter === "in-stock"
                    ? "bg-green-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Con Stock ({totalProducts - outOfStockCount - lowStockCount})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("low-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                  stockFilter === "low-stock"
                    ? "bg-yellow-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Stock Bajo ({lowStockCount})
              </button>
              <button
                onClick={() => {
                  onStockFilterChange("out-of-stock");
                  onFilterDropdownToggle();
                }}
                className={`w-full text-left px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                  stockFilter === "out-of-stock"
                    ? "bg-red-600 text-white"
                    : "text-neutral-300 hover:bg-neutral-700"
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