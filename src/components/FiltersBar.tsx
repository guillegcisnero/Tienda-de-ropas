import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface FiltersBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalProductsCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalProductsCount
}) => {
  const isFiltered = filters.category !== 'all' || filters.size !== 'all' || filters.condition !== 'all' || filters.search !== '';

  return (
    <div className="bg-[#55443e]/60 backdrop-blur-sm border-b border-white/10 sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Categories Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todas las Prendas' },
              { id: 'Urbana', label: 'Moda Urbana & Vintage' },
              { id: 'Infantil', label: 'Moda Infantil & Bebés' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: cat.id })}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  filters.category === cat.id
                    ? 'bg-[#EA8A8A] text-[#2c221e] shadow-sm'
                    : 'text-[#EBD5D5]/80 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Secondary Select Filters */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
            
            {/* Size Select */}
            <select
              value={filters.size}
              onChange={(e) => onFilterChange({ size: e.target.value })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-lg px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
            >
              <option value="all">Todos los talles</option>
              <option value="Talle 2 (24 Meses)">Talle 2 (24M)</option>
              <option value="Talle 4">Talle 4</option>
              <option value="Talle 6">Talle 6</option>
              <option value="Talle 8">Talle 8</option>
              <option value="Talle 12-18M">Talle 12-18M</option>
              <option value="Oversize M">Oversize M</option>
              <option value="Talle 40 (M)">Talle 40 (M)</option>
              <option value="Talle L">Talle L</option>
              <option value="Talle XL">Talle XL</option>
            </select>

            {/* Condition Select */}
            <select
              value={filters.condition}
              onChange={(e) => onFilterChange({ condition: e.target.value })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-lg px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
            >
              <option value="all">Cualquier estado</option>
              <option value="10/10">10/10 (Como nuevo / Con etiqueta)</option>
              <option value="9/10">9/10 (Excelente)</option>
              <option value="8/10">8/10 (Muy bueno)</option>
            </select>

            {/* Sort Order */}
            <select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value as FilterState['sort'] })}
              className="bg-[#55443e] text-[#EBD5D5] border border-white/15 rounded-lg px-3 py-2 focus:border-[#EA8A8A] focus:outline-none"
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
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#EA8A8A] hover:text-white bg-[#EA8A8A]/10 hover:bg-[#EA8A8A]/20 rounded-lg border border-[#EA8A8A]/30 transition-colors cursor-pointer"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}

            <span className="text-xs text-[#EBD5D5]/60 pl-2">
              {totalProductsCount} {totalProductsCount === 1 ? 'prenda' : 'prendas'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
