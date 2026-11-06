import React from 'react';
import { X, Heart, ShoppingBag, Trash2, User, Check } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isInCart: (productId: string) => boolean;
  onOpenProductDetail: (product: Product) => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userEmail?: string;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onAddToCart,
  isInCart,
  onOpenProductDetail,
  onOpenAuth,
  isAuthenticated,
  userEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft border-l border-[#E8E6E1] dark:border-[#282826] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 border-b border-[#E8E6E1] dark:border-[#282826] flex items-center justify-between bg-white dark:bg-[#181816]">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
              Tus Favoritos ({favorites.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FBFBF9] dark:bg-[#222220] hover:bg-[#F2F1EC] dark:hover:bg-[#2A2A28] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar favoritos"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Sincronización / Auth */}
        <div className="px-5 py-3 bg-[#F4EFEA] dark:bg-[#1C1C1A] border-b border-[#E8E6E1] dark:border-[#282826] flex items-center justify-between text-xs">
          {isAuthenticated ? (
            <div className="flex items-center gap-2 text-[#5A5A5A] dark:text-[#A8A69E]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="truncate max-w-[220px]">Sincronizado con <b>{userEmail}</b></span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[#5A5A5A] dark:text-[#A8A69E]">
                <User className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>¿Querés ver tus favoritos en tu celular?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-[11px] font-bold text-[#8F7049] dark:text-[#C5A880] hover:text-[#1A1A1A] dark:hover:text-white underline cursor-pointer"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center mx-auto text-rose-400 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">
                Aún no guardaste favoritos
              </h4>
              <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed mb-6 font-light max-w-xs mx-auto">
                Tocá el corazón en las prendas que te interesen para compararlas o guardarlas para después.
              </p>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-full bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-3 divide-y divide-[#E8E6E1] dark:divide-[#282826]">
              {favorites.map((product) => {
                const inCart = isInCart(product.id);
                const isAvailable = product.available;

                return (
                  <div key={product.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                    <div 
                      onClick={() => {
                        onClose();
                        onOpenProductDetail(product);
                      }}
                      className="flex items-center gap-3 cursor-pointer group flex-1"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816]">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                            !isAvailable ? 'grayscale opacity-60' : ''
                          }`}
                        />
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-black/80 px-1 py-0.5 rounded">
                              Vendido
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5F5F0] leading-tight truncate group-hover:text-[#8F7049] dark:group-hover:text-[#C5A880] transition-colors">
                          {product.name}
                        </h4>
                        <div className="text-[11px] text-[#5A5A5A] dark:text-[#A8A69E] flex items-center gap-1.5 mt-0.5">
                          <span>{product.size}</span>
                          <span>·</span>
                          <span className="capitalize">{product.category}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#F5F5F0] tabular-nums">
                            {formatPrice(product.price)}
                          </span>
                          {!isAvailable && (
                            <span className="text-[10px] text-red-500 font-medium">
                              (Ya adquirido)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isAvailable && (
                        <button
                          onClick={() => onAddToCart(product)}
                          disabled={inCart}
                          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                            inCart 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 cursor-default' 
                              : 'bg-white dark:bg-[#181816] hover:bg-[#F2F1EC] dark:hover:bg-[#20201E] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] hover:border-[#C5A880]'
                          }`}
                          title={inCart ? 'Ya está en tu carrito' : 'Mover al carrito'}
                        >
                          {inCart ? (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveFavorite(product.id)}
                        className="p-2 text-[#7A7A7A] dark:text-[#8E8B82] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="p-4 border-t border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816]">
            <p className="text-[11px] text-[#5A5A5A] dark:text-[#A8A69E] text-center font-light">
              Las prendas en favoritos <b>no reservan stock</b>. Para asegurar tu pieza única 1/1, sumala a tu pedido.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
