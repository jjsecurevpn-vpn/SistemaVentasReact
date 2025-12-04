import React from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, User } from 'lucide-react';

interface CajaFiltersProps {
  showFilters: boolean;
  searchTerm: string;
  selectedTypes: string[];
  fechaDesde: string;
  fechaHasta: string;
  usuarioFilter: string;
  usuariosUnicos: string[];
  onToggleFilters: () => void;
  onSearchChange: (value: string) => void;
  onTypesChange: (values: string[]) => void;
  onFechaDesdeChange: (value: string) => void;
  onFechaHastaChange: (value: string) => void;
  onUsuarioFilterChange: (value: string) => void;
  onClearAllFilters: () => void;
  filteredCount: number;
  totalCount?: number;
}

const CajaFilters: React.FC<CajaFiltersProps> = ({
  showFilters,
  searchTerm,
  selectedTypes,
  fechaDesde,
  fechaHasta,
  usuarioFilter,
  usuariosUnicos,
  filteredCount,
  totalCount,
  onToggleFilters,
  onSearchChange,
  onTypesChange,
  onFechaDesdeChange,
  onFechaHastaChange,
  onUsuarioFilterChange,
  onClearAllFilters
}) => {
  const hasActiveFilters = searchTerm || selectedTypes.length > 0 || fechaDesde || fechaHasta || usuarioFilter;

  const allTypes = ['ingreso', 'gasto', 'fiado', 'pago_fiado'];
  const isAllSelected = allTypes.every(type => selectedTypes.includes(type));
  const displaySelectedTypes = isAllSelected ? ['todos'] : selectedTypes;

  const handleTypesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    onTypesChange(values);
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-white">Movimientos</h2>
            <p className="text-[10px] text-neutral-600">
              {filteredCount} {filteredCount === 1 ? 'resultado' : 'resultados'}
              {totalCount !== undefined && totalCount !== filteredCount && ` de ${totalCount}`}
            </p>
          </div>

          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              showFilters
                ? 'bg-white text-black'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Filter size={14} />
            Filtros
            {hasActiveFilters && !showFilters && (
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            )}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Panel colapsable */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-neutral-900/30 border border-neutral-800/50 border-t-0 rounded-b-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Buscador */}
            <div className="relative lg:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-colors"
              />
            </div>

            {/* Tipos */}
            <select
              multiple
              value={displaySelectedTypes}
              onChange={handleTypesChange}
              className="px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-700 h-20"
            >
              <option value="todos">Todos</option>
              <option value="ingreso">Ingreso</option>
              <option value="gasto">Gasto</option>
              <option value="fiado">Fiado</option>
              <option value="pago_fiado">Pago Fiado</option>
            </select>

            {/* Fechas */}
            <div className="space-y-2">
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-700"
              />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-700"
              />
            </div>

            {/* Usuario */}
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
              <select
                value={usuarioFilter}
                onChange={(e) => onUsuarioFilterChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-900/60 border border-neutral-800/50 rounded-lg text-white text-xs focus:outline-none focus:border-neutral-700"
              >
                <option value="">Todos</option>
                {usuariosUnicos.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <div className="flex justify-end mt-3 pt-3 border-t border-neutral-800/50">
              <button
                onClick={onClearAllFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <X size={14} />
                Limpiar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajaFilters;