import React from 'react';
import { X, Trash2, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { Product, ShippingConfig } from '../types';
import { SHIPPING_RATES } from '../data/mockCatalog';

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

  const formatPrice = (val: number) => {
    return '$' + val.toLocaleString('es-AR');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-md bg-[#F4E8E8] text-[#2c221e] h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DEC0C0] flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#68544d]" />
            <h3 className="font-serif text-lg font-bold text-[#2c221e]">
              Tu Carrito ({cart.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#5c4b45]/10 hover:bg-[#5c4b45]/20 text-[#2c221e] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-[#EBD5D5] flex items-center justify-center mx-auto text-[#68544d] mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#2c221e] mb-2">
                Tu carrito está vacío
              </h4>
              <p className="text-xs text-[#5c4b45] leading-relaxed mb-6 font-light max-w-xs mx-auto">
                Recordá que cada prenda es única. Si ves algo que te gusta, sumalo antes de que se venda.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExplore();
                }}
                className="py-2.5 px-6 rounded-full bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3 divide-y divide-[#DEC0C0]/60">
                {cart.map(item => (
                  <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-xl object-cover bg-[#55443e]/10 shrink-0 border border-[#DEC0C0]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#2c221e] leading-tight line-clamp-1">{item.name}</h4>
                        <div className="text-[11px] text-[#5c4b45] flex items-center gap-1.5 mt-0.5">
                          <span>{item.size}</span>
                          <span>·</span>
                          <span className="text-emerald-800 font-medium">Prenda Única</span>
                        </div>
                        <span className="font-serif text-sm font-bold text-[#68544d] tabular-nums block mt-1">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onRemoveItem(item.id)} 
                      className="p-2 text-[#5c4b45] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Quitar prenda única del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Shipping Estimator */}
              <div className="mt-6 pt-5 border-t border-[#DEC0C0] bg-white/60 p-4 rounded-2xl border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2c221e] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#EA8A8A]" /> Destino del Envío
                  </span>
                  <span className="text-xs font-bold text-[#68544d]">
                    {shipping.cost === 0 ? '¡Gratis!' : formatPrice(shipping.cost)}
                  </span>
                </div>

                <select
                  value={
                    Object.keys(SHIPPING_RATES).find(key => SHIPPING_RATES[key].name === shipping.service) || 'cabaGba'
                  }
                  onChange={(e) => onShippingChange(e.target.value)}
                  className="w-full text-xs bg-white text-[#2c221e] border border-[#DEC0C0] rounded-xl p-2.5 focus:border-[#EA8A8A] focus:outline-none"
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

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#DEC0C0] bg-white/70 space-y-3">
            <div className="space-y-1.5 text-xs text-[#5c4b45]">
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} {cart.length === 1 ? 'prenda' : 'prendas'})</span>
                <span className="font-semibold text-[#2c221e]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de Envío</span>
                <span className="font-semibold text-[#2c221e]">
                  {shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between text-base font-serif font-bold text-[#68544d] pt-2 border-t border-[#DEC0C0]">
                <span>Total Estimado</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] active:scale-[0.98] text-[#2c221e] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
