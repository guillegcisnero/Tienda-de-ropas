import React, { useState, useMemo } from 'react';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Eye, 
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { Product } from '../../../types';
import { formatPrice } from '../../../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  onOpenCreateDrawer: () => void;
  onOpenEditDrawer: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  externalSearch?: string;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onOpenCreateDrawer,
  onOpenEditDrawer,
  onToggleAvailability,
  onDeleteProduct,
  externalSearch = ''
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState(externalSearch);

  // Sync external search if provided
  React.useEffect(() => {
    if (externalSearch !== undefined) {
      setSearchQuery(externalSearch);
    }
  }, [externalSearch]);

  // Inventory stats
  const availableCount = useMemo(() => products.filter(p => p.available).length, [products]);
  const soldCount = useMemo(() => products.filter(p => !p.available).length, [products]);
  const totalValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (categoryFilter !== 'all') {
        const cat = (p.category || '').toLowerCase();
        if (categoryFilter === 'adultos' && cat !== 'adultos' && cat !== 'urbana') return false;
        if (categoryFilter === 'ninos' && cat !== 'ninos' && cat !== 'infantil') return false;
        if (categoryFilter === 'accesorios' && cat !== 'accesorios') return false;
      }

      // Status filter
      if (statusFilter === 'available' && !p.available) return false;
      if (statusFilter === 'sold' && p.available) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSub = (p.subCategory || '').toLowerCase().includes(q);
        const matchSize = p.size.toLowerCase().includes(q);
        const matchId = p.id.toLowerCase().includes(q);
        if (!matchName && !matchSub && !matchSize && !matchId) return false;
      }

      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* 1. Header Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DEC0C0]/70 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c4b45] block mb-1">
            Total Prendas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-[#2c221e]">
              {products.length}
            </span>
            <span className="text-[11px] text-[#5c4b45]">piezas 1/1</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            En Stock / Venta
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-emerald-700">
              {availableCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {products.length > 0 ? `${Math.round((availableCount / products.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block mb-1">
            Vendidas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-rose-700">
              {soldCount}
            </span>
            <span className="text-[11px] text-rose-600 font-semibold">agotadas</span>
          </div>
        </div>

        <div className="bg-[#443530] text-[#FAF6F0] rounded-2xl p-4 border border-[#55443e] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#DEC0C0] block mb-1">
            Valor Inventario
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-bold text-xl text-[#FAF6F0]">
              {formatPrice(totalValuation)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#DEC0C0]/70 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#5c4b45] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por prenda, talle o estilo..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl text-xs text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'adultos', label: 'Adultos' },
              { id: 'ninos', label: 'Niños' },
              { id: 'accesorios', label: 'Accesorios' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-[#EA8A8A] text-[#2c221e] font-bold shadow-xs'
                    : 'bg-[#FAF6F0] text-[#5c4b45] hover:bg-[#F4E8E8] border border-[#DEC0C0]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter & CTA Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DEC0C0]/60 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-[#2c221e] shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'available' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Disponibles
            </button>
            <button
              onClick={() => setStatusFilter('sold')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'sold' ? 'bg-rose-600 text-white shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Vendidas
            </button>
          </div>

          <button
            onClick={onOpenCreateDrawer}
            className="min-h-[44px] px-4 py-2 bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] rounded-xl text-xs font-bold transition-all shadow-md shadow-[#EA8A8A]/30 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#2c221e]" />
            <span className="hidden sm:inline">Nueva Prenda</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* 3. Catalog Inventory Table (Desktop/Tablet) & Cards (Mobile) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DEC0C0]/70 shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="py-14 text-center text-[#5c4b45] space-y-2">
            <Package className="w-10 h-10 text-[#DEC0C0] mx-auto" />
            <p className="font-serif font-bold text-sm text-[#2c221e]">
              No se encontraron prendas
            </p>
            <p className="text-xs max-w-sm mx-auto">
              No hay prendas que coincidan con los filtros seleccionados o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DEC0C0]/60 text-[#5c4b45] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Prenda & Detalles</th>
                  <th className="pb-3">Categoría</th>
                  <th className="pb-3">Talle & Medidas</th>
                  <th className="pb-3">Condición</th>
                  <th className="pb-3">Precio</th>
                  <th className="pb-3 text-center">Estado</th>
                  <th className="pb-3 text-right pr-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEC0C0]/30">
                {filteredProducts.map((product) => {
                  const measurements = product.measurements || {};
                  const measureSummary = [
                    measurements.sisa ? `Sisa: ${measurements.sisa}` : '',
                    measurements.largo ? `Largo: ${measurements.largo}` : ''
                  ].filter(Boolean).join(' · ');

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF6F0]/60 transition-colors group">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#DEC0C0] shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {product.available ? (
                              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white ring-1 ring-emerald-600/30" />
                            ) : (
                              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white ring-1 ring-rose-600/30" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-[#2c221e] line-clamp-1 block">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-[#5c4b45] font-mono">
                              #{product.id.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Subcategory */}
                      <td className="py-3.5">
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-[#F4E8E8] text-[#55443e] text-[10px] inline-block">
                            {product.category}
                          </span>
                          {product.subCategory && (
                            <span className="block text-[11px] text-[#5c4b45]">
                              {product.subCategory}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Size & Measurements */}
                      <td className="py-3.5">
                        <div>
                          <span className="font-bold text-xs text-[#2c221e]">
                            Talle {product.size}
                          </span>
                          {measureSummary && (
                            <span className="block text-[10px] text-[#5c4b45]">
                              {measureSummary}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Condition Rating */}
                      <td className="py-3.5">
                        <span className="px-2 py-1 rounded-lg bg-[#FAF6F0] border border-[#DEC0C0] text-[10px] font-semibold text-[#55443e] whitespace-nowrap">
                          {product.condition || '9.5/10'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 font-bold text-xs sm:text-sm text-[#2c221e]">
                        {formatPrice(product.price)}
                      </td>

                      {/* Status Live Toggle */}
                      <td className="py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleAvailability(product)}
                          title="Hacé clic para cambiar disponibilidad"
                          className={`text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            product.available
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                          <span>{product.available ? 'Disponible' : 'Vendida'}</span>
                        </button>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenEditDrawer(product)}
                            className="p-2 rounded-xl text-[#5c4b45] hover:text-[#2c221e] hover:bg-[#FAF6F0] border border-transparent hover:border-[#DEC0C0] transition-all cursor-pointer"
                            title="Editar prenda"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 rounded-xl text-[#5c4b45] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            title="Eliminar del catálogo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
