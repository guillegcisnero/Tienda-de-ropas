import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  Store, 
  LogOut, 
  Database,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AdminSection } from './types';

interface AdminSidebarProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  activeProductsCount: number;
  pendingOrdersCount: number;
  isSupabaseLive: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentSection,
  onSelectSection,
  onExitAdmin,
  onLogout,
  activeProductsCount,
  pendingOrdersCount,
  isSupabaseLive
}) => {
  const navItems = [
    {
      id: 'dashboard' as AdminSection,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'catalog' as AdminSection,
      label: 'Catálogo',
      icon: Package,
      badge: activeProductsCount > 0 ? `${activeProductsCount}` : null
    },
    {
      id: 'orders' as AdminSection,
      label: 'Pedidos',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null
    },
    {
      id: 'settings' as AdminSection,
      label: 'Configuración',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 bg-[#443530] text-[#FAF6F0] flex flex-col justify-between shrink-0 border-r border-white/10 shadow-2xl z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA8A8A] to-[#e37575] flex items-center justify-center text-[#2c221e] shadow-md shadow-[#EA8A8A]/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-tight leading-none text-white">
              Aura Retail
            </h1>
            <p className="text-[11px] font-sans text-[#EBD5D5]/70 mt-1 uppercase tracking-wider">
              Admin Backoffice
            </p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-[#EBD5D5]/50 mb-2">
            Navegación Principal
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#EA8A8A] text-[#2c221e] font-bold shadow-lg shadow-[#EA8A8A]/25 scale-[1.02]'
                    : 'text-[#EBD5D5]/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2c221e]' : 'text-[#EBD5D5]'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#2c221e]/20 text-[#2c221e]'
                        : 'bg-white/10 text-[#FAF6F0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System status & Exit */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#382b27]">
        {/* Supabase Status Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[#EBD5D5]/80">
              {isSupabaseLive ? 'Supabase Conectado' : 'Modo Mock Local'}
            </span>
          </div>
          <Database className="w-3.5 h-3.5 text-[#EBD5D5]/50" />
        </div>

        {/* Storefront return button */}
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Store className="w-4 h-4 text-[#EA8A8A]" />
            <span>Volver a la Tienda</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#EBD5D5]/60" />
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[11px] text-[#EBD5D5]/60 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión de Admin</span>
        </button>
      </div>
    </aside>
  );
};
