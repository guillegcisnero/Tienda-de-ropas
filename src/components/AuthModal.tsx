import React, { useState } from 'react';
import { X, Mail, Sparkles, ArrowRight, CheckCircle2, AlertCircle, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInWithEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  onSignInWithGoogle: () => Promise<{ success: boolean; message: string }>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInWithEmail,
  onSignInWithGoogle,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setFeedback({ type: 'error', message: 'Ingresá un correo electrónico válido' });
      return;
    }

    setLoading(true);
    setFeedback(null);
    const result = await onSignInWithEmail(email);
    setLoading(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1800);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleGoogleClick = async () => {
    setLoading(true);
    setFeedback(null);
    const result = await onSignInWithGoogle();
    setLoading(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white text-[#1A1A1A] rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden p-6 sm:p-8 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] border border-[#E8E6E1] flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Cerrar modal de autenticación"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FBFBF9] border border-[#C5A880]/30 text-[#8F7049] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6 text-[#C5A880]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
            Tu Espacio en ESVEN
          </h3>
          <p className="text-xs text-[#5A5A5A] mt-1 font-light">
            Sincronizá tus prendas favoritas y tu carrito entre tu móvil y tu computadora.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div 
            className={`p-3.5 rounded-2xl mb-5 text-xs flex items-center gap-2.5 animate-fadeIn ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Botón Google 1-Click */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl border border-[#E8E6E1] bg-white hover:bg-[#FBFBF9] text-xs font-bold text-[#1A1A1A] transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Separador */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#E8E6E1]"></div>
          <span className="px-3 text-[11px] uppercase tracking-wider text-[#A0A0A0] font-medium">o con tu email</span>
          <div className="flex-1 border-t border-[#E8E6E1]"></div>
        </div>

        {/* Formulario Email / Magic Link */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A5A] mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A7A7A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#FBFBF9] border border-[#E8E6E1] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C5A880] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{loading ? 'Accediendo...' : 'Acceder sin contraseña'}</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </button>
        </form>

        {/* Nota de Seguridad */}
        <div className="mt-5 pt-4 border-t border-[#EDEBE6] flex items-center justify-center gap-1.5 text-[10px] text-[#7A7A7A]">
          <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Sin contraseñas difíciles. Acceso seguro y privado.</span>
        </div>
      </div>
    </div>
  );
};
