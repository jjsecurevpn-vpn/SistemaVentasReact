import React from 'react';
import { Award } from 'lucide-react';
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Award className="text-blue-400" size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-neutral-200">Productos Más Vendidos</h2>
            <p className="text-xs text-neutral-500 mt-1">{meses[mes - 1]} {año}</p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-neutral-800">
        {productosVendidos.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-neutral-500">
            No hay datos disponibles
          </div>
        ) : (
          productosVendidos.slice(0, 5).map((producto, index) => (
            <div key={producto.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-neutral-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-400 font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-neutral-200 font-medium truncate">{producto.nombre}</p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                      {producto.total_vendido} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right ml-3 sm:ml-4 flex-shrink-0">
                  <p className="text-green-400 font-semibold truncate">{formatCurrency(producto.total_ingresos)}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    Ganancia: {formatCurrency(producto.ganancia)}
                  </p>
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