import React, { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, MessageCircle, ShieldCheck, Clock, ExternalLink, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, ShippingConfig, BuyerInfo } from '../types';
import { createPaymentPreference, releasePaymentReservation } from '../services/payment';
import { buildWhatsAppOrderUrl } from '../services/whatsapp';
import { formatPrice } from '../utils/formatters';
import { createOrder } from '../services/orderService';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: Product[];
  shipping: ShippingConfig;
  whatsappNumber: string;
  onClose: () => void;
  onSuccessOrder: () => void;
  onOpenTerms?: () => void;
  onOpenReturns?: () => void;
}

interface ActiveReservation {
  expiresAt: number; // timestamp en ms
  productIds: string[];
  initPoint: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  shipping,
  whatsappNumber,
  onClose,
  onSuccessOrder,
  onOpenTerms,
  onOpenReturns
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Estado de Reserva Activa con Contador Regresivo (TTL 15 Min)
  const [activeReservation, setActiveReservation] = useState<ActiveReservation | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(15 * 60);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  // Intervalo dinámico de cuenta regresiva
  useEffect(() => {
    if (!activeReservation) return;

    const tick = () => {
      const remainingMs = activeReservation.expiresAt - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeLeftSeconds(remainingSec);
      if (remainingSec === 0) {
        // Expiró el tiempo de reserva pasivo
        releasePaymentReservation(activeReservation.productIds).catch(() => {});
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [activeReservation]);

  const handleClose = async () => {
    if (activeReservation && timeLeftSeconds > 0 && !paymentVerified) {
      const confirmClose = window.confirm('¿Querés cancelar tu reserva de 15 minutos y liberar las prendas para otros compradores?');
      if (confirmClose) {
        await releasePaymentReservation(activeReservation.productIds);
        setActiveReservation(null);
        onClose();
      }
      return;
    }
    setActiveReservation(null);
    onClose();
  };

  const handleCancelReservation = async () => {
    if (!activeReservation) return;
    setIsCancellingReservation(true);
    try {
      await releasePaymentReservation(activeReservation.productIds);
      setActiveReservation(null);
    } finally {
      setIsCancellingReservation(false);
    }
  };

  const handleCheckPaymentStatus = async () => {
    if (!activeReservation) return;
    setIsCheckingPayment(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase
          .from('products')
          .select('status')
          .in('id', activeReservation.productIds);

        const allSold = data && data.length > 0 && data.every(p => p.status === 'sold');
        if (allSold) {
          setPaymentVerified(true);
          onSuccessOrder();
          return;
        }
      }
      alert('El pago aún no se encuentra registrado como aprobado. Si acabás de abonar en Mercado Pago, puede demorar unos segundos en impactar.');
    } catch {
      alert('No se pudo verificar el estado en este momento. Reintentá en unos instantes.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

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
    if (!acceptedTerms) {
      alert('Por favor aceptá los Términos y Condiciones y las Políticas de Devolución para continuar.');
      return;
    }

    setIsProcessingMp(true);
    try {
      // Registrar orden en base de datos de Supabase
      await createOrder({
        cart,
        buyer,
        shipping,
        total,
        gateway: 'mercadopago',
        paymentStatus: 'pending'
      });

      const response = await createPaymentPreference({ cart, buyer, shipping });
      if (response?.initPoint) {
        // Abrir Mercado Pago en nueva pestaña
        window.open(response.initPoint, '_blank');

        const expiresAt = response.reservationExpiresAt
          ? new Date(response.reservationExpiresAt).getTime()
          : Date.now() + 15 * 60 * 1000;

        setActiveReservation({
          expiresAt,
          productIds: response.reservedProductIds || cart.map(i => i.id),
          initPoint: response.initPoint
        });
      } else {
        alert(response?.message || 'Hubo un inconveniente al conectar con Mercado Pago. Podés finalizar tu pedido directamente por WhatsApp.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al iniciar pago. Por favor probá finalizando por WhatsApp.');
    } finally {
      setIsProcessingMp(false);
    }
  };

  // Flujo 2: WhatsApp Directo
  const handlePayWithWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyer.name || !buyer.phone) {
      alert('Por favor ingresá al menos tu Nombre y WhatsApp para coordinar el pedido.');
      return;
    }
    if (!acceptedTerms) {
      alert('Por favor aceptá los Términos y Condiciones y las Políticas de Devolución para continuar.');
      return;
    }

    // Registrar orden en base de datos de Supabase
    await createOrder({
      cart,
      buyer,
      shipping,
      total,
      gateway: 'whatsapp',
      paymentStatus: 'pending'
    });

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

  // Formateo del temporizador mm:ss
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#E8E6E1] dark:border-[#282826] p-6 sm:p-8 max-h-[92vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] dark:bg-[#222220] hover:bg-[#F2F1EC] dark:hover:bg-[#2A2A28] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {activeReservation ? (
          <div className="py-4 text-center space-y-6 animate-fadeIn">
            {paymentVerified ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4EFEA] dark:bg-[#1E1E1C] border border-[#C5A880] flex items-center justify-center mx-auto text-[#C5A880]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
                  ¡Pago Confirmado!
                </h3>
                <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] max-w-md mx-auto leading-relaxed">
                  Tu pago en Mercado Pago ha sido acreditado exitosamente. Las prendas ya son tuyas y nos encontramos preparando tu pedido con el máximo cuidado.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Continuar en la Tienda
                </button>
              </div>
            ) : timeLeftSeconds === 0 ? (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F4F4F0] dark:bg-[#1C1C1A] border border-[#E5E3DC] dark:border-[#2A2A28] flex items-center justify-center mx-auto text-[#8C8C88]">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
                  Tiempo de Reserva Expirado
                </h3>
                <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] max-w-md mx-auto leading-relaxed">
                  Los 15 minutos de exclusividad han finalizado y las prendas se han liberado automáticamente para otros compradores.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Volver al Catálogo
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFEA] dark:bg-[#1E1E1C] border border-[#C5A880]/30 text-[#8F7049] dark:text-[#C5A880] text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Prendas 1/1 Reservadas Exclusivamente Para Vos</span>
                </div>

                <div>
                  <div className="font-serif text-5xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#F5F5F0] tabular-nums my-2">
                    {formattedCountdown}
                  </div>
                  <p className="text-xs text-[#7A7A7A] dark:text-[#8E8B82]">
                    minutos restantes antes de liberar la exclusividad
                  </p>
                </div>

                <div className="bg-[#FBFBF9] dark:bg-[#121212] rounded-2xl p-4 border border-[#E8E6E1] dark:border-[#282826] text-left text-xs space-y-2">
                  <div className="flex items-center justify-between text-[#5A5A5A] dark:text-[#A8A69E]">
                    <span>Total a abonar en Mercado Pago:</span>
                    <span className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-[#F5F5F0]">{formatPrice(total)}</span>
                  </div>
                  <p className="text-[11px] text-[#7A7A7A] dark:text-[#8E8B82] leading-relaxed">
                    Hemos abierto la pasarela oficial de Mercado Pago en una nueva pestaña. Podés pagar con tarjetas, débito o dinero en cuenta.
                  </p>
                  <a
                    href={activeReservation.initPoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#009EE3] hover:underline font-semibold text-xs pt-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>¿No se abrió la ventana de pago? Hacé clic acá para abrirla</span>
                  </a>
                </div>

                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={isCheckingPayment}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#009EE3] hover:bg-[#0089C7] active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                    <span>{isCheckingPayment ? 'Verificando con Mercado Pago...' : 'Ya pagué, verificar acreditación'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelReservation}
                    disabled={isCancellingReservation}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#E8E6E1] dark:border-[#282826] hover:bg-[#FBFBF9] dark:hover:bg-[#20201E] text-[#7A7A7A] dark:text-[#8E8B82] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isCancellingReservation ? 'Liberando prendas...' : 'Cancelar reserva y liberar prendas ahora'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-1">
              Finalizar Compra
            </h3>
            <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] mb-6 font-light">
              Completá tus datos de envío y elegí cómo querés abonar tus prendas únicas en ESVEN.
            </p>

            {/* Order Summary Strip — Marfil Seda */}
            <div className="bg-[#FBFBF9] dark:bg-[#121212] rounded-2xl p-4 border border-[#E8E6E1] dark:border-[#282826] mb-6 space-y-1.5 text-xs text-[#5A5A5A] dark:text-[#A8A69E]">
              <div className="flex justify-between">
                <span>Prendas seleccionadas ({cart.length})</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F0]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío ({shipping.service})</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-[#F5F5F0]">
                  {shipping.cost === 0 ? 'Gratis' : formatPrice(shipping.cost)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] pt-2 border-t border-[#E8E6E1] dark:border-[#282826]">
                <span>Total Final</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Reservation Guarantee Badge */}
            <div className="bg-[#F4EFEA] dark:bg-[#1E1E1C] border border-[#C5A880]/30 rounded-xl px-3.5 py-2 mb-5 flex items-center gap-2 text-[11px] text-[#8F7049] dark:text-[#C5A880]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
              <span><strong>Reserva garantizada:</strong> Al avanzar bloqueamos tus prendas únicas para que nadie más las compre.</span>
            </div>

            {/* Buyer Form */}
            <form onSubmit={handlePayWithMercadoPago} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  required
                  value={buyer.name}
                  onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
                  placeholder="Ej: Laura Gómez" 
                  className="w-full bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold mb-1">WhatsApp / Teléfono *</label>
                  <input 
                    type="tel" 
                    required
                    value={buyer.phone}
                    onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
                    placeholder="Ej: 11 3456-7890" 
                    className="w-full bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold mb-1">Email *</label>
                  <input 
                    type="email" 
                    required
                    value={buyer.email}
                    onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                    placeholder="tu@email.com" 
                    className="w-full bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold mb-1">Dirección y Altura *</label>
                  <input 
                    type="text" 
                    required
                    value={buyer.address}
                    onChange={(e) => setBuyer({ ...buyer, address: e.target.value })}
                    placeholder="Ej: Av. Alvear 1850, Piso 3 B" 
                    className="w-full bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1A1A1A] dark:text-[#F5F5F0] font-semibold mb-1">Código Postal</label>
                  <input 
                    type="text" 
                    value={buyer.postalCode}
                    onChange={(e) => setBuyer({ ...buyer, postalCode: e.target.value })}
                    placeholder="Ej: 1425" 
                    className="w-full bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] rounded-xl px-3.5 py-2.5 focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none"
                  />
                </div>
              </div>

              {/* Legal Consent Checkbox (Ley 24.240 / Ley 25.326) */}
              <div className="pt-3 pb-1">
                <label className="flex items-start gap-2.5 text-xs text-[#5A5A5A] dark:text-[#A8A69E] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#E8E6E1] dark:border-[#282826] text-[#8F7049] focus:ring-[#8F7049] accent-[#8F7049] cursor-pointer shrink-0"
                  />
                  <span className="leading-relaxed">
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="text-[#8F7049] dark:text-[#C5A880] underline hover:text-[#1A1A1A] dark:hover:text-white font-medium"
                    >
                      Términos y Condiciones
                    </button>
                    {' '}y las{' '}
                    <button
                      type="button"
                      onClick={onOpenReturns}
                      className="text-[#8F7049] dark:text-[#C5A880] underline hover:text-[#1A1A1A] dark:hover:text-white font-medium"
                    >
                      Políticas de Devolución
                    </button>
                    {' '}de ESVEN (Prendas 1/1 y Arrepentimiento en 10 días).
                  </span>
                </label>
              </div>

              {/* Payment Gateways Options */}
              <div className="pt-3 border-t border-[#E8E6E1] dark:border-[#282826] space-y-3">
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

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A7A7A] dark:text-[#8E8B82] text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Tus datos están protegidos. No almacenamos datos de tarjetas.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
