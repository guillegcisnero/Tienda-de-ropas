import { useState, useMemo, useCallback } from 'react';
import { Product, FilterState } from '../types';
import { useDebounce } from './useDebounce';

const INITIAL_FILTERS: FilterState = {
  category: 'all',
  gender: 'all',
  size: 'all',
  condition: 'all',
  search: '',
  sort: 'featured'
};

export function useCatalogFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Debounce exclusivo para el término de búsqueda
  const debouncedSearch = useDebounce(filters.search, 250);

  // Extracción dinámica de talles únicos a partir del catálogo filtrado por categoría si corresponde
  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    products.forEach(p => {
      if (p.size) sizeSet.add(p.size);
    });
    return Array.from(sizeSet).sort();
  }, [products]);

  // Filtrado y ordenamiento memoizado
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Filtro de Categoría Principal
      if (filters.category !== 'all') {
        const cat = (p.category || '').toLowerCase();
        if (filters.category === 'adultos') {
          if (cat !== 'adultos' && cat !== 'urbana') return false;
        } else if (filters.category === 'ninos') {
          if (cat !== 'ninos' && cat !== 'infantil') return false;
        } else if (filters.category === 'accesorios') {
          if (cat !== 'accesorios' && cat !== 'accesorio') return false;
        } else if (cat !== filters.category) {
          return false;
        }
      }

      // 2. Filtro de Sexo / Género
      if (filters.gender !== 'all') {
        const pGender = (p.gender || '').toLowerCase();
        // Si la prenda es 'unisex', coincide con cualquier género
        if (pGender !== 'unisex') {
          if (filters.gender === 'mujer' && pGender !== 'mujer' && pGender !== 'femenino') return false;
          if (filters.gender === 'hombre' && pGender !== 'hombre' && pGender !== 'masculino') return false;
          if (filters.gender === 'nena' && pGender !== 'nena' && pGender !== 'femenino') return false;
          if (filters.gender === 'nene' && pGender !== 'nene' && pGender !== 'masculino') return false;
          if (filters.gender === 'unisex' && pGender !== 'unisex') return false;
        }
      }

      // 3. Filtro de talle
      if (filters.size !== 'all' && p.size !== filters.size) {
        return false;
      }

      // 4. Filtro de condición
      if (filters.condition !== 'all' && !p.condition.includes(filters.condition)) {
        return false;
      }

      // 5. Filtro de búsqueda debounced
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchSize = p.size.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        const matchSub = (p.subCategory || '').toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSize && !matchCategory && !matchSub) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price;
      if (filters.sort === 'price-desc') return b.price - a.price;
      if (filters.sort === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return 0; // 'featured' por defecto
    });
  }, [products, filters.category, filters.gender, filters.size, filters.condition, filters.sort, debouncedSearch]);

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      // Si cambia de categoría principal, resetear el género para evitar combinaciones incoherentes
      if (newFilters.category && newFilters.category !== prev.category) {
        updated.gender = 'all';
      }
      return updated;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const isFiltered = useMemo(() => {
    return (
      filters.category !== 'all' ||
      filters.gender !== 'all' ||
      filters.size !== 'all' ||
      filters.condition !== 'all' ||
      filters.search !== '' ||
      filters.sort !== 'featured'
    );
  }, [filters]);

  return {
    filters,
    filteredProducts,
    availableSizes,
    updateFilters,
    resetFilters,
    isFiltered
  };
}
