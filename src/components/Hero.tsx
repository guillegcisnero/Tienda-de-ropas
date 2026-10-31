import React from 'react';
import { Sparkles, ArrowDown, Ruler, CheckCircle2, Truck, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onOpenGuide: () => void;
  onExplore: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenGuide, onExplore }) => {
  return (
    <section className="relative overflow-hidden py-14 sm:py-20 border-b border-white/10 bg-gradient-to-b from-[#68544d] via-[#68544d] to-[#55443e]">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#EA8A8A]/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#EBD5D5]/10 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#EA8A8A] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Curaduría Vintage & Circular
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
            Moda con historia, <br/>
            <span className="italic text-[#EBD5D5] font-normal">prendas únicas</span> para tu día.
          </h1>
          <p className="text-base sm:text-lg text-[#EBD5D5]/85 leading-relaxed mb-8 max-w-2xl font-light">
            Selección artesanal de indumentaria urbana e infantil pre-loved. Cada pieza es irrepetible, ha sido verificada en calidad y cuenta con su ficha técnica de <strong>medidas exactas en centímetros</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={onExplore}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-semibold shadow-lg transition-transform active:scale-95 text-sm sm:text-base cursor-pointer"
            >
              Explorar Catálogo Único
              <ArrowDown className="w-4 h-4" />
            </button>
            <button 
              onClick={onOpenGuide}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-[#EBD5D5] font-medium border border-white/15 transition-colors text-sm sm:text-base cursor-pointer"
            >
              <Ruler className="w-4 h-4 text-[#EA8A8A]" />
              ¿Cómo medimos las prendas?
            </button>
          </div>

          {/* Micro Features Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10 text-xs sm:text-sm text-[#EBD5D5]/80">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#EA8A8A] shrink-0" />
              <span>Stock 1/1 por ítem (Sin duplicados)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#EA8A8A] shrink-0" />
              <span>Envíos a todo el país (Correo & OCA)</span>
            </div>
            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <ShieldCheck className="w-4 h-4 text-[#EA8A8A] shrink-0" />
              <span>Mercado Pago & WhatsApp Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
