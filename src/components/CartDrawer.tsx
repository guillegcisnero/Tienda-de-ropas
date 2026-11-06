import React from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Truck, AlertTriangle, Heart } from 'lucide-react';
import { Product, ShippingConfig } from '../types';
import { formatPrice } from '../utils/formatters';
import { SHIPPING_RATES } from '../data/mockCatalog';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Reconciliación: productos divididos según disponibilidad en catálogo
  availableItems: Product[];
  unavailableItems: Product[];
  onRemoveItem: (id: string) => void;
  shipping: ShippingConfig;
  onShippingChange: (serviceKey: string) => void;
  onProceedToCheckout: () => void;
  onExplore: () => void;
  onMoveToFavorites?: (product: Product) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  availableItems,
  unavailableItems,
  onRemoveItem,
  shipping,
  onShippingChange,
  onProceedToCheckout,
  onExplore,
  onMoveToFavorites
}) => {
  if (!isOpen) return null;

  // El subtotal y total solo computan las prendas que están disponibles
  const subtotal = availableItems.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + (availableItems.length > 0 ? shipping.cost : 0);
  const hasUnavailable = unavailableItems.length > 0;

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
            <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
              Tu Carrito ({availableItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FBFBF9] dark:bg-[#222220] hover:bg-[#F2F1EC] dark:hover:bg-[#2A2A28] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Aviso de Stock Reconciliado */}
        {hasUnavailable && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 px-5 py-3 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de pieza única</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-tight mt-0.5">
                {unavailableItems.length === 1 
                  ? 'Una prenda de tu carrito fue adquirida por otro comprador y ya no está disponible.'
                  : `${unavailableItems.length} prendas de tu carrito fueron adquiridas por otros compradores y ya no están disponibles.`}
                {' '}El total a pagar se recalculó automáticamente.
              </p>
            </div>
          </div>
        )}

        {/* Cuerpo del Carrito */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {availableItems.length === 0 && unavailableItems.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#F4EFEA] dark:bg-[#1C1C1A] border border-[#C5A880]/30 flex items-center justify-center mx-auto text-[#C5A880] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">
                Tu carrito está vacío
              </h4>
              <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed mb-6 font-light max-w-xs mx-auto">
                Recordá que en ESVEN cada prenda es 1/1 irrepetible. Si encontrás tu corte perfecto, sumalo antes de que se venda.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExplore();
                }}
                className="py-2.5 px-6 rounded-full bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Lista de Prendas Disponibles */}
              {availableItems.length > 0 && (
                <div className="space-y-3 divide-y divide-[#E8E6E1] dark:divide-[#282826]">
                  {availableItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-14 h-14 rounded-xl object-cover bg-white dark:bg-[#181816] shrink-0 border border-[#E8E6E1] dark:border-[#282826]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5F5F0] leading-tight line-clamp-1">{item.name}</h4>
                          <div className="text-[11px] text-[#5A5A5A] dark:text-[#A8A69E] flex items-center gap-1.5 mt-0.5">
                            <span>{item.size}</span>
                            <span>·</span>
                            <span className="text-[#8F7049] dark:text-[#C5A880] font-medium">Pieza Única</span>
                          </div>
                          <span className="font-serif text-sm font-bold text-[#1A1A1A] dark:text-[#F5F5F0] tabular-nums block mt-1">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="p-2 text-[#7A7A7A] dark:text-[#8E8B82] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Quitar prenda del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-sección de Prendas No Disponibles / Vendidas */}
              {hasUnavailable && (
                <div className="pt-4 border-t border-dashed border-[#DCDAD5] dark:border-[#383836]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Prendas No Disponibles ({unavailableItems.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {unavailableItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-neutral-100/90 dark:bg-[#1E1E1C] rounded-2xl border border-neutral-200/80 dark:border-[#282826] flex items-center justify-between gap-3 text-neutral-600 dark:text-neutral-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-700">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover grayscale opacity-60"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white uppercase">Vendido</span>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate line-through">
                              {item.name}
                            </h5>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold block mt-0.5">
                              Ya adquirida por otro comprador
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onMoveToFavorites && (
                            <button
                              type="button"
                              onClick={() => onMoveToFavorites(item)}
                              className="p-1.5 rounded-lg bg-white dark:bg-[#282826] border border-neutral-200 dark:border-neutral-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Pasar a Favoritos"
                            >
                              <Heart className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-lg bg-white dark:bg-[#282826] border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Quitar de la lista"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estimador de Envíos */}
              {availableItems.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816] p-4 rounded-2xl border border-[#E8E6E1] dark:border-[#282826]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] dark:text-[#F5F5F0] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C5A880]" /> Destino del Envío
                    </span>
                    <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
                      {shipping.cost === 0 ? '¡Gratis!' : formatPrice(shipping.cost)}
                    </span>
                  </div>

                  <select
                    value={
                      Object.keys(SHIPPING_RATES).find(key => SHIPPING_RATES[key].name === shipping.service) || 'cabaGba'
                    }
                    onChange={(e) => onShippingChange(e.target.value)}
                    className="w-full text-xs bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl p-2.5 focus:border-[#C5A880] focus:outline-none"
                  >
                    {Object.entries(SHIPPING_RATES).map(([key, rate]) => (
                      <option key={key} value={key}>
                        {rate.name} - {rate.price === 0 ? 'Gratis' : formatPrice(rate.price)} ({rate.days})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer del Carrito */}
        {(availableItems.length > 0 || unavailableItems.length > 0) && (
          <div className="p-5 border-t border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816] space-y-3">
            <div className="space-y-1.5 text-xs text-[#5A5A5A] dark:text-[#A8A69E]">
              <div className="flex justify-between">
                <span>Subtotal ({availableItems.length} {availableItems.length === 1 ? 'prenda disponible' : 'prendas disponibles'})</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F0]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F0]">
                  {availableItems.length === 0 ? '$0' : (shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost))}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] pt-2 border-t border-[#E8E6E1] dark:border-[#282826]">
                <span>Total Estimado</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (availableItems.length > 0) {
                  onClose();
                  onProceedToCheckout();
                }
              }}
              disabled={availableItems.length === 0}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                availableItems.length > 0
                  ? 'bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] cursor-pointer group active:scale-[0.98]'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{availableItems.length > 0 ? 'Iniciar Compra' : 'No hay prendas disponibles'}</span>
              {availableItems.length > 0 && (
                <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
