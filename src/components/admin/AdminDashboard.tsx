import React, { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ArrowLeft, 
  Lock, 
  Sparkles,
  ShoppingBag,
  Database,
  RefreshCw
} from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { isSupabaseConfigured } from '../../services/supabase';
import { createProduct, updateProductStatus, deleteProduct } from '../../services/catalogService';

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
  const [category, setCategory] = useState('Urbana');
  const [subCategory, setSubCategory] = useState('Camperas');
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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
        subCategory,
        size,
        condition,
        price: Number(price),
        description: description || `Prenda única seleccionada de estilo ${category.toLowerCase()}.`,
        image: image || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        measurements,
        isSinglePiece: true,
        available: true
      });

      onProductCreated(newProduct);
      setSuccessNotice(`¡Prenda "${name}" publicada con éxito!`);
      
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
            <span>Carga Express (&lt;60s)</span>
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
            <span>Gestión de Prendas ({products.length})</span>
          </button>
        </div>

        {successNotice && (
          <div className="bg-emerald-800/80 border border-emerald-500 text-white rounded-xl p-3 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* TAB 1: FORMULARIO CARGA EXPRESS */}
        {activeTab === 'new' && (
          <form onSubmit={handleCreateProduct} className="bg-[#F4E8E8] text-[#2c221e] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#DEC0C0] space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[#DEC0C0]">
              <Sparkles className="w-4 h-4 text-[#68544d]" />
              <h3 className="font-serif text-base font-bold text-[#2c221e]">
                Publicar Prenda Única
              </h3>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Categoría Principal</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                >
                  <option value="Urbana">Urbana</option>
                  <option value="Infantil">Infantil</option>
                  <option value="Vintage">Vintage Archivo</option>
                </select>
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Subcategoría</label>
                <input 
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="Ej: Camperas, Buzos" 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">Talle Declarado</label>
                <input 
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="Ej: Oversize M, Talle 2" 
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2.5 focus:border-[#EA8A8A] focus:outline-none"
                />
              </div>
            </div>

            {/* Medidas Exactas en cm */}
            <div className="bg-white/80 p-4 rounded-2xl border border-[#DEC0C0] space-y-3">
              <span className="font-bold text-[#68544d] block">
                📏 Medidas Reales en cm (Para evitar cambios):
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-xl bg-[#68544d] hover:bg-[#55443e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 text-[#EA8A8A]" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar Prenda en Catálogo'}</span>
            </button>
          </form>
        )}

        {/* TAB 2: LISTADO & GESTIÓN DE PRENDAS */}
        {activeTab === 'inventory' && (
          <div className="bg-[#F4E8E8] text-[#2c221e] rounded-3xl p-6 shadow-xl border border-[#DEC0C0] space-y-3">
            <h3 className="font-serif text-base font-bold text-[#2c221e] pb-2 border-b border-[#DEC0C0]">
              Inventario de Prendas Únicas
            </h3>

            <div className="divide-y divide-[#DEC0C0]/60 max-h-[60vh] overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-12 h-12 rounded-lg object-cover bg-white/50 shrink-0 border border-[#DEC0C0]"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#2c221e] line-clamp-1">{product.name}</h4>
                      <div className="text-[11px] text-[#5c4b45] flex items-center gap-1.5">
                        <span>{product.size}</span>
                        <span>·</span>
                        <span className="font-semibold text-[#68544d]">{formatPrice(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSold(product)}
                      className={`text-[11px] font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                        product.available 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      }`}
                    >
                      {product.available ? '✓ Disponible' : '✕ Vendida'}
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg text-[#5c4b45] hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                      title="Eliminar del catálogo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
