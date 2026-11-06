import React, { useState } from 'react';
import { X, CreditCard, MessageCircle, ShieldCheck } from 'lucide-react';
import { Product, ShippingConfig, BuyerInfo } from '../types';
import { createPaymentPreference } from '../services/payment';
import { buildWhatsAppOrderUrl } from '../services/whatsapp';
import { formatPrice } from '../utils/formatters';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: Product[];
  shipping: ShippingConfig;
  whatsappNumber: string;
  onClose: () => void;
  onSuccessOrder: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  shipping,
  whatsappNumber,
  onClose,
  onSuccessOrder
}) => {
  const [buyer, setBuyer] = useState<BuyerInfo>({
    name: '',
    phone: '',
    email: '',
    province: shipping.province || 'CABA',
    address: '',
    postalCode: ''
  });
  const [isProcessingMp, setIsProcessingMp] = useState(false);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + shipping.cost;

  // Flujo 1: Mercado Pago
  const handlePayWithMercadoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer.name || !buyer.phone || !buyer.email || !buyer.address) {
      alert('Por favor completá los campos obligatorios para el envío.');
      return;
    }

    setIsProcessingMp(true);
    try {
      const response = await createPaymentPreference({ cart, buyer, shipping });
      if (response?.initPoint) {
        window.location.href = response.initPoint;
      } else {
        alert('Hubo un inconveniente al conectar con Mercado Pago. Podés finalizar tu pedido directamente por WhatsApp.');
      }
    } catch {
      alert('Error al iniciar pago. Por favor probá finalizando por WhatsApp.');
    } finally {
      setIsProcessingMp(false);
    }
  };

  // Flujo 2: WhatsApp Directo
  const handlePayWithWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer.name || !buyer.phone) {
      alert('Por favor ingresá al menos tu Nombre y WhatsApp para coordinar el pedido.');
      return;
    }

    const url = buildWhatsAppOrderUrl({
      cart,
      buyer,
      shipping,
      total,
      whatsappNumber
    });
    window.open(url, '_blank');
    onSuccessOrder();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white text-[#1A1A1A] rounded-3xl shadow-2xl border border-[#E8E6E1] p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] border border-[#E8E6E1] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-1">
          Finalizar Compra
        </h3>
        <p className="text-xs text-[#5A5A5A] mb-6 font-light">
          Completá tus datos de envío y elegí cómo querés abonar tus prendas únicas en ESVEN.
        </p>

        {/* Order Summary Strip — Marfil Seda */}
        <div className="bg-[#FBFBF9] rounded-2xl p-4 border border-[#E8E6E1] mb-6 space-y-1.5 text-xs text-[#5A5A5A]">
          <div className="flex justify-between">
            <span>Prendas seleccionadas ({cart.length})</span>
            <span className="font-semibold text-[#1A1A1A]">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío ({shipping.service})</span>
            <span className="font-semibold text-[#1A1A1A]">
              {shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost)}
            </span>
          </div>
          <div className="flex justify-between text-sm font-serif font-bold text-[#1A1A1A] pt-2 border-t border-[#E8E6E1]">
            <span>Total Final</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        {/* Reservation Guarantee Badge */}
        <div className="bg-[#F4EFEA] border border-[#C5A880]/30 rounded-xl px-3.5 py-2 mb-5 flex items-center gap-2 text-[11px] text-[#8F7049]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
          <span><strong>Reserva garantizada:</strong> Al avanzar bloqueamos tus prendas únicas para que nadie más las compre.</span>
        </div>

        {/* Buyer Form */}
        <form onSubmit={handlePayWithMercadoPago} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1A1A1A] font-semibold mb-1">Nombre Completo *</label>
            <input 
              type="text" 
              required
              value={buyer.name}
              onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
              placeholder="Ej: Laura Gómez" 
              className="w-full bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">WhatsApp / Teléfono *</label>
              <input 
                type="tel" 
                required
                value={buyer.phone}
                onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                placeholder="Ej: 11 3456-7890" 
                className="w-full bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">Email *</label>
              <input 
                type="email" 
                required
                value={buyer.email}
                onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                placeholder="tu@email.com" 
                className="w-full bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#1A1A1A] font-semibold mb-1">Dirección y Altura *</label>
              <input 
                type="text" 
                required
                value={buyer.address}
                onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                placeholder="Ej: Av. Alvear 1850, Piso 3 B" 
                className="w-full bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#1A1A1A] font-semibold mb-1">Código Postal</label>
              <input 
                type="text" 
                value={buyer.postalCode}
                onChange={(e) => setBuyer({ ...buyer, postalCode: e.target.value })}
                placeholder="Ej: 1425" 
                className="w-full bg-[#FBFBF9] text-[#1A1A1A] border border-[#E8E6E1] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Gateways Options */}
          <div className="pt-4 border-t border-[#E8E6E1] space-y-3">
            {/* 1. Cajero Automático: Mercado Pago Directo */}
            <button
              type="submit"
              disabled={isProcessingMp}
              className="w-full py-3.5 px-6 rounded-xl bg-[#009EE3] hover:bg-[#0089C7] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessingMp ? 'Conectando con Mercado Pago...' : 'Pagar con Mercado Pago (Tarjetas, Débito, Saldo)'}</span>
            </button>

            {/* 2. Mostrador Humano: WhatsApp Directo */}
            <button
              type="button"
              onClick={handlePayWithWhatsApp}
              className="w-full py-3.5 px-6 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Coordinar y Pagar por WhatsApp (Transferencia / Alias)</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7A7A] text-center pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Tus datos están protegidos. No almacenamos datos de tarjetas.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
