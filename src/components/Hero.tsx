import React, { memo } from 'react';
import { Sparkles, ArrowDown, Ruler, CheckCircle2, Truck, ShieldCheck } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';

interface HeroProps {
  onOpenGuide: () => void;
  onExplore: () => void;
}

export const Hero = memo<HeroProps>(({ onOpenGuide, onExplore }) => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#E8E6E1] bg-[#FBFBF9]">
      {/* Subtle Warm Textile Accents & Watermark */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#C5A880]/5 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#F4EFEA] blur-3xl pointer-events-none"></div>

      {/* Background Watermark of Isotipo */}
      <div className="absolute right-6 sm:right-16 top-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none hidden lg:block">
        <EsvenLogo variant="symbol" className="w-96 h-96" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" /> Curaduría Circular · Lujo Silencioso
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1A1A] leading-[1.15] mb-5">
            Calidez textil, <br/>
            <span className="italic font-normal text-[#C5A880]">prendas únicas</span> para tu día.
          </h1>
          <p className="text-base sm:text-lg text-[#5A5A5A] leading-relaxed mb-8 max-w-2xl font-light">
            Selección artesanal de indumentaria circular pre-loved y urbana. Cada pieza es irrepetible 1/1, ha sido verificada en calidad y cuenta con su ficha técnica de <strong>medidas exactas en centímetros</strong>.
          </p>

          {/* Action CTAs — Regla 80/15/5: Botón Primario Negro Suave, Secundario Oro Champaña */}
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-black text-white font-semibold shadow-md transition-all active:scale-95 text-sm sm:text-base cursor-pointer group"
            >
              <span>Explorar Catálogo Único</span>
              <ArrowDown className="w-4 h-4 text-[#C5A880] group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button 
              onClick={onOpenGuide}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#FBFBF9] text-[#1A1A1A] font-medium border border-[#E8E6E1] hover:border-[#C5A880] shadow-xs transition-colors text-sm sm:text-base cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-[#C5A880]" />
              <span>¿Cómo medimos las prendas?</span>
            </button>
          </div>

          {/* Micro Features Bar — Calidez Textil & Detalles de Costura */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-[#E8E6E1] text-xs sm:text-sm text-[#5A5A5A]">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Stock 1/1 por ítem (Sin duplicados)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Envíos a todo el país (Correo & OCA)</span>
            </div>
            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Mercado Pago & WhatsApp Directo</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

Hero.displayName = 'Hero';
