import React, { memo } from 'react';
import { ShoppingBag, Ruler, Check, Heart } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  isFavorite?: boolean;
  onOpenDetail: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleFavorite?: (p: Product) => void;
  onBuyNow?: (p: Product) => void;
}

export const ProductCard = memo<ProductCardProps>(({
  product,
  isInCart,
  isFavorite = false,
  onOpenDetail,
  onAddToCart,
  onToggleFavorite,
  onBuyNow
}) => {
  return (
    <article className="group bg-white dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F5F5F0] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-[#E8E6E1] dark:border-[#282826] hover:border-[#C5A880] dark:hover:border-[#C5A880] flex flex-col transition-all duration-300 hover:-translate-y-1">
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FBFBF9] dark:bg-[#121212]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Single Piece Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <span className="bg-[#1A1A1A]/85 dark:bg-black/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/15 shadow-xs">
            Prenda Única
          </span>
          <span className="bg-[#FBFBF9]/90 dark:bg-[#1E1E1C]/90 backdrop-blur-md text-[#1A1A1A] dark:text-[#F5F5F0] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#E8E6E1] dark:border-[#282826] shadow-xs">
            {product.condition}
          </span>
        </div>

        {/* Top Right: Size Badge and Favorite Button */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <span className="bg-white/95 dark:bg-[#181816]/95 text-[#1A1A1A] dark:text-[#F5F5F0] font-bold text-xs px-3 py-1 rounded-full shadow-xs border border-[#C5A880]/60">
            {product.size}
          </span>
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(product);
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isFavorite
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-500 border border-rose-200 dark:border-rose-900/60 scale-105'
                  : 'bg-white/80 dark:bg-[#181816]/80 hover:bg-white dark:hover:bg-[#222220] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826]'
              }`}
              title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Quick View Floating Button on Hover */}
        <button
          onClick={() => onOpenDetail(product)}
          className="absolute bottom-3 left-3 right-3 py-2.5 px-4 rounded-xl bg-white/95 dark:bg-[#181816]/95 text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold text-xs shadow-md flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 cursor-pointer border border-[#E8E6E1] dark:border-[#282826] hover:border-[#C5A880] z-10"
        >
          <Ruler className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Ver Medidas y Fotos</span>
        </button>
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white dark:bg-[#181816] transition-colors">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#7A7A7A] dark:text-[#8E8B82] uppercase tracking-wider font-semibold mb-1">
            <span>{product.category}</span>
            <span>{product.subCategory}</span>
          </div>

          <h3 
            onClick={() => onOpenDetail(product)}
            className="font-serif text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0] leading-snug line-clamp-1 hover:text-[#C5A880] dark:hover:text-[#C5A880] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] line-clamp-2 mt-1.5 leading-relaxed font-light">
            {product.description}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#EDEBE6] dark:border-[#282826] flex flex-col gap-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-[#7A7A7A] dark:text-[#8E8B82] uppercase tracking-wider font-semibold">Precio Final</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0] tabular-nums">
              {formatPrice(product.price)}
            </span>
          </div>

          {isInCart ? (
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-[#FBFBF9] dark:bg-[#1E1E1C] text-[#7A7A7A] dark:text-[#8E8B82] border border-[#E8E6E1] dark:border-[#282826] text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-[#C5A880]" />
              <span>En Carrito</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAddToCart(product)}
                className="py-2.5 px-2 rounded-xl border border-[#C5A880] hover:bg-[#FBFBF9] dark:hover:bg-[#222220] active:scale-95 text-[#1A1A1A] dark:text-[#F5F5F0] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="Agregar al Carrito"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <span>Agregar</span>
              </button>
              <button
                onClick={() => onBuyNow ? onBuyNow(product) : onAddToCart(product)}
                className="py-2.5 px-2 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white active:scale-95 text-white dark:text-[#121212] text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Iniciar Compra Directa"
              >
                <span className="truncate">Iniciar Compra</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
