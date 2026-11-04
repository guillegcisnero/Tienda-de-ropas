import React, { memo } from 'react';
import { Heart, ShieldCheck, RefreshCw, Truck } from 'lucide-react';

interface FooterProps {
  storeName: string;
  tagline: string;
  onOpenAdmin?: () => void;
}

export const Footer = memo<FooterProps>(({ storeName, tagline, onOpenAdmin }) => {
  return (
    <footer className="bg-[#55443e] border-t border-white/10 text-[#FAF6F0] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-white/10 text-xs text-[#EBD5D5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#EA8A8A]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block">Moda Circular 100%</strong>
              <span>Extendiendo el ciclo de vida de prendas seleccionadas.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#EA8A8A]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block">Calidad Verificada</strong>
              <span>Costuras, cierres y medidas auditadas artesanalmente.</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#EA8A8A]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block">Envíos a Toda Argentina</strong>
              <span>Despachos seguros con número de seguimiento online.</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EBD5D5]/60">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white text-base">{storeName}</span>
            <span>·</span>
            <span>{tagline}</span>
            <span>·</span>
            <button
              onClick={onOpenAdmin}
              className="text-[#EBD5D5]/50 hover:text-[#EA8A8A] transition-colors cursor-pointer underline text-[11px]"
            >
              Acceso Admin
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span>Diseñado con pasión por la moda circular</span>
            <Heart className="w-3.5 h-3.5 text-[#EA8A8A] fill-[#EA8A8A]" />
          </div>
        </div>

      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';
