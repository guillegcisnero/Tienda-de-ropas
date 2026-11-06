import React, { memo } from 'react';
import { ShoppingBag, Search, X } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';

interface NavbarProps {
  storeName: string;
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Navbar = memo<NavbarProps>(({
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange
}) => {
  return (
    <>
      {/* Top Announcement Bar — Marfil Seda & Destello Oro Champaña */}
      <div className="bg-[#FBFBF9] border-b border-[#E8E6E1] text-xs py-2 px-4 text-center tracking-wide text-[#1A1A1A]/85 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
        <span>🌿 <strong>Prendas Únicas 1/1 & Lujo Silencioso:</strong> Calidez textil y medidas exactas en cm para una compra consciente.</span>
      </div>

      {/* Main Sticky Navbar — 80% Blanco Puro, 15% Tipografía Negro Suave, 5% Acento Oro */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8E6E1] shadow-[0_2px_12px_rgba(26,26,26,0.03)] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo Oficial ESVEN exportado de Figma */}
          <a 
            href="#" 
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] rounded-lg p-1 transition-transform hover:opacity-95"
            title="ESVEN — Lujo Silencioso · Calidez Textil"
          >
            <EsvenLogo variant="horizontal" />
          </a>

          {/* Desktop Search — Marfil Seda con foco Oro Champaña */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <input 
                type="search" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por prenda, categoría o talle..." 
                className="w-full bg-[#FBFBF9] text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 rounded-full pl-10 pr-9 py-2.5 border border-[#E8E6E1] focus:border-[#C5A880] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1A1A1A]/40">
                <Search className="w-4 h-4" />
              </div>
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')} 
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Action Button — Negro Suave con destello de Oro Champaña */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={onOpenCart}
              aria-label="Abrir Carrito de Compras"
              className="relative flex items-center gap-2 bg-[#1A1A1A] hover:bg-black active:scale-95 text-white font-medium px-4 py-2.5 rounded-full shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold tracking-wide">Mi Carrito</span>
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-[#1A1A1A] text-[11px] font-bold flex items-center justify-center transition-transform shadow-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E8E6E1]/60 bg-[#FBFBF9]">
          <div className="relative">
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar prendas, talles..." 
              className="w-full bg-white text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 rounded-full pl-10 pr-9 py-2 border border-[#E8E6E1] focus:border-[#C5A880] focus:outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1A1A1A]/40">
              <Search className="w-4 h-4" />
            </div>
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')} 
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
});

Navbar.displayName = 'Navbar';
