import React from 'react';
import { MdSearch, MdFilterList, MdClear, MdExpandMore, MdExpandLess, MdCalendarToday, MdPerson, MdCategory } from 'react-icons/md';

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

  // Determinar qué opciones mostrar como seleccionadas
  const allTypes = ['ingreso', 'gasto', 'fiado', 'pago_fiado'];
  const isAllSelected = allTypes.every(type => selectedTypes.includes(type));
  const displaySelectedTypes = isAllSelected ? ['todos'] : selectedTypes;

  const handleTypesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => option.value);
    onTypesChange(values);
  };

  return (
    <div className="mb-6">
      {/* Header minimalista con botón colapsable */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 sm:px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-100">
              Movimientos de caja
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              {filteredCount} {filteredCount === 1 ? 'resultado' : 'resultados'}
              {totalCount !== undefined && totalCount !== filteredCount && ` de ${totalCount}`}
            </p>
          </div>

          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <MdFilterList size={17} />
            Filtros
            {hasActiveFilters && <span className="ml-1.5 w-2 h-2 bg-white rounded-full animate-pulse" />}
            {showFilters ? <MdExpandLess size={18} /> : <MdExpandMore size={18} />}
          </button>
        </div>
      </div>

      {/* Panel colapsable con animación suave */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-neutral-900/70 border border-neutral-800/70 rounded-xl mt-3 p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Buscador */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base sm:text-lg" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar descripción, cliente o producto..."
                className="w-full pl-9 pr-3 sm:pr-4 py-2 bg-neutral-800/70 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>

            {/* Tipos */}
            <div className="relative">
              <MdCategory className="absolute left-3 top-3 text-neutral-500 text-sm" />
              <select
                multiple
                value={displaySelectedTypes}
                onChange={handleTypesChange}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-lg text-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-24 sm:h-28 scrollbar-thin scrollbar-thumb-neutral-600"
              >
                <option value="todos">🔄 Todos</option>
                <option value="ingreso">💰 Ingreso</option>
                <option value="gasto">📤 Gasto</option>
                <option value="fiado">📝 Fiado</option>
                <option value="pago_fiado">✅ Pago Fiado</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => onFechaDesdeChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-lg text-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="relative">
              <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => onFechaHastaChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-lg text-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              />
            </div>

            {/* Usuario */}
            <div className="relative">
              <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <select
                value={usuarioFilter}
                onChange={(e) => onUsuarioFilterChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-800/70 border border-neutral-700 rounded-lg text-neutral-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Todos los usuarios</option>
                {usuariosUnicos.map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Limpiar filtros (solo si hay activos) */}
          {hasActiveFilters && (
            <div className="flex justify-end mt-4 sm:mt-5 pt-4 border-t border-neutral-700">
              <button
                onClick={onClearAllFilters}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-400 hover:bg-red-600/20 rounded-lg transition-all"
              >
                <MdClear className="text-sm sm:text-base" />
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CajaFilters;