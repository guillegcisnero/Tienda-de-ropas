import React, { memo, useState } from 'react';
import { ShoppingBag, Search, X, Heart, User, LogOut, Sun, Moon } from 'lucide-react';
import { EsvenLogo } from './EsvenLogo';
import { UserProfile } from '../hooks/useAuth';

interface NavbarProps {
  storeName: string;
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  user?: UserProfile | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar = memo<NavbarProps>(({
  cartCount,
  onOpenCart,
  favoritesCount = 0,
  onOpenFavorites,
  user,
  onOpenAuth,
  onSignOut,
  searchTerm,
  onSearchChange,
  isDark = false,
  onToggleTheme
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#FBFBF9] dark:bg-[#181816] border-b border-[#E8E6E1] dark:border-[#282826] text-xs py-2 px-4 text-center tracking-wide text-[#1A1A1A]/85 dark:text-[#F5F5F0]/85 flex items-center justify-center gap-2 transition-colors duration-200">
        <span className="inline-block w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
        <span>🌿 <strong>Prendas Únicas 1/1:</strong> Calidez textil y medidas exactas en cm para una compra consciente.</span>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-b border-[#E8E6E1] dark:border-[#282826] shadow-[0_2px_12px_rgba(26,26,26,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.5)] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand Logo Oficial ESVEN */}
          <a 
            href="#" 
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] rounded-lg p-1 transition-transform hover:opacity-95"
            title="ESVEN — Moda Circular"
          >
            <EsvenLogo variant="horizontal" />
          </a>

          {/* Desktop Search */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <div className="relative">
              <input 
                type="search" 
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por prenda, categoría o talle..." 
                className="w-full bg-[#FBFBF9] dark:bg-[#181816] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] placeholder-[#1A1A1A]/40 dark:placeholder-[#F5F5F0]/40 rounded-full pl-10 pr-9 py-2.5 border border-[#E8E6E1] dark:border-[#282826] focus:border-[#C5A880] focus:bg-white dark:focus:bg-[#1C1C1A] focus:outline-none focus:ring-1 focus:ring-[#C5A880] transition-all shadow-inner"
              />
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1A1A1A]/40 dark:text-[#F5F5F0]/40">
                <Search className="w-4 h-4" />
              </div>
              {searchTerm && (
                <button 
                  onClick={() => onSearchChange('')} 
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1A1A1A]/40 dark:text-[#F5F5F0]/40 hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0]"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Dark Mode, Favoritos, Usuario y Carrito */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Botón Minimalista Dark Mode */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                className="relative p-2.5 rounded-full hover:bg-[#FBFBF9] dark:hover:bg-[#1E1E1C] border border-[#E8E6E1] dark:border-[#282826] text-[#1A1A1A] dark:text-[#F5F5F0] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs group"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-[#C5A880] group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-[#1A1A1A] group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>
            )}

            {/* Botón de Favoritos */}
            {onOpenFavorites && (
              <button
                type="button"
                onClick={onOpenFavorites}
                aria-label={`Ver Favoritos (${favoritesCount})`}
                className="relative p-2.5 rounded-full hover:bg-[#FBFBF9] dark:hover:bg-[#1E1E1C] border border-[#E8E6E1] dark:border-[#282826] text-[#1A1A1A] dark:text-[#F5F5F0] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Tus Favoritos"
              >
                <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-[#1A1A1A] dark:text-[#F5F5F0]'}`} />
                {favoritesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {favoritesCount}
                  </span>
                )}
              </button>
            )}

            {/* Usuario / Sesión */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(prev => !prev)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#E8E6E1] dark:border-[#282826] hover:bg-[#FBFBF9] dark:hover:bg-[#1E1E1C] transition-all cursor-pointer text-xs font-semibold text-[#1A1A1A] dark:text-[#F5F5F0]"
                    title={`Conectado como ${user.name || user.email}`}
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-[#1A1A1A] dark:bg-[#C5A880] text-white dark:text-[#121212] flex items-center justify-center text-[10px] uppercase font-bold">
                        {(user.name || user.email || 'U')[0]}
                      </div>
                    )}
                    <span className="hidden sm:inline truncate max-w-[100px]">{user.name || user.email.split('@')[0]}</span>
                  </button>

                  {/* Menú desplegable usuario */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181816] rounded-2xl shadow-xl border border-[#E8E6E1] dark:border-[#282826] p-2 z-50 animate-fadeIn text-xs"
                      onMouseLeave={() => setShowUserMenu(false)}
                    >
                      <div className="px-3 py-2 border-b border-[#E8E6E1] dark:border-[#282826] mb-1">
                        <p className="font-bold text-[#1A1A1A] dark:text-[#F5F5F0] truncate">{user.name || 'Usuario'}</p>
                        <p className="text-[#7A7A7A] dark:text-[#A8A69E] truncate text-[11px]">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          onSignOut?.();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[#E8E6E1] dark:border-[#282826] hover:bg-[#FBFBF9] dark:hover:bg-[#1E1E1C] text-xs font-medium text-[#1A1A1A] dark:text-[#F5F5F0] transition-all cursor-pointer shadow-xs"
                  title="Iniciar Sesión"
                >
                  <User className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>

            {/* Cart Action Button */}
            <button 
              onClick={onOpenCart}
              aria-label="Abrir Carrito de Compras"
              className="relative flex items-center gap-2 bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white active:scale-95 text-white dark:text-[#121212] font-medium px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A880] dark:text-[#8F7049]" />
              <span className="hidden sm:inline text-xs sm:text-sm font-semibold tracking-wide">Mi Carrito</span>
              <span className="w-5 h-5 rounded-full bg-[#C5A880] text-[#1A1A1A] text-[11px] font-bold flex items-center justify-center transition-transform shadow-xs">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-[#E8E6E1]/60 dark:border-[#282826]/60 bg-[#FBFBF9] dark:bg-[#181816]">
          <div className="relative">
            <input 
              type="search" 
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar prendas, talles..." 
              className="w-full bg-white dark:bg-[#121212] text-sm text-[#1A1A1A] dark:text-[#F5F5F0] placeholder-[#1A1A1A]/40 dark:placeholder-[#F5F5F0]/40 rounded-full pl-10 pr-9 py-2 border border-[#E8E6E1] dark:border-[#282826] focus:border-[#C5A880] focus:outline-none"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1A1A1A]/40 dark:text-[#F5F5F0]/40">
              <Search className="w-4 h-4" />
            </div>
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')} 
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#1A1A1A]/40 dark:text-[#F5F5F0]/40 hover:text-[#1A1A1A] dark:hover:text-[#F5F5F0]"
                title="Limpiar búsqueda"
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
