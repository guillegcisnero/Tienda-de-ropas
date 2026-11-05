import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  PlusCircle, 
  Edit3, 
  Image as ImageIcon, 
  Ruler, 
  Tag, 
  Check, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Product } from '../../../types';
import { CATEGORIES, CATEGORY_LIST } from '../../../data/categories';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: {
    name: string;
    category: string;
    subCategory: string;
    gender: string;
    size: string;
    condition: string;
    price: number;
    description: string;
    image: string;
    measurements: Record<string, string>;
    available: boolean;
    isSinglePiece: boolean;
    id?: string;
  }) => Promise<void>;
  initialProduct?: Product | null;
  isSubmitting?: boolean;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  isSubmitting = false
}) => {
  const isEditMode = Boolean(initialProduct);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('adultos');
  const [subCategory, setSubCategory] = useState<string>('Buzos y Hoodies');
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [gender, setGender] = useState<string>('unisex');
  const [size, setSize] = useState('M');
  const [condition, setCondition] = useState('9.5/10 (Impecable / Como nueva)');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [available, setAvailable] = useState(true);

  // Measurements
  const [sisa, setSisa] = useState('');
  const [largo, setLargo] = useState('');
  const [hombros, setHombros] = useState('');
  const [manga, setManga] = useState('');
  const [cintura, setCintura] = useState('');
  const [tiro, setTiro] = useState('');

  const [imageError, setImageError] = useState(false);

  // Populate form on initialProduct change or reset on create mode
  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setCategory(initialProduct.category || 'adultos');
      
      const catConfig = CATEGORIES[initialProduct.category || 'adultos'];
      const standardSubs = catConfig?.subcategories || [];
      if (initialProduct.subCategory && !standardSubs.includes(initialProduct.subCategory)) {
        setIsCustomSubcategory(true);
        setCustomSubcategory(initialProduct.subCategory);
        setSubCategory('__custom__');
      } else {
        setIsCustomSubcategory(false);
        setCustomSubcategory('');
        setSubCategory(initialProduct.subCategory || standardSubs[0] || '');
      }

      setGender(initialProduct.gender || 'unisex');
      setSize(initialProduct.size || 'M');
      setCondition(initialProduct.condition || '9.5/10 (Impecable / Como nueva)');
      setPrice(initialProduct.price ? String(initialProduct.price) : '');
      setDescription(initialProduct.description || '');
      setImage(initialProduct.image || '');
      setAvailable(initialProduct.available ?? true);

      // Extract measurements
      const m = initialProduct.measurements || {};
      setSisa(m.sisa ? m.sisa.replace(/\D/g, '') : '');
      setLargo(m.largo ? m.largo.replace(/\D/g, '') : '');
      setHombros(m.hombros ? m.hombros.replace(/\D/g, '') : '');
      setManga(m.manga ? m.manga.replace(/\D/g, '') : '');
      setCintura(m.cintura ? m.cintura.replace(/\D/g, '') : '');
      setTiro(m.tiro ? m.tiro.replace(/\D/g, '') : '');
      setImageError(false);
    } else {
      // Reset form
      setName('');
      setCategory('adultos');
      setSubCategory(CATEGORIES.adultos.subcategories[0] || 'Buzos y Hoodies');
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
      setGender('unisex');
      setSize('M');
      setCondition('9.5/10 (Impecable / Como nueva)');
      setPrice('');
      setDescription('');
      setImage('');
      setAvailable(true);
      setSisa('');
      setLargo('');
      setHombros('');
      setManga('');
      setCintura('');
      setTiro('');
      setImageError(false);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const currentCategoryConfig = CATEGORIES[category] || CATEGORIES.adultos;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      alert('Por favor completá nombre y precio de la prenda.');
      return;
    }

    const finalSubCategory = isCustomSubcategory 
      ? (customSubcategory.trim() || 'General') 
      : subCategory;

    const measurements: Record<string, string> = {};
    if (sisa.trim()) measurements.sisa = `${sisa.trim()} cm`;
    if (largo.trim()) measurements.largo = `${largo.trim()} cm`;
    if (hombros.trim()) measurements.hombros = `${hombros.trim()} cm`;
    if (manga.trim()) measurements.manga = `${manga.trim()} cm`;
    if (cintura.trim()) measurements.cintura = `${cintura.trim()} cm`;
    if (tiro.trim()) measurements.tiro = `${tiro.trim()} cm`;

    await onSubmit({
      id: initialProduct?.id,
      name: name.trim(),
      category,
      subCategory: finalSubCategory,
      gender,
      size: size.trim().toUpperCase() || 'M',
      condition,
      price: Number(price),
      description: description.trim() || `Prenda única seleccionada de ${currentCategoryConfig.label.toLowerCase()}.`,
      image: image.trim() || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
      measurements,
      available,
      isSinglePiece: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#443530]/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Container: Right Off-Canvas on Desktop, Bottom Sheet on Mobile */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <aside 
          className="w-screen max-w-md md:max-w-lg bg-[#FAF6F0] shadow-2xl flex flex-col h-full rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl border-l border-[#DEC0C0] transform transition-transform duration-300 ease-out flex-1"
          role="dialog"
          aria-modal="true"
        >
          {/* Mobile Grab Handle */}
          <div className="sm:hidden pt-3 pb-1 flex justify-center">
            <div className="w-12 h-1.5 bg-[#DEC0C0] rounded-full" />
          </div>

          {/* Drawer Header */}
          <div className="px-6 py-4 bg-white border-b border-[#DEC0C0]/70 flex items-center justify-between sm:rounded-tl-3xl">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EA8A8A]/20 flex items-center justify-center text-[#2c221e]">
                {isEditMode ? <Edit3 className="w-4 h-4 text-[#EA8A8A]" /> : <Sparkles className="w-4 h-4 text-[#EA8A8A]" />}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2c221e]">
                  {isEditMode ? 'Editar Prenda Única' : 'Publicar Nueva Prenda'}
                </h3>
                <p className="text-[11px] text-[#5c4b45]">
                  {isEditMode ? `ID: #${initialProduct?.id.slice(0, 8)}` : 'Catálogo 1/1 exclusivo'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-[#5c4b45] hover:text-[#2c221e] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#2c221e]">
            {/* Live Image Preview Banner */}
            <div className="bg-white p-3 rounded-2xl border border-[#DEC0C0] flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#DEC0C0] shrink-0 flex items-center justify-center">
                {image && !imageError ? (
                  <img 
                    src={image} 
                    alt="Vista previa" 
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-[#5c4b45]">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span className="text-[9px] block">Sin preview</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <span className="font-bold text-[#55443e] block text-xs">
                  {name || 'Título de la prenda'}
                </span>
                <span className="text-[11px] text-[#5c4b45] block">
                  {category} · {isCustomSubcategory ? customSubcategory || 'Personalizada' : subCategory} · Talle {size}
                </span>
                <span className="font-bold text-sm text-[#2c221e] block">
                  {price ? `$${Number(price).toLocaleString('es-AR')}` : '$0'}
                </span>
              </div>
            </div>

            {/* 1. Categoría Principal */}
            <div>
              <label className="block text-[#5c4b45] font-bold text-xs mb-2">
                Categoría Principal *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORY_LIST.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#443530] text-[#FAF6F0] border-[#443530] font-bold shadow-xs'
                          : 'bg-white text-[#5c4b45] hover:bg-[#FAF6F0] border-[#DEC0C0]'
                      }`}
                    >
                      <span className="text-xs">{cat.badgeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Nombre & Precio */}
            <div className="space-y-3">
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">
                  Nombre de la Prenda *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Campera Denim Oversize 90s"
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5c4b45] font-semibold mb-1">
                    Precio ($ ARS) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="32000"
                    className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
                  />
                </div>

                <div>
                  <label className="block text-[#5c4b45] font-semibold mb-1">
                    Disponibilidad
                  </label>
                  <button
                    type="button"
                    onClick={() => setAvailable(!available)}
                    className={`w-full py-2.5 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      available
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    <span>{available ? 'Disponible' : 'Vendida (Agotada)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Subcategoría, Género & Talle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">
                  Subcategoría
                </label>
                <select
                  value={isCustomSubcategory ? '__custom__' : subCategory}
                  onChange={(e) => handleSubCategorySelect(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-2.5 py-2 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
                >
                  {currentCategoryConfig.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__custom__">+ Otra subcategoría...</option>
                </select>

                {isCustomSubcategory && (
                  <input
                    type="text"
                    autoFocus
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    placeholder="Nombre subcategoría..."
                    className="mt-2 w-full bg-white border border-[#EA8A8A] rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">
                  Público / Género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-2.5 py-2 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
                >
                  {currentCategoryConfig.genders.map(g => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#5c4b45] font-semibold mb-1">
                  Talle
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="M / Talle 2"
                  className="w-full bg-white border border-[#DEC0C0] rounded-xl px-2.5 py-2 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
                />
              </div>
            </div>

            {/* 4. Condición y Calidad Vintage */}
            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                Condición / Estado Vintage
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3 py-2 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
              >
                <option value="10/10 (Nueva con etiqueta)">10/10 (Nueva con etiqueta)</option>
                <option value="9.5/10 (Impecable / Como nueva)">9.5/10 (Impecable / Como nueva)</option>
                <option value="9/10 (Excelente)">9/10 (Excelente)</option>
                <option value="8.5/10 (Muy buen estado)">8.5/10 (Muy buen estado)</option>
                <option value="8/10 (Buen estado vintage)">8/10 (Buen estado vintage)</option>
              </select>
            </div>

            {/* 5. Medidas en cm */}
            <div className="bg-white p-4 rounded-2xl border border-[#DEC0C0] space-y-2.5">
              <div className="flex items-center gap-1.5 text-[#55443e] font-bold">
                <Ruler className="w-3.5 h-3.5 text-[#EA8A8A]" />
                <span>Medidas Exactas de la Prenda (cm)</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Sisa (ancho)</label>
                  <input
                    type="number"
                    value={sisa}
                    onChange={(e) => setSisa(e.target.value)}
                    placeholder="54"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Largo total</label>
                  <input
                    type="number"
                    value={largo}
                    onChange={(e) => setLargo(e.target.value)}
                    placeholder="65"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Hombros</label>
                  <input
                    type="number"
                    value={hombros}
                    onChange={(e) => setHombros(e.target.value)}
                    placeholder="48"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Manga</label>
                  <input
                    type="number"
                    value={manga}
                    onChange={(e) => setManga(e.target.value)}
                    placeholder="60"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Cintura</label>
                  <input
                    type="number"
                    value={cintura}
                    onChange={(e) => setCintura(e.target.value)}
                    placeholder="40"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#5c4b45] block font-semibold">Tiro</label>
                  <input
                    type="number"
                    value={tiro}
                    onChange={(e) => setTiro(e.target.value)}
                    placeholder="32"
                    className="w-full bg-[#FAF6F0] border border-[#DEC0C0] rounded-lg px-2 py-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#EA8A8A]"
                  />
                </div>
              </div>
            </div>

            {/* 6. URL de Imagen */}
            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                URL de la Imagen *
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => {
                  setImage(e.target.value);
                  setImageError(false);
                }}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
              />
            </div>

            {/* 7. Descripción */}
            <div>
              <label className="block text-[#5c4b45] font-semibold mb-1">
                Descripción / Detalles de la Prenda
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles sobre tejido, estilo o procedencia..."
                className="w-full bg-white border border-[#DEC0C0] rounded-xl px-3.5 py-2.5 text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A] resize-none"
              />
            </div>

            {/* Drawer Actions Footer */}
            <div className="pt-3 pb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-[#FAF6F0] hover:bg-[#F4E8E8] text-[#5c4b45] font-bold text-xs border border-[#DEC0C0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 min-h-[44px] py-3 px-4 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-bold text-xs shadow-md shadow-[#EA8A8A]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Guardando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isEditMode ? 'Guardar Cambios' : 'Publicar Prenda'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};
