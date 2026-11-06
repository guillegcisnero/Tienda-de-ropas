import React from 'react';
import { X, Trash2, ShoppingBag, Truck, ArrowRight, AlertTriangle, Heart } from 'lucide-react';
import { Product, ShippingConfig } from '../types';
import { SHIPPING_RATES } from '../data/mockCatalog';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  cart: Product[];
  availableItems?: Product[];
  unavailableItems?: Product[];
  shipping: ShippingConfig;
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onMoveToFavorites?: (product: Product) => void;
  onShippingChange: (regionKey: string) => void;
  onProceedToCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  availableItems = cart,
  unavailableItems = [],
  shipping,
  onClose,
  onRemoveItem,
  onMoveToFavorites,
  onShippingChange,
  onProceedToCheckout,
  onExplore,
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
        className="relative w-full max-w-md bg-[#FBFBF9] text-[#1A1A1A] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft border-l border-[#E8E6E1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 border-b border-[#E8E6E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Tu Carrito ({availableItems.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] border border-[#E8E6E1] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Aviso de Stock Reconciliado */}
        {hasUnavailable && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-3 text-xs text-amber-900 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de pieza única</p>
              <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
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
              <div className="w-16 h-16 rounded-full bg-[#F4EFEA] border border-[#C5A880]/30 flex items-center justify-center mx-auto text-[#C5A880] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2">
                Tu carrito está vacío
              </h4>
              <p className="text-xs text-[#5A5A5A] leading-relaxed mb-6 font-light max-w-xs mx-auto">
                Recordá que en ESVEN cada prenda es 1/1 irrepetible. Si encontrás tu corte perfecto, sumalo antes de que se venda.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExplore();
                }}
                className="py-2.5 px-6 rounded-full bg-[#1A1A1A] hover:bg-black text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Lista de Prendas Disponibles */}
              {availableItems.length > 0 && (
                <div className="space-y-3 divide-y divide-[#E8E6E1]">
                  {availableItems.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-[#E8E6E1]"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[#1A1A1A] leading-tight line-clamp-1">{item.name}</h4>
                          <div className="text-[11px] text-[#5A5A5A] flex items-center gap-1.5 mt-0.5">
                            <span>{item.size}</span>
                            <span>·</span>
                            <span className="text-[#8F7049] font-medium">Pieza Única</span>
                          </div>
                          <span className="font-serif text-sm font-bold text-[#1A1A1A] tabular-nums block mt-1">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => onRemoveItem(item.id)} 
                        className="p-2 text-[#7A7A7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
                <div className="pt-4 border-t border-dashed border-[#DCDAD5]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Prendas No Disponibles ({unavailableItems.length})
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {unavailableItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-neutral-100/90 rounded-2xl border border-neutral-200/80 flex items-center justify-between gap-3 text-neutral-600"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-neutral-300">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover grayscale opacity-60"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white uppercase">Vendido</span>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-neutral-700 truncate line-through">
                              {item.name}
                            </h5>
                            <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">
                              Ya adquirida por otro comprador
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {onMoveToFavorites && (
                            <button
                              type="button"
                              onClick={() => onMoveToFavorites(item)}
                              className="p-1.5 rounded-lg bg-white border border-neutral-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Pasar a Favoritos"
                            >
                              <Heart className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
                <div className="mt-6 pt-5 border-t border-[#E8E6E1] bg-white p-4 rounded-2xl border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C5A880]" /> Destino del Envío
                    </span>
                    <span className="text-xs font-bold text-[#1A1A1A]">
                      {shipping.cost === 0 ? '¡Gratis!' : formatPrice(shipping.cost)}
                    </span>
                  </div>

                  <select
                    value={
                      Object.keys(SHIPPING_RATES).find(key => SHIPPING_RATES[key].name === shipping.service) || 'cabaGba'
                    }
                    onChange={(e) => onShippingChange(e.target.value)}
                    className="w-full text-xs bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl p-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
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
          <div className="p-5 border-t border-[#E8E6E1] bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-[#5A5A5A]">
              <div className="flex justify-between">
                <span>Subtotal ({availableItems.length} {availableItems.length === 1 ? 'prenda disponible' : 'prendas disponibles'})</span>
                <span className="font-semibold text-[#1A1A1A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {availableItems.length === 0 ? '$0' : (shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost))}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-[#1A1A1A] pt-2 border-t border-[#E8E6E1]">
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
                  ? 'bg-[#1A1A1A] hover:bg-black active:scale-[0.98] text-white cursor-pointer group'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
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
