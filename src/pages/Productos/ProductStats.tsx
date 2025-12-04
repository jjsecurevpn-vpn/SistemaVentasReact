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
  const stats = [
    { label: "Valor inventario", value: `$${totalStockValue.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: "text-white" },
    { label: "Total productos", value: totalProducts.toString(), color: "text-white" },
    { label: "Sin stock", value: outOfStockCount.toString(), color: outOfStockCount > 0 ? "text-red-400" : "text-white" },
    { label: "Stock bajo", value: lowStockCount.toString(), color: lowStockCount > 0 ? "text-amber-400" : "text-white" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl p-3">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">{stat.label}</p>
          <p className={`text-lg font-semibold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductStats;