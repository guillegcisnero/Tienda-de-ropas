import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  X
} from 'lucide-react';
import { AdminSection } from './types';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  currentSection: AdminSection;
  onSelectSection: (section: AdminSection) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenNewProductDrawer: () => void;
  activeProductsCount: number;
  pendingOrdersCount: number;
  isSupabaseLive: boolean;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onSelectSection,
  onExitAdmin,
  onLogout,
  searchTerm,
  onSearchChange,
  onRefresh,
  isRefreshing,
  onOpenNewProductDrawer,
  activeProductsCount,
  pendingOrdersCount,
  isSupabaseLive,
  children
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSelectSectionMobile = (sec: AdminSection) => {
    onSelectSection(sec);
    setIsMobileMenuOpen(false);
  };

  const mobileNavItems = [
    { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalog' as AdminSection, label: 'Catálogo', icon: Package, badge: activeProductsCount },
    { id: 'orders' as AdminSection, label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'settings' as AdminSection, label: 'Ajustes', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-[#FAF6F0] text-[#2c221e] overflow-hidden font-sans">
      {/* 1. Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar
          currentSection={currentSection}
          onSelectSection={onSelectSection}
          onExitAdmin={onExitAdmin}
          onLogout={onLogout}
          activeProductsCount={activeProductsCount}
          pendingOrdersCount={pendingOrdersCount}
          isSupabaseLive={isSupabaseLive}
        />
      </div>

      {/* 2. Mobile Drawer Sidebar (Slide-over with Backdrop) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 flex flex-col">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <AdminSidebar
              currentSection={currentSection}
              onSelectSection={handleSelectSectionMobile}
              onExitAdmin={onExitAdmin}
              onLogout={onLogout}
              activeProductsCount={activeProductsCount}
              pendingOrdersCount={pendingOrdersCount}
              isSupabaseLive={isSupabaseLive}
            />
          </div>
        </div>
      )}

      {/* 3. Main Stage Container (Header + Content + Mobile Bottom Nav) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FAF6F0]">
        <AdminHeader
          currentSection={currentSection}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onOpenNewProductDrawer={onOpenNewProductDrawer}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* 4. Mobile Bottom Navigation Bar (Thumb Friendly >= 44px touch target) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#443530] text-[#FAF6F0] border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] py-1 px-3 rounded-xl text-[10px] font-bold relative transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#2c221e] bg-[#EA8A8A]'
                    : 'text-[#EBD5D5]/80 hover:text-white'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute 0.5 right-1.5 bg-white text-[#2c221e] text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
