import React from 'react';
import { Ruler, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isInCart,
  onOpenDetail,
  onAddToCart
}) => {
  const formatPrice = (val: number) => {
    return '$' + val.toLocaleString('es-AR');
  };

  return (
    <article className="group bg-[#F4E8E8] text-[#2c221e] rounded-2xl overflow-hidden shadow-lg border border-[#DEC0C0] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#55443e]/10">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Single Piece Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-[#55443e]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
            Prenda Única
          </span>
          <span className="bg-emerald-700/90 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {product.condition}
          </span>
        </div>

        {/* Size Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-[#EA8A8A] text-[#2c221e] font-bold text-xs px-3 py-1 rounded-full shadow-md">
            {product.size}
          </span>
        </div>

        {/* Quick View Floating Button on Hover */}
        <button
          onClick={() => onOpenDetail(product)}
          className="absolute bottom-3 left-3 right-3 py-2.5 px-4 rounded-xl bg-white/95 text-[#2c221e] font-semibold text-xs shadow-lg flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 cursor-pointer"
        >
          <Ruler className="w-3.5 h-3.5 text-[#EA8A8A]" />
          <span>Ver Medidas en cm</span>
        </button>
      </div>

      {/* Card Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#5c4b45] uppercase tracking-wider font-semibold mb-1">
            <span>{product.category}</span>
            <span>{product.subCategory}</span>
          </div>

          <h3 
            onClick={() => onOpenDetail(product)}
            className="font-serif text-base sm:text-lg font-bold text-[#2c221e] leading-snug line-clamp-1 hover:text-[#EA8A8A] transition-colors cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="text-xs text-[#5c4b45] line-clamp-2 mt-1.5 leading-relaxed font-light">
            {product.description}
          </p>

          {/* Quick Measurements Preview Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#DEC0C0]/50 text-[11px] text-[#5c4b45]">
            {product.measurements.sisa && (
              <span className="bg-[#EBD5D5]/60 px-2 py-0.5 rounded-md">
                Sisa: <strong>{product.measurements.sisa}</strong>
              </span>
            )}
            {product.measurements.largo && (
              <span className="bg-[#EBD5D5]/60 px-2 py-0.5 rounded-md">
                Largo: <strong>{product.measurements.largo}</strong>
              </span>
            )}
            {product.measurements.cintura && (
              <span className="bg-[#EBD5D5]/60 px-2 py-0.5 rounded-md">
                Cintura: <strong>{product.measurements.cintura}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-5 pt-3 border-t border-[#DEC0C0] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#5c4b45] uppercase tracking-wider block font-medium">Precio Final</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-[#68544d] tabular-nums">
              {formatPrice(product.price)}
            </span>
          </div>

          {isInCart ? (
            <button
              disabled
              className="py-2.5 px-3.5 rounded-xl bg-[#68544d]/20 text-[#5c4b45] text-xs font-bold flex items-center gap-1.5 cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-emerald-700" />
              <span>En Carrito</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="py-2.5 px-4 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] active:scale-95 text-[#2c221e] text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Comprar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
