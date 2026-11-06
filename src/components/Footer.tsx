import React, { memo } from 'react';
import { Heart, ShieldCheck, RefreshCw, Truck, QrCode, ShieldAlert, ExternalLink } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';
import { LEGAL_CONFIG } from '../data/legalDocuments';

interface FooterProps {
  storeName: string;
  tagline: string;
  onOpenAdmin?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenReturns?: () => void;
  onOpenRevocationModal?: () => void;
}

export const Footer = memo<FooterProps>(({ 
  tagline, 
  onOpenAdmin,
  onOpenTerms,
  onOpenPrivacy,
  onOpenReturns,
  onOpenRevocationModal
}) => {
  return (
    <footer className="bg-[#FBFBF9] dark:bg-[#121212] border-t border-[#E8E6E1] dark:border-[#282826] text-[#1A1A1A] dark:text-[#F5F5F0] py-14 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges — Moda Circular */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-[#E8E6E1] dark:border-[#282826] text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] text-sm block font-serif">Moda Circular 100%</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed">Curaduría exclusiva de piezas únicas (1/1) sin duplicados.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] text-sm block font-serif">Calidad & Medidas Auditadas</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed">Costuras, cierres y medidas exactas en centímetros.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] text-sm block font-serif">Envíos a Toda Argentina</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed">Despachos seguros con número de seguimiento online.</span>
            </div>
          </div>
        </div>

        {/* Brand Presence & Tagline */}
        <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#E8E6E1]/60 dark:border-[#282826]">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <EsvenLogo variant="horizontal" />
            <span className="hidden sm:inline text-[#C5A880]">|</span>
            <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] max-w-md font-light">
              Una marca concebida bajo la filosofía de Icariel System.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7A7A7A] dark:text-[#8E8B82]">
            <a
              href="https://icarielsystem.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826] hover:border-[#C5A880] text-[#8F7049] dark:text-[#C5A880] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] font-medium transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
              title="Ir al sitio oficial de Icariel System"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] group-hover:scale-125 transition-transform" />
              <span>Powered by Icariel System</span>
              <ExternalLink className="w-3 h-3 text-[#C5A880] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#8F7049] dark:text-[#C5A880] hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] transition-colors cursor-pointer underline text-xs font-semibold"
            >
              Acceso Backoffice
            </button>
          </div>
        </div>

        {/* Legal Links & Botón de Arrepentimiento (Res. 424/2020) */}
        <div className="py-8 border-b border-[#E8E6E1]/60 dark:border-[#282826] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#5A5A5A] dark:text-[#A8A69E]">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              onClick={onOpenTerms}
              className="hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] transition-colors underline cursor-pointer"
            >
              Términos y Condiciones
            </button>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] transition-colors underline cursor-pointer"
            >
              Política de Privacidad
            </button>
            <button
              onClick={onOpenReturns}
              className="hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0] transition-colors underline cursor-pointer"
            >
              Devoluciones, Cambios y Garantía
            </button>
          </nav>

          {/* Botón de Arrepentimiento Ley 24.240 / Res. 424/2020 */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRevocationModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181816] border border-[#8F7049]/40 dark:border-[#C5A880]/30 hover:border-[#8F7049] dark:hover:border-[#C5A880] text-[#1A1A1A] dark:text-[#F5F5F0] hover:bg-[#F3F2EE] dark:hover:bg-[#20201E] font-medium transition-all shadow-2xs cursor-pointer group"
              title="Resolución 424/2020 Secretaría de Comercio: Revocación de compra dentro de los 10 días corridos"
            >
              <ShieldAlert className="w-4 h-4 text-[#8F7049] dark:text-[#C5A880] group-hover:scale-105 transition-transform" />
              <span className="font-semibold text-xs">Botón de Arrepentimiento</span>
            </button>
          </div>
        </div>

        {/* Bottom Credits & Data Fiscal F.960/D */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#7A7A7A] dark:text-[#8E8B82]">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Contenedor Data Fiscal Formulario 960/D (RG AFIP 3377) */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#181816] border border-[#E8E6E1] dark:border-[#282826]">
              <QrCode className="w-5 h-5 text-[#8F7049] dark:text-[#C5A880]" />
              <div className="text-[10px] leading-tight text-left">
                <span className="font-bold text-[#1A1A1A] dark:text-[#F5F5F0] block">Data Fiscal</span>
                <span>F. 960/D · {LEGAL_CONFIG.cuit}</span>
              </div>
            </div>

            <div>
              <span className="font-serif font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">{LEGAL_CONFIG.storeName}</span>
              <span> · {tagline}</span>
              <p className="text-[11px] text-[#8A8A8A] dark:text-[#7A7A7A] mt-0.5">
                {LEGAL_CONFIG.legalEntity} · CUIT {LEGAL_CONFIG.cuit} · {LEGAL_CONFIG.legalAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span>Concebido con calidez textil y diseño atemporal</span>
            <Heart className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
          </div>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
