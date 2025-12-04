import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { ProductoVendido } from '../../hooks/useDashboard';

interface TopProductsProps {
  productosVendidos: ProductoVendido[];
  formatCurrency: (amount: number) => string;
  meses: string[];
  mes: number;
  año: number;
}

const TopProducts: React.FC<TopProductsProps> = ({ productosVendidos, formatCurrency, meses, mes, año }) => {
  return (
    <div className="rounded-xl bg-neutral-900/40 border border-neutral-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-neutral-500" strokeWidth={1.5} />
            <h2 className="text-sm font-medium text-white">Productos Más Vendidos</h2>
          </div>
          <span className="text-xs text-neutral-500">{meses[mes - 1]} {año}</span>
        </div>
      </div>
      
      <div className="divide-y divide-neutral-800/30">
        {productosVendidos.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-neutral-500">Sin datos disponibles</p>
          </div>
        ) : (
          productosVendidos.slice(0, 5).map((producto, index) => (
            <div key={producto.id} className="px-4 py-3 hover:bg-neutral-800/20 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-medium text-neutral-600 w-5">{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{producto.nombre}</p>
                    <p className="text-xs text-neutral-500">{producto.total_vendido} uds</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-white">{formatCurrency(producto.total_ingresos)}</p>
                  <p className="text-xs text-emerald-500">+{formatCurrency(producto.ganancia)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopProducts;