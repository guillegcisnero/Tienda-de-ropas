import React, { memo } from 'react';
import { RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
  availableSizes?: string[];
}

export const FiltersBar = memo<FiltersBarProps>(({
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount,
  availableSizes = []
}) => {
  const isFiltered = 
    filters.category !== 'all' || 
    filters.gender !== 'all' || 
    filters.size !== 'all' || 
    filters.condition !== 'all' || 
    filters.search !== '' || 
    filters.sort !== 'featured';

  // Opciones dinámicas de sexo / género según la categoría activa
  const genderOptions = React.useMemo(() => {
    if (filters.category === 'adultos') {
      return [
        { id: 'all', label: 'Todos los sexos' },
        { id: 'mujer', label: 'Mujer' },
        { id: 'hombre', label: 'Hombre' },
        { id: 'unisex', label: 'Unisex' }
      ];
    }
    if (filters.category === 'ninos') {
      return [
        { id: 'all', label: 'Todos los sexos' },
        { id: 'nena', label: 'Nena' },
        { id: 'nene', label: 'Nene' },
        { id: 'unisex', label: 'Unisex' }
      ];
    }
    return [
      { id: 'all', label: 'Todos los sexos' },
      { id: 'mujer', label: 'Mujer / Nena' },
      { id: 'hombre', label: 'Hombre / Nene' },
      { id: 'unisex', label: 'Unisex' }
    ];
  }, [filters.category]);

  return (
    <div className="bg-[#55443e]/80 backdrop-blur-md border-b border-white/10 sticky top-20 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
          
          {/* Categories Pills (Nunca se cortan gracias a shrink-0 y overflow suave) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 xl:pb-0 scrollbar-none shrink-0">
            {[
              { id: 'all', label: 'Todas las prendas' },
              { id: 'adultos', label: 'Ropa para adultos' },
              { id: 'ninos', label: 'Ropa para niños' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  filters.category === cat.id
                    ? 'bg-[#EA8A8A] text-[#2c221e] shadow-md font-bold'
                    : 'text-[#EBD5D5]/90 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Select Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs sm:text-sm">
            
            {/* Sexo / Género Select */}
            <select
              value={filters.gender}
              onChange={(e) => onFilterChange({ gender: e.target.value })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-xl px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
              title="Filtrar por sexo"
            >
              {genderOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>

            {/* Size Select (Dinámico) */}
            <select
              value={filters.size}
              onChange={(e) => onFilterChange({ size: e.target.value })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-xl px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
              title="Filtrar por talle"
            >
              <option value="all">Todos los talles</option>
              {availableSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>

            {/* Condition Select */}
            <select
              value={filters.condition}
              onChange={(e) => onFilterChange({ condition: e.target.value })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-xl px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
              title="Filtrar por estado"
            >
              <option value="all">Cualquier estado</option>
              <option value="10/10">10/10 (Como nuevo / Con etiqueta)</option>
              <option value="9.5/10">9.5/10 (Impecable)</option>
              <option value="9/10">9/10 (Excelente)</option>
              <option value="8/10">8/10 (Muy bueno)</option>
            </select>

            {/* Sort Order */}
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value as FilterState['sort'] })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-xl px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
              title="Ordenar catálogo"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor precio</option>
              <option value="price-desc">Mayor precio</option>
              <option value="newest">Más recientes</option>
            </select>

            {/* Reset Filters Button */}
            {isFiltered && (
              <button
                onClick={onResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#EA8A8A] hover:text-white bg-[#EA8A8A]/10 hover:bg-[#EA8A8A]/20 rounded-xl border border-[#EA8A8A]/30 transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}

            <span className="text-xs text-[#EBD5D5]/60 pl-1 font-medium whitespace-nowrap">
              {totalProductsCount} {totalProductsCount === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
});

FiltersBar.displayName = 'FiltersBar';
