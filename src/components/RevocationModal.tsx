import React, { useState } from 'react';
import { X, ShieldAlert, ArrowRight, CheckCircle, Copy, Check, MessageCircle } from 'lucide-react';
import { registerRevocation } from '../services/revocationService';
import { LEGAL_CONFIG } from '../data/legalDocuments';

interface RevocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RevocationModal: React.FC<RevocationModalProps> = ({ isOpen, onClose }) => {
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      alert('Por favor completa todos los campos obligatorios (*)');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerRevocation({
        orderCode: orderCode.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        reason: reason.trim() || undefined
      });

      if (result.success && result.revocation) {
        setGeneratedCode(result.revocation.code);
      } else {
        alert(result.error || 'Ocurrió un error al procesar la solicitud.');
      }
    } catch {
      alert('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppFollowUp = () => {
    const text = encodeURIComponent(
      `Hola ESVEN, he emitido mi solicitud de arrepentimiento con el código *${generatedCode}* correspondiente al pedido *${orderCode}*. Deseo coordinar el envío de la etiqueta de devolución.`
    );
    const cleanNumber = (LEGAL_CONFIG.contactPhone || '').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setOrderCode('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FBFBF9] dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] text-[#1A1A1A] dark:text-[#F5F5F0] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-[#E8E6E1] dark:border-[#282826] flex items-center justify-between bg-white dark:bg-[#141412]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8F7049]/10 text-[#8F7049] dark:text-[#C5A880] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">Botón de Arrepentimiento</h2>
              <p className="text-xs text-[#7A7A7A] dark:text-[#8E8B82]">Art. 34 Ley 24.240 y Resolución 424/2020</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-[#7A7A7A] dark:text-[#8E8B82] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] hover:bg-[#F3F2EE] dark:hover:bg-[#222220] rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {!generatedCode ? (
            <>
              <div className="bg-[#F3F2EE] dark:bg-[#121212] p-4 rounded-xl text-xs text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed border border-[#E8E6E1] dark:border-[#282826]">
                <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block mb-1">Derecho Legal de Revocación:</strong>
                Podés revocar tu compra dentro de los <strong>10 días corridos</strong> contados desde la recepción del paquete. El reintegro es total y el costo de devolución corre <strong>por cuenta de ESVEN</strong>. La prenda debe encontrarse en el mismo estado en que fue entregada, sin uso posterior ni daños.
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0] uppercase tracking-wider mb-1.5">
                    Código de Pedido / Factura *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: ESV-1042 o número de orden"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] focus:outline-hidden focus:border-[#8F7049] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0] uppercase tracking-wider mb-1.5">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Tu nombre y apellido"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] focus:outline-hidden focus:border-[#8F7049] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0] uppercase tracking-wider mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 11 5555-5555"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] focus:outline-hidden focus:border-[#8F7049] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0] uppercase tracking-wider mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] focus:outline-hidden focus:border-[#8F7049] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0] uppercase tracking-wider mb-1.5">
                    Motivo (Opcional - Sin Expresión de Causa)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Contanos brevemente qué ocurrió (no obligatorio para revocar)."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] focus:outline-hidden focus:border-[#8F7049] transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] font-medium text-sm hover:bg-black dark:hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? 'Registrando solicitud...' : 'Emitir Código de Arrepentimiento'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="py-4 text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">Revocación Registrada con Éxito</h3>
                <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] mt-1 max-w-sm mx-auto">
                  De acuerdo con el Art. 3 de la Resolución 424/2020, este es tu código oficial de identificación de trámite:
                </p>
              </div>

              <div className="bg-white dark:bg-[#121212] border-2 border-[#8F7049]/40 dark:border-[#C5A880]/40 p-4 rounded-2xl flex items-center justify-between max-w-xs mx-auto shadow-2xs">
                <span className="font-mono text-lg font-bold text-[#1A1A1A] dark:text-[#F5F5F0] tracking-wider">{generatedCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-[#F3F2EE] dark:bg-[#20201E] hover:bg-[#E8E6E1] dark:hover:bg-[#282826] text-[#1A1A1A] dark:text-[#F5F5F0] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="bg-[#F3F2EE] dark:bg-[#121212] p-4 rounded-xl text-left text-xs text-[#5A5A5A] dark:text-[#A8A69E] space-y-2 border border-[#E8E6E1] dark:border-[#282826]">
                <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block">Próximos Pasos:</strong>
                <p>1. Te contactaremos dentro de las 24 horas hábiles a <strong>{customerEmail}</strong> para coordinar la etiqueta de despacho o retiro del paquete.</p>
                <p>2. Recordá conservar la prenda en su empaque y sin signos de uso para la inspección física de conformidad.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleWhatsAppFollowUp}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Acelerar por WhatsApp
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816] hover:bg-[#F3F2EE] dark:hover:bg-[#20201E] text-[#1A1A1A] dark:text-[#F5F5F0] font-medium text-xs transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
