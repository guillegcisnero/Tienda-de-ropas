import React, { memo } from 'react';
import { Heart, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';

interface FooterProps {
  storeName: string;
  tagline: string;
  onOpenAdmin?: () => void;
}

export const Footer = memo<FooterProps>(({ tagline, onOpenAdmin }) => {
  return (
    <footer className="bg-[#FBFBF9] border-t border-[#E8E6E1] text-[#1A1A1A] py-14 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges — Algodón & Lujo Silencioso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-[#E8E6E1] text-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] text-sm block font-serif">Moda Circular 100%</strong>
              <span className="text-[#5A5A5A] leading-relaxed">Extendiendo el ciclo de vida de prendas seleccionadas 1/1.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] text-sm block font-serif">Calidad Verificada</strong>
              <span className="text-[#5A5A5A] leading-relaxed">Costuras, cierres y medidas auditadas artesanalmente.</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white border border-[#E8E6E1] shadow-2xs flex items-center justify-center text-[#C5A880] shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-[#1A1A1A] text-sm block font-serif">Envíos a Toda Argentina</strong>
              <span className="text-[#5A5A5A] leading-relaxed">Despachos seguros con número de seguimiento online.</span>
            </div>
          </div>
        </div>

        {/* Brand Presence & Tagline */}
        <div className="py-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#E8E6E1]/60">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <EsvenLogo variant="horizontal" />
            <span className="hidden sm:inline text-[#C5A880]">|</span>
            <p className="text-xs text-[#5A5A5A] max-w-md font-light">
              Curated Circular Fashion Web Store. Algodón & Champaña Pálido. Una marca concebida bajo la filosofía de Icariel.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#7A7A7A]">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E8E6E1] text-[#8F7049] font-medium">
              Paleta 80 / 15 / 5
            </span>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#8F7049] hover:text-[#1A1A1A] transition-colors cursor-pointer underline text-xs font-semibold"
            >
              Acceso Backoffice
            </button>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A7A7A]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-[#1A1A1A]">ESVEN</span>
            <span>·</span>
            <span>{tagline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Concebido con calidez textil y lujo silencioso</span>
            <Heart className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880]" />
          </div>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
