import React from "react";

interface ProductStatsProps {
  totalStockValue: number;
  totalProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
}

const ProductStats: React.FC<ProductStatsProps> = ({
  totalStockValue,
  totalProducts,
  outOfStockCount,
  lowStockCount,
}) => {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 hover:border-neutral-700 transition-colors">
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
          Valor Total
        </div>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-200">
          ${totalStockValue.toFixed(2)}
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 hover:border-neutral-700 transition-colors">
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
          Total Productos
        </div>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
          {totalProducts}
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 hover:border-neutral-700 transition-colors">
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
          Sin Stock
        </div>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-400">
          {outOfStockCount}
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 hover:border-neutral-700 transition-colors">
        <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
          Stock Bajo
        </div>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400">
          {lowStockCount}
        </p>
      </div>
    </div>
  );
};

export default ProductStats;