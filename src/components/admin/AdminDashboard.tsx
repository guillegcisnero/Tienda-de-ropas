import React, { useState, useMemo } from 'react';
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Database, 
  RefreshCw,
  Tag,
  Search,
  Users,
  Layers,
  Sparkle,
  SlidersHorizontal
} from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { isSupabaseConfigured } from '../../services/supabase';
import { createProduct, updateProductStatus, deleteProduct } from '../../services/catalogService';
import { CATEGORIES, CATEGORY_LIST } from '../../data/categories';

interface AdminDashboardProps {
  products: Product[];
  onClose: () => void;
  onProductCreated: (newProduct: Product) => void;
  onRefreshCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onClose,
  onProductCreated,
  onRefreshCatalog
}) => {
  // Autenticación simple de acceso
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Pestañas del Backoffice: 'new' | 'inventory'
  const [activeTab, setActiveTab] = useState<'new' | 'inventory'>('new');

  // Estado del Formulario de Nueva Prenda
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('adultos');
  const [subCategory, setSubCategory] = useState<string>(CATEGORIES.adultos.subcategories[0]);
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [gender, setGender] = useState<string>('unisex');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('9.5/10 (Impecable)');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  
  // Medidas en cm
  const [sisa, setSisa] = useState('');
  const [largo, setLargo] = useState('');
  const [hombros, setHombros] = useState('');
  const [manga, setManga] = useState('');
  const [cintura, setCintura] = useState('');
  const [tiro, setTiro] = useState('');

  // Filtros de inventario
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [inventorySearch, setInventorySearch] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Cambio de categoría principal
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const catConfig = CATEGORIES[newCat];
    if (catConfig) {
      setSubCategory(catConfig.subcategories[0] || '');
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
      setGender(catConfig.genders[0]?.id || 'unisex');
    }
  };

  const handleSubCategorySelect = (value: string) => {
    if (value === '__custom__') {
      setIsCustomSubcategory(true);
    } else {
      setIsCustomSubcategory(false);
      setSubCategory(value);
    }
  };

  const currentCategoryConfig = CATEGORIES[category] || CATEGORIES.adultos;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'aura2026' || pinInput === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Por favor completá nombre y precio');
      return;
    }

    const finalSubCategory = isCustomSubcategory 
      ? (customSubcategory.trim() || 'General') 
      : subCategory;

    setIsSubmitting(true);
    try {
      const measurements: Record<string, string> = {};
      if (sisa) measurements.sisa = `${sisa} cm`;
      if (largo) measurements.largo = `${largo} cm`;
      if (hombros) measurements.hombros = `${hombros} cm`;
      if (manga) measurements.manga = `${manga} cm`;
      if (cintura) measurements.cintura = `${cintura} cm`;
      if (tiro) measurements.tiro = `${tiro} cm`;

      const newProduct = await createProduct({
        name,
        category,
        subCategory: finalSubCategory,
        gender,
        size,
        condition,
        price: Number(price),
        description: description || `Prenda única seleccionada de ${currentCategoryConfig.label.toLowerCase()}.`,
        image: image || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        measurements,
        isSinglePiece: true,
        available: true
      });

      onProductCreated(newProduct);
      setSuccessNotice(`¡Prenda "${name}" publicada con éxito en ${currentCategoryConfig.badgeLabel}!`);
      
      // Limpiar formulario
      setName('');
      setPrice('');
      setDescription('');
      setImage('');
      setSisa('');
      setLargo('');
      setHombros('');
      setManga('');
      setCintura('');
      setTiro('');
      setIsCustomSubcategory(false);
      setCustomSubcategory('');

      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Error al publicar: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSold = async (product: Product) => {
    const nextStatus = product.available ? 'sold' : 'available';
    await updateProductStatus(product.id, nextStatus);
    onRefreshCatalog();
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('¿Eliminar esta prenda única del catálogo?')) {
      await deleteProduct(productId);
      onRefreshCatalog();
    }
  };

  // Filtrado de inventario
  const filteredInventory = useMemo(() => {
    return products.filter(p => {
      // Filtro de categoría
      if (inventoryCategoryFilter !== 'all') {
        const cat = (p.category || '').toLowerCase();
        if (inventoryCategoryFilter === 'adultos' && cat !== 'adultos' && cat !== 'urbana') return false;
        if (inventoryCategoryFilter === 'ninos' && cat !== 'ninos' && cat !== 'infantil') return false;
        if (inventoryCategoryFilter === 'accesorios' && cat !== 'accesorios') return false;
      }

      // Filtro de búsqueda
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSub = (p.subCategory || '').toLowerCase().includes(q);
        const matchSize = p.size.toLowerCase().includes(q);
        if (!matchName && !matchSub && !matchSize) return false;
      }

      return true;
    });
  }, [products, inventoryCategoryFilter, inventorySearch]);

  // Conteos por categoría
  const countAdultos = products.filter(p => {
    const c = (p.category || '').toLowerCase();
    return c === 'adultos' || c === 'urbana';
  }).length;

  const countNinos = products.filter(p => {
    const c = (p.category || '').toLowerCase();
    return c === 'ninos' || c === 'infantil';
  }).length;

  const countAccesorios = products.filter(p => (p.category || '').toLowerCase() === 'accesorios').length;

  // 1. Pantalla de PIN de Acceso
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#68544d]/95 backdrop-blur-md">
        <div className="w-full max-w-sm bg-[#F4E8E8] text-[#2c221e] rounded-3xl p-6 shadow-2xl border border-[#DEC0C0] text-center">
          <div className="w-12 h-12 rounded-full bg-[#68544d]/10 flex items-center justify-center mx-auto mb-3 text-[#68544d]">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-1">Acceso Administrador</h3>
          <p className="text-xs text-[#5c4b45] mb-5">Ingresá tu PIN para gestionar el catálogo</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN de acceso (ej: aura2026)"
              className="w-full text-center tracking-widest text-lg font-bold bg-white border border-[#DEC0C0] rounded-xl px-4 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
            />
            {pinError && <p className="text-xs text-rose-600 font-semibold">PIN incorrecto. Probá con aura2026</p>}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#68544d] hover:bg-[#55443e] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Ingresar al Backoffice
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#5c4b45] hover:text-[#2c221e] underline"
            >
              Volver a la tienda
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Métricas
  const totalItems = products.length;
  const availableItems = products.filter(p => p.available).length;
  const soldItems = products.filter(p => !p.available).length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#68544d] text-[#FAF6F0] overflow-y-auto">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#55443e] border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
            title="Volver a la tienda"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="font-serif text-lg font-bold leading-tight">Panel Administrador</h2>
            <div className="flex items-center gap-2 text-[11px] text-[#EBD5D5]/80">
              <Database className="w-3 h-3 text-[#EA8A8A]" />
              <span>{isSupabaseConfigured ? '🟢 Conectado a Supabase' : '🟠 Modo Local (Mock)'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshCatalog}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[#EBD5D5] transition-all cursor-pointer"
            title="Sincronizar catálogo"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('aura_admin_auth');
              setIsAuthenticated(false);
            }}
            className="text-xs text-[#EBD5D5]/80 hover:text-white px-2 py-1"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Main Body Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* KPI Strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[11px] uppercase tracking-wider text-[#EBD5D5]/70 block">Total</span>
            <span className="font-serif text-2xl font-bold text-white tabular-nums">{totalItems}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 block">Disponibles</span>
            <span className="font-serif text-2xl font-bold text-emerald-300 tabular-nums">{availableItems}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <span className="text-[11px] uppercase tracking-wider text-[#EA8A8A] block">Vendidas</span>
            <span className="font-serif text-2xl font-bold text-[#EA8A8A] tabular-nums">{soldItems}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new' 
                ? 'bg-[#EA8A8A] text-[#2c221e]' 
                : 'bg-white/5 text-[#EBD5D5] hover:bg-white/10'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Prenda (Carga Express)</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-[#EA8A8A] text-[#2c221e]' 
                : 'bg-white/5 text-[#EBD5D5] hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Gestión de Inventario ({products.length})</span>
          </button>
        </div>

        {successNotice && (
          <div className="bg-emerald-800/80 border border-emerald-500 text-white rounded-xl p-3 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* TAB 1: FORMULARIO CARGA EXPRESS CON CATEGORÍAS ACTUALIZADAS */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateProduct} className="bg-[#F4E8E8] text-[#2c221e] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DEC0C0] space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DEC0C0]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#68544d]" />
                <h3 className="font-serif text-base font-bold text-[#2c221e]">
                  Publicar Prenda Única
                </h3>
              </div>
              <span className="text-[11px] text-[#5c4b45] bg-[#EBD5D5]/60 px-2.5 py-1 rounded-full font-medium">
                Categoría activa: <b>{currentCategoryConfig.badgeLabel}</b>
              </span>
            </div>

            {/* SELECCIÓN DE CATEGORÍA PRINCIPAL (CARDS INTERACTIVAS) */}
            <div className="space-y-1.5">
              <label className="block text-[#5c4b45] font-bold text-xs">
                1. Seleccionar Categoría Principal *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CATEGORY_LIST.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#68544d] text-[#FAF6F0] border-[#68544d] shadow-md ring-2 ring-[#EA8A8A]'
                          : 'bg-white hover:bg-white/80 text-[#2c221e] border-[#DEC0C0]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm">{cat.badgeLabel}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#EA8A8A]" />
                        )}
                      </div>
                      <p className={`text-[11px] leading-tight line-clamp-2 ${
                        isSelected ? 'text-[#EBD5D5]' : 'text-[#5c4b45]'
                      }`}>
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TÍTULO Y PRECIO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Nombre / Título de la prenda *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Campera Denim Vintage Levi's" 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Precio ($ ARS) *</label>
                <input 
                  type="number" 
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Ej: 28500" 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>
            </div>

            {/* SUBCATEGORÍA DINÁMICA, GÉNERO Y TALLE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Subcategoría */}
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1 flex items-center justify-between">
                  <span>Subcategoría *</span>
                  <span className="text-[10px] text-[#68544d] font-bold">({currentCategoryConfig.badgeLabel})</span>
                </label>
                <select 
                  value={isCustomSubcategory ? '__custom__' : subCategory}
                  onChange={(e) => handleSubCategorySelect(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                >
                  {currentCategoryConfig.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__custom__">+ Otra subcategoría (escribir)...</option>
                </select>

                {isCustomSubcategory && (
                  <input
                    type="text"
                    autoFocus
                    required
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    placeholder="Escribí la subcategoría..."
                    className="mt-2 w-full bg-white border border-[#EA8A8A] rounded-xl px-3 py-2 text-xs focus:outline-none animate-fadeIn"
                  />
                )}
              </div>

              {/* Género / Sexo */}
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">
                  Público / Género *
                </label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                >
                  {currentCategoryConfig.genders.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>

              {/* Talle */}
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Talle Declarado</label>
                <input 
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder={category === 'ninos' ? 'Ej: Talle 2 (24 Meses)' : (category === 'accesorios' ? 'Ej: Talle Único' : 'Ej: Oversize M')} 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>
            </div>

            {/* Medidas Exactas en cm */}
            <div className="bg-white/80 p-4 rounded-2xl border border-[#DEC0C0] space-y-3">
              <span className="font-bold text-[#68544d] block">
                📏 Medidas Reales en cm (Para evitar cambios y devoluciones):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] text-[#5c4b45] block">Sisa / Pecho (cm)</label>
                  <input 
                    type="number" 
                    value={sisa}
                    onChange={(e) => setSisa(e.target.value)}
                    placeholder="Ej: 54" 
                    className="w-full bg-white border border-[#DEC0C0] rounded-lg px-2.5 py-1.5 focus:border-[#EA8A8A] focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5c4b45] block">Largo Total (cm)</label>
                  <input 
                    type="number" 
                    value={largo}
                    onChange={(e) => setLargo(e.target.value)}
                    placeholder="Ej: 62" 
                    className="w-full bg-white border border-[#DEC0C0] rounded-lg px-2.5 py-1.5 focus:border-[#EA8A8A] focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5c4b45] block">Cintura (cm)</label>
                  <input 
                    type="number" 
                    value={cintura}
                    onChange={(e) => setCintura(e.target.value)}
                    placeholder="Ej: 40" 
                    className="w-full bg-white border border-[#DEC0C0] rounded-lg px-2.5 py-1.5 focus:border-[#EA8A8A] focus:outline-none text-center"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#5c4b45] block">Manga / Tiro (cm)</label>
                  <input 
                    type="number" 
                    value={manga}
                    onChange={(e) => setManga(e.target.value)}
                    placeholder="Ej: 58" 
                    className="w-full bg-white border border-[#DEC0C0] rounded-lg px-2.5 py-1.5 focus:border-[#EA8A8A] focus:outline-none text-center"
                  />
                </div>
              </div>
            </div>

            {/* ESTADO Y URL DE IMAGEN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Estado de Conservación</label>
                <select 
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                >
                  <option value="10/10 (Nueva con etiqueta)">10/10 (Nueva con etiqueta)</option>
                  <option value="9.5/10 (Impecable / Como nueva)">9.5/10 (Impecable / Como nueva)</option>
                  <option value="9/10 (Excelente)">9/10 (Excelente)</option>
                  <option value="8/10 (Buen estado vintage)">8/10 (Buen estado vintage)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">URL de Imagen</label>
                <input 
                  type="url" 
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... o link de Supabase Storage" 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">Descripción de la Prenda</label>
              <textarea 
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles sobre tela, lavado, origen, botones, o detalles de confección..."
                className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2 focus:border-[#EA8A8A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#68544d] hover:bg-[#55443e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 text-[#EA8A8A]" />
              <span>{isSubmitting ? 'Publicando...' : `Publicar Prenda en ${currentCategoryConfig.badgeLabel}`}</span>
            </button>
          </form>
        )}

        {/* TAB 2: LISTADO & GESTIÓN DE PRENDAS CON FILTRO POR CATEGORÍA */}
        {activeTab === 'inventory' && (
          <div className="bg-[#F4E8E8] text-[#2c221e] rounded-3xl p-6 shadow-xl border border-[#DEC0C0] space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DEC0C0]">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2c221e]">
                  Inventario de Prendas Únicas
                </h3>
                <p className="text-[11px] text-[#5c4b45]">
                  Mostrando {filteredInventory.length} de {products.length} prendas registradas
                </p>
              </div>

              {/* Buscador de inventario */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#5c4b45] absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Buscar por nombre o talle..."
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2c221e] focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>
            </div>

            {/* FILTROS RÁPIDOS POR CATEGORÍA EN EL ADMIN */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  inventoryCategoryFilter === 'all'
                    ? 'bg-[#68544d] text-white shadow-sm'
                    : 'bg-white/80 text-[#5c4b45] hover:bg-white border border-[#DEC0C0]'
                }`}
              >
                Todas ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter('adultos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  inventoryCategoryFilter === 'adultos'
                    ? 'bg-[#68544d] text-white shadow-sm'
                    : 'bg-white/80 text-[#5c4b45] hover:bg-white border border-[#DEC0C0]'
                }`}
              >
                Adultos ({countAdultos})
              </button>
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter('ninos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  inventoryCategoryFilter === 'ninos'
                    ? 'bg-[#68544d] text-white shadow-sm'
                    : 'bg-white/80 text-[#5c4b45] hover:bg-white border border-[#DEC0C0]'
                }`}
              >
                Niños & Bebés ({countNinos})
              </button>
              <button
                type="button"
                onClick={() => setInventoryCategoryFilter('accesorios')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  inventoryCategoryFilter === 'accesorios'
                    ? 'bg-[#68544d] text-white shadow-sm'
                    : 'bg-white/80 text-[#5c4b45] hover:bg-white border border-[#DEC0C0]'
                }`}
              >
                Accesorios ({countAccesorios})
              </button>
            </div>

            {/* LISTADO DE PRENDAS */}
            <div className="divide-y divide-[#DEC0C0]/60 max-h-[58vh] overflow-y-auto pr-1">
              {filteredInventory.length === 0 ? (
                <div className="py-12 text-center text-[#5c4b45]">
                  <p className="text-xs font-medium">No se encontraron prendas con los filtros seleccionados.</p>
                </div>
              ) : (
                filteredInventory.map(product => {
                  const catBadge = product.category === 'adultos' || product.category === 'Urbana'
                    ? { label: 'Adultos', bg: 'bg-[#68544d]/10 text-[#68544d]' }
                    : product.category === 'ninos' || product.category === 'Infantil'
                    ? { label: 'Niños', bg: 'bg-emerald-100 text-emerald-800' }
                    : { label: 'Accesorios', bg: 'bg-rose-100 text-rose-800' };

                  return (
                    <div key={product.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-14 h-14 rounded-xl object-cover bg-white/50 shrink-0 border border-[#DEC0C0]"
                        />
                        <div className="space-y-1">
                          <h4 className="font-bold text-xs sm:text-sm text-[#2c221e] line-clamp-1">{product.name}</h4>
                          
                          {/* Badges de Categoría, Subcategoría y Género */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${catBadge.bg}`}>
                              {catBadge.label}
                            </span>
                            {product.subCategory && (
                              <span className="px-2 py-0.5 rounded-md bg-white border border-[#DEC0C0] text-[#5c4b45] font-medium">
                                {product.subCategory}
                              </span>
                            )}
                            {product.gender && (
                              <span className="px-2 py-0.5 rounded-md bg-white/70 border border-[#DEC0C0] text-[#5c4b45] capitalize">
                                {product.gender}
                              </span>
                            )}
                            <span className="text-[#5c4b45] font-semibold">· {product.size}</span>
                          </div>

                          <div className="text-xs font-bold text-[#68544d]">
                            {formatPrice(product.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleToggleSold(product)}
                          className={`text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                            product.available 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {product.available ? '✓ Disponible' : '✕ Vendida'}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-xl text-[#5c4b45] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                          title="Eliminar del catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
