import React, { useEffect } from 'react';
import { ArrowLeft, FileText, Shield, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';
import { 
  LEGAL_CONFIG, 
  TERMS_AND_CONDITIONS, 
  PRIVACY_POLICY, 
  RETURNS_AND_EXCHANGES_POLICY, 
  TRADEMARK_DISCLAIMER 
} from '../data/legalDocuments';

export type LegalDocType = 'terms' | 'privacy' | 'returns';

interface LegalViewsProps {
  initialDoc?: LegalDocType;
  onBackToStore: () => void;
  onOpenRevocationModal?: () => void;
}

export const LegalViews: React.FC<LegalViewsProps> = ({
  initialDoc = 'terms',
  onBackToStore,
  onOpenRevocationModal
}) => {
  const [activeDoc, setActiveDoc] = React.useState<LegalDocType>(initialDoc);

  useEffect(() => {
    setActiveDoc(initialDoc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialDoc]);

  return (
    <div className="min-h-screen bg-[#FBFBF9] dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#FBFBF9]/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-[#E8E6E1] dark:border-[#282826]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStore}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E8E6E1] dark:border-[#282826] bg-white dark:bg-[#181816] hover:bg-[#F3F2EE] dark:hover:bg-[#20201E] text-xs font-medium text-[#1A1A1A] dark:text-[#F5F5F0] transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#8F7049] dark:text-[#C5A880]" />
              <span>Volver a la tienda</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-[#E8E6E1] dark:bg-[#282826]" />
            <EsvenLogo variant="horizontal" />
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7A7A7A] dark:text-[#8E8B82]">
            <span className="hidden md:inline font-mono">Actualizado: {LEGAL_CONFIG.lastUpdated}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-4 border-b border-[#E8E6E1] dark:border-[#282826]">
          <button
            onClick={() => setActiveDoc('terms')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeDoc === 'terms'
                ? 'bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] shadow-sm font-bold'
                : 'bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] text-[#5A5A5A] dark:text-[#A8A69E] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F3F2EE] dark:hover:bg-[#20201E]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Términos y Condiciones
          </button>

          <button
            onClick={() => setActiveDoc('privacy')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeDoc === 'privacy'
                ? 'bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] shadow-sm font-bold'
                : 'bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] text-[#5A5A5A] dark:text-[#A8A69E] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F3F2EE] dark:hover:bg-[#20201E]'
            }`}
          >
            <Lock className="w-4 h-4" />
            Política de Privacidad
          </button>

          <button
            onClick={() => setActiveDoc('returns')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeDoc === 'returns'
                ? 'bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] shadow-sm font-bold'
                : 'bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] text-[#5A5A5A] dark:text-[#A8A69E] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-[#F3F2EE] dark:hover:bg-[#20201E]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Devoluciones, Cambios y Garantía
          </button>
        </div>

        {/* Document Content */}
        <article className="bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
          {activeDoc === 'terms' && (
            <div>
              <div className="mb-8">
                <span className="px-3 py-1 rounded-full bg-[#8F7049]/10 text-[#8F7049] dark:text-[#C5A880] text-xs font-semibold tracking-wider uppercase">
                  Contrato de Adhesión
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mt-3">
                  Términos y Condiciones Generales de Venta
                </h1>
                <p className="text-xs text-[#7A7A7A] dark:text-[#8E8B82] mt-1">
                  Régimen aplicable a las transacciones electrónicas concertadas en {LEGAL_CONFIG.storeName}.
                </p>
              </div>

              <div className="space-y-6 text-sm text-[#3A3A3A] dark:text-[#D5D3CC] leading-relaxed">
                {TERMS_AND_CONDITIONS.map((sec) => (
                  <section key={sec.id} className="pt-4 border-t border-[#E8E6E1]/60 dark:border-[#282826] first:border-0 first:pt-0">
                    <h2 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">{sec.title}</h2>
                    <p className="whitespace-pre-line text-[#4A4A4A] dark:text-[#A8A69E]">{sec.content}</p>
                  </section>
                ))}
              </div>
            </div>
          )}

          {activeDoc === 'privacy' && (
            <div>
              <div className="mb-8">
                <span className="px-3 py-1 rounded-full bg-[#8F7049]/10 text-[#8F7049] dark:text-[#C5A880] text-xs font-semibold tracking-wider uppercase">
                  Protección de Datos Personales
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mt-3">
                  Política de Privacidad y Tratamiento de Datos
                </h1>
                <p className="text-xs text-[#7A7A7A] dark:text-[#8E8B82] mt-1">
                  En cumplimiento de la Ley Nacional N° 25.326 y normativas de la AAIP.
                </p>
              </div>

              <div className="space-y-6 text-sm text-[#3A3A3A] dark:text-[#D5D3CC] leading-relaxed">
                {PRIVACY_POLICY.map((sec) => (
                  <section key={sec.id} className="pt-4 border-t border-[#E8E6E1]/60 dark:border-[#282826] first:border-0 first:pt-0">
                    <h2 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">{sec.title}</h2>
                    <p className="whitespace-pre-line text-[#4A4A4A] dark:text-[#A8A69E]">{sec.content}</p>
                  </section>
                ))}
              </div>
            </div>
          )}

          {activeDoc === 'returns' && (
            <div>
              <div className="mb-8">
                <span className="px-3 py-1 rounded-full bg-[#8F7049]/10 text-[#8F7049] dark:text-[#C5A880] text-xs font-semibold tracking-wider uppercase">
                  Defensa del Consumidor
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mt-3">
                  Régimen de Devoluciones, Cambios y Garantías
                </h1>
                <p className="text-xs text-[#7A7A7A] dark:text-[#8E8B82] mt-1">
                  Conforme al Art. 34 de la Ley 24.240, Código Civil y Comercial y Resolución 424/2020.
                </p>
              </div>

              {/* Botón de arrepentimiento destacado */}
              <div className="bg-[#F3F2EE] dark:bg-[#121212] border border-[#8F7049]/30 dark:border-[#C5A880]/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] text-[#8F7049] dark:text-[#C5A880] flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#1A1A1A] dark:text-[#F5F5F0]">¿Deseás revocar una compra reciente?</h3>
                    <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E]">Tenés 10 días corridos desde la entrega sin ningún costo.</p>
                  </div>
                </div>

                {onOpenRevocationModal && (
                  <button
                    onClick={onOpenRevocationModal}
                    className="px-4 py-2 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Abrir Botón de Arrepentimiento
                  </button>
                )}
              </div>

              <div className="space-y-6 text-sm text-[#3A3A3A] dark:text-[#D5D3CC] leading-relaxed">
                {RETURNS_AND_EXCHANGES_POLICY.map((sec) => (
                  <section key={sec.id} className="pt-4 border-t border-[#E8E6E1]/60 dark:border-[#282826] first:border-0 first:pt-0">
                    <h2 className="text-base font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">{sec.title}</h2>
                    <p className="whitespace-pre-line text-[#4A4A4A] dark:text-[#A8A69E]">{sec.content}</p>
                  </section>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer de Marcas Registradas (siempre al pie de todos los documentos) */}
          <div className="mt-12 pt-6 border-t border-[#E8E6E1] dark:border-[#282826] bg-[#FBFBF9] dark:bg-[#121212] p-5 rounded-xl border border-[#E8E6E1] dark:border-[#282826]">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#8F7049] dark:text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5F5F0] font-serif uppercase tracking-wider mb-1">
                  {TRADEMARK_DISCLAIMER.title}
                </h3>
                <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed">
                  {TRADEMARK_DISCLAIMER.content}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Footer identificatorio legal */}
        <div className="mt-8 text-center text-xs text-[#7A7A7A] dark:text-[#8E8B82] space-y-1">
          <p>{LEGAL_CONFIG.storeName} · Operada por {LEGAL_CONFIG.legalEntity} · CUIT {LEGAL_CONFIG.cuit}</p>
          <p>{LEGAL_CONFIG.legalAddress} · {LEGAL_CONFIG.jurisdiction}</p>
        </div>
      </main>
    </div>
  );
};
