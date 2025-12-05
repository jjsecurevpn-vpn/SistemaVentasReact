import React from 'react';
import { X, Package, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Coins, AlertTriangle, Receipt } from 'lucide-react';
import type { DetallesDelDia } from '../../hooks/useDashboard';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  detalles: DetallesDelDia | null;
  fechaLabel: string;
  formatCurrency: (amount: number) => string;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  detalles,
  fechaLabel,
  formatCurrency,
}) => {
  if (!isOpen) return null;

  const hasData = detalles && detalles.productos.length > 0;
  const hayProductosSinCosto = detalles?.productos.some(p => p.sinPrecioCosto);

  return (
    <div 
      className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-xl bg-neutral-900 border-t sm:border border-neutral-800 sm:rounded-2xl flex flex-col max-h-[95vh] sm:max-h-[85vh] sm:m-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Receipt size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Detalles del Día</h3>
              <p className="text-xs text-neutral-500">{fechaLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!hasData ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={28} className="text-neutral-600" />
              </div>
              <p className="text-neutral-400 font-medium">Sin ventas</p>
              <p className="text-neutral-600 text-sm mt-1">No hay ventas registradas este día</p>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              
              {/* Stats Grid - Resumen principal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart size={16} className="text-blue-400" />
                    <span className="text-xs text-blue-300/70 font-medium">Transacciones</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{detalles.cantidad_ventas}</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-purple-400" />
                    <span className="text-xs text-purple-300/70 font-medium">Productos</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{detalles.cantidad_productos_vendidos}</p>
                </div>
                
                <div className="bg-gradient-to-br from-sky-500/10 to-cyan-600/5 border border-sky-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={16} className="text-sky-400" />
                    <span className="text-xs text-sky-300/70 font-medium">Total Ventas</span>
                  </div>
                  <p className="text-xl font-bold text-sky-400">{formatCurrency(detalles.total_ventas)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-600/5 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins size={16} className="text-emerald-400" />
                    <span className="text-xs text-emerald-300/70 font-medium">Ganancia Neta</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(detalles.total_ganancia)}</p>
                </div>
              </div>

              {/* Fórmula de cálculo */}
              <div className="bg-neutral-800/40 rounded-2xl p-4 border border-neutral-700/50">
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium mb-3">Desglose de Ganancia</p>
                
                {/* Móvil: Stack vertical */}
                <div className="sm:hidden space-y-2">
                  <div className="flex items-center justify-between py-2 px-3 bg-sky-500/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-sky-400" />
                      <span className="text-sm text-sky-300">Ingresos</span>
                    </div>
                    <span className="text-sm font-semibold text-sky-400">{formatCurrency(detalles.total_ventas_con_costo)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-red-500/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={14} className="text-red-400" />
                      <span className="text-sm text-red-300">Costos</span>
                    </div>
                    <span className="text-sm font-semibold text-red-400">- {formatCurrency(detalles.total_costo)}</span>
                  </div>
                  
                  <div className="h-px bg-neutral-700 my-1" />
                  
                  <div className="flex items-center justify-between py-2 px-3 bg-emerald-500/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Coins size={14} className="text-emerald-400" />
                      <span className="text-sm text-emerald-300 font-medium">Ganancia</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{formatCurrency(detalles.total_ganancia)}</span>
                  </div>
                </div>
                
                {/* Desktop: Horizontal */}
                <div className="hidden sm:flex items-center justify-center gap-3">
                  <div className="flex items-center gap-2 bg-sky-500/10 text-sky-400 px-4 py-2 rounded-xl">
                    <TrendingUp size={16} />
                    <span className="text-sm font-semibold">{formatCurrency(detalles.total_ventas_con_costo)}</span>
                  </div>
                  <span className="text-neutral-600 text-lg">−</span>
                  <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl">
                    <TrendingDown size={16} />
                    <span className="text-sm font-semibold">{formatCurrency(detalles.total_costo)}</span>
                  </div>
                  <span className="text-neutral-600 text-lg">=</span>
                  <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl">
                    <Coins size={16} />
                    <span className="text-sm font-bold">{formatCurrency(detalles.total_ganancia)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de productos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                    Productos Vendidos
                  </p>
                  <span className="text-[11px] text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded-full">
                    {detalles.productos.length} items
                  </span>
                </div>
                
                <div className="space-y-2">
                  {detalles.productos.map((producto) => (
                    <div 
                      key={producto.id} 
                      className={`bg-neutral-800/50 rounded-xl p-4 border transition-colors ${
                        producto.sinPrecioCosto 
                          ? 'border-amber-500/30 bg-amber-500/5' 
                          : 'border-neutral-700/50 hover:border-neutral-600/50'
                      }`}
                    >
                      {/* Nombre y cantidad */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {producto.sinPrecioCosto && (
                            <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
                          )}
                          <span className="font-medium text-white truncate">
                            {producto.nombre}
                          </span>
                        </div>
                        <span className="text-xs bg-neutral-700/50 text-neutral-300 px-2 py-1 rounded-lg flex-shrink-0">
                          ×{producto.cantidad}
                        </span>
                      </div>
                      
                      {/* Detalles financieros */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-2 bg-neutral-900/50 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase mb-1">Venta</p>
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(producto.subtotal)}
                          </p>
                        </div>
                        
                        <div className="text-center p-2 bg-neutral-900/50 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase mb-1">Costo</p>
                          <p className={`text-sm font-semibold ${
                            producto.sinPrecioCosto ? 'text-amber-500' : 'text-red-400'
                          }`}>
                            {producto.sinPrecioCosto ? '—' : formatCurrency(producto.costo_total)}
                          </p>
                        </div>
                        
                        <div className="text-center p-2 bg-neutral-900/50 rounded-lg">
                          <p className="text-[10px] text-neutral-500 uppercase mb-1">Ganancia</p>
                          <p className={`text-sm font-semibold ${
                            producto.sinPrecioCosto 
                              ? 'text-amber-500' 
                              : producto.ganancia >= 0 
                                ? 'text-emerald-400' 
                                : 'text-red-400'
                          }`}>
                            {producto.sinPrecioCosto ? '—' : formatCurrency(producto.ganancia)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota informativa */}
              {hayProductosSinCosto && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-200/80 leading-relaxed">
                    <p className="font-medium text-amber-300 mb-1">Productos sin costo asignado</p>
                    <p className="text-amber-200/60 text-xs">
                      Los productos marcados no tienen precio de costo registrado. 
                      Se incluyen en el total de ventas pero no en el cálculo de ganancia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer con totales - Solo móvil */}
        {hasData && (
          <div className="sm:hidden border-t border-neutral-800 px-5 py-4 bg-neutral-900/95 backdrop-blur flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">Ganancia Total</p>
                <p className={`text-xl font-bold ${detalles.total_ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(detalles.total_ganancia)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayDetailsModal;
