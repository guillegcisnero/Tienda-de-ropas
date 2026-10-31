import React from 'react';
import { X, Ruler, ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  isInCart: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onOpenGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  isInCart,
  onClose,
  onAddToCart,
  onOpenGuide
}) => {
  if (!isOpen || !product) return null;

  const formatPrice = (val: number) => {
    return '$' + val.toLocaleString('es-AR');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-[#F4E8E8] text-[#2c221e] rounded-3xl shadow-2xl border border-[#DEC0C0] overflow-hidden max-h-[92vh] flex flex-col md:flex-row transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ficha"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 relative bg-[#55443e]/10 min-h-[260px] md:min-h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            <span className="bg-[#55443e]/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Prenda Única 1/1
            </span>
            <span className="bg-[#EA8A8A] text-[#2c221e] font-bold text-xs px-3 py-0.5 rounded-full shadow-md">
              {product.size}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5c4b45] font-semibold mb-1">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.subCategory}</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2c221e] leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-3 my-3">
              <span className="font-serif text-2xl font-bold text-[#68544d]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                Estado: {product.condition}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#5c4b45] leading-relaxed font-light mb-5">
              {product.description}
            </p>

            {/* Measurements Table (The Core Feature of Pre-Loved) */}
            <div className="bg-[#EBD5D5]/60 rounded-2xl p-4 border border-[#DEC0C0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2c221e] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#EA8A8A]" /> Medidas Reales en cm
                </span>
                <button
                  onClick={onOpenGuide}
                  className="text-[11px] text-[#68544d] hover:text-[#EA8A8A] font-semibold underline cursor-pointer"
                >
                  ¿Cómo medirse?
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.measurements).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-[#DEC0C0]/50">
                    <span className="capitalize text-[#5c4b45] font-medium">{key}:</span>
                    <span className="font-bold text-[#2c221e] tabular-nums">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sustainability Trust Seal */}
            <div className="flex items-center gap-2 mt-4 text-[11px] text-[#5c4b45]">
              <ShieldCheck className="w-4 h-4 text-[#EA8A8A] shrink-0" />
              <span>Prenda higienizada, verificada en costuras y lista para usar.</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-4 border-t border-[#DEC0C0]">
            {isInCart ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-[#68544d]/20 text-[#5c4b45] font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Esta prenda única ya está en tu carrito</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] active:scale-[0.98] text-[#2c221e] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Agregar Prenda Única al Carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
