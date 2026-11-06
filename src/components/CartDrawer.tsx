import React from 'react';
import { X, Trash2, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { Product, ShippingConfig } from '../types';
import { SHIPPING_RATES } from '../data/mockCatalog';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  cart: Product[];
  shipping: ShippingConfig;
  onClose: () => void;
  onRemoveItem: (productId: string) => void;
  onShippingChange: (regionKey: string) => void;
  onProceedToCheckout: () => void;
  onExplore: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  cart,
  shipping,
  onClose,
  onRemoveItem,
  onShippingChange,
  onProceedToCheckout,
  onExplore
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + shipping.cost;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Drawer Panel — Marfil Seda & Calidez Textil */}
      <div 
        className="relative w-full max-w-md bg-[#FBFBF9] text-[#1A1A1A] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft border-l border-[#E8E6E1]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E8E6E1] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Tu Carrito ({cart.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] border border-[#E8E6E1] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
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
              {/* Items List */}
              <div className="space-y-3 divide-y divide-[#E8E6E1]">
                {cart.map(item => (
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
                          <span className="text-[#8F7049] font-medium">Prenda Única</span>
                        </div>
                        <span className="font-serif text-sm font-bold text-[#1A1A1A] tabular-nums block mt-1">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.id)} 
                      className="p-2 text-[#7A7A7A] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Quitar prenda única del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Shipping Estimator — Contenedor Blanco & Acento Champaña */}
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
            </>
          )}
        </div>

        {/* Drawer Footer — 80/15/5 */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#E8E6E1] bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-[#5A5A5A]">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'prenda' : 'prendas'})</span>
                <span className="font-semibold text-[#1A1A1A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-[#1A1A1A] pt-2 border-t border-[#E8E6E1]">
                <span>Total Estimado</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-[#1A1A1A] hover:bg-black active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Iniciar Compra</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
