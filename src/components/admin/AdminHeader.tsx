import React, { useMemo } from 'react';
import { 
  Search, 
  RotateCw, 
  Plus, 
  Menu, 
  X,
  Bell,
  Sparkles
} from 'lucide-react';
import { AdminSection } from './types';

interface AdminHeaderProps {
  currentSection: AdminSection;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNewProductDrawer: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  notificationCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentSection,
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenNewProductDrawer,
  onToggleMobileMenu,
  isMobileMenuOpen,
  notificationCount = 2
}) => {
  // Saludo dinámico según horario
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 13) return 'Buenos días';
    if (hour >= 13 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const sectionTitles: Record<AdminSection, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Métricas & Rendimiento',
      subtitle: 'Visión general de ventas, catálogo y órdenes en curso'
    },
    catalog: {
      title: 'Catálogo de Prendas',
      subtitle: 'Gestión de inventario de piezas únicas y talles'
    },
    orders: {
      title: 'Gestión de Pedidos',
      subtitle: 'Seguimiento de pedidos por WhatsApp y Mercado Pago'
    },
    settings: {
      title: 'Configuración de la Tienda',
      subtitle: 'Datos de contacto, tarifas de envío y credenciales'
    }
  };

  const { title, subtitle } = sectionTitles[currentSection];

  return (
    <header className="sticky top-0 z-20 bg-[#FAF6F0] border-b border-[#DEC0C0]/70 px-4 sm:px-8 py-3.5 shadow-xs flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Greetings */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-[#F4E8E8] text-[#55443e] hover:bg-[#DEC0C0] transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#5c4b45]">
              {greeting}, <strong className="text-[#2c221e]">Administrador</strong>
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[#DEC0C0]" />
            <h2 className="hidden sm:inline-block font-serif text-sm font-bold text-[#2c221e]">
              {title}
            </h2>
          </div>
          <p className="text-[11px] text-[#5c4b45] hidden md:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Center: Search pill bar (estilo Dribbble) */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5c4b45] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por prenda, talle o cliente..."
            className="w-full pl-9 pr-4 py-2 bg-white/90 border border-[#DEC0C0] rounded-full text-xs text-[#2c221e] placeholder:text-[#5c4b45]/60 focus:outline-none focus:ring-2 focus:ring-[#EA8A8A] focus:border-transparent transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right: Actions, Refresh, New Product button & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Sincronizar datos"
          className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-full bg-white hover:bg-[#F4E8E8] border border-[#DEC0C0] text-[#55443e] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          aria-label="Sincronizar datos"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#EA8A8A]' : ''}`} />
        </button>

        {/* Action Button: Nueva Prenda */}
        <button
          onClick={onOpenNewProductDrawer}
          className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] rounded-full text-xs font-bold transition-all shadow-sm shadow-[#EA8A8A]/30 cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Nueva Prenda</span>
        </button>

        {/* Notifications */}
        <div className="relative hidden sm:block">
          <div className="p-2 rounded-full bg-white border border-[#DEC0C0] text-[#55443e] cursor-pointer hover:bg-[#F4E8E8] transition-colors shadow-xs">
            <Bell className="w-4 h-4" />
          </div>
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#EA8A8A] text-[#2c221e] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {notificationCount}
            </span>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#E8E6E1]">
          <div className="w-8 h-8 rounded-full bg-white text-[#1A1A1A] border border-[#C5A880] flex items-center justify-center p-1 shadow-xs">
            <img src="/esven-isotipo.svg" alt="ESVEN" className="w-5 h-5" />
          </div>
          <div className="hidden xl:block text-left leading-none">
            <span className="block text-xs font-bold text-[#1A1A1A]">ESVEN Store</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
