import React from 'react';
import { ShoppingBag, Search, X } from 'lucide-react';

interface NavbarProps {
  storeName: string;
  cartCount: number;
  onOpenCart: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  storeName,
  cartCount,
  onOpenCart,
  searchTerm,
  onSearchChange
}) => {
  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#55443e] border-b border-white/10 text-xs py-2 px-4 text-center tracking-wide text-[#EBD5D5]/90 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#EA8A8A] animate-pulse"></span>
        <span>🌿 <strong>Prendas Únicas & Sustentables:</strong> Solo 1 unidad por modelo · Medidas reales en cm para evitar cambios.</span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#68544d]/95 backdrop-blur-md border-b border-white/10 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EA8A8A] rounded-lg p-1">
            <div className="w-10 h-10 rounded-full bg-[#EA8A8A] flex items-center justify-center text-[#2c221e] font-serif font-bold text-xl shadow-md transition-transform group-hover:scale-105">
              {storeName.charAt(0)}
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">{storeName}</span>
              <span className="text-[11px] uppercase tracking-widest text-[#EBD5D5]/70 font-medium">Moda Circular & Urbana</span>
            </div>
          </a>

          {/* Desktop Search */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <input 
                type="search" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por prenda, categoría o talle..." 
                className="w-full bg-[#55443e]/80 text-sm text-[#EBD5D5] placeholder-[#EBD5D5]/50 rounded-full pl-10 pr-9 py-2.5 border border-white/15 focus:border-[#EA8A8A] focus:bg-[#55443e] focus:outline-none focus:ring-1 focus:ring-[#EA8A8A] transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EBD5D5]/60">
                <Search className="w-4 h-4" />
              </div>
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')} 
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#EBD5D5]/60 hover:text-white"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Action Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={onOpenCart}
              aria-label="Abrir Carrito de Compras"
              className="relative flex items-center gap-2 bg-[#EA8A8A] hover:bg-[#e37575] active:scale-95 text-[#2c221e] font-semibold px-4 py-2.5 rounded-full shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Mi Carrito</span>
              <span className="w-5 h-5 rounded-full bg-[#2c221e] text-[#EA8A8A] text-xs font-bold flex items-center justify-center transition-transform">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-white/5">
          <div className="relative">
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar prendas, talles..." 
              className="w-full bg-[#55443e] text-sm text-[#EBD5D5] placeholder-[#EBD5D5]/50 rounded-full pl-10 pr-9 py-2 border border-white/15 focus:border-[#EA8A8A] focus:outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EBD5D5]/60">
              <Search className="w-4 h-4" />
            </div>
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')} 
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#EBD5D5]/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
