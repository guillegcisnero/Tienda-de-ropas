import React, { useState } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Product } from '../../types';
import { isSupabaseConfigured } from '../../services/supabase';
import { 
  createProduct, 
  updateProduct, 
  updateProductStatus, 
  deleteProduct 
} from '../../services/catalogService';
import { AdminSection, AdminOrder } from './types';
import { AdminLayout } from './AdminLayout';
import { DashboardOverview } from './views/DashboardOverview';
import { InventoryView } from './views/InventoryView';
import { OrdersView } from './views/OrdersView';
import { SettingsView } from './views/SettingsView';
import { ProductDrawer } from './components/ProductDrawer';
import { MOCK_ADMIN_ORDERS } from './mockAdminData';

interface AdminDashboardProps {
  products: Product[];
  onClose: () => void;
  onProductCreated: (newProduct: Product) => void;
  onRefreshCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onClose,
  onProductCreated,
  onRefreshCatalog
}) => {
  // 1. Autenticación por PIN (sessionStorage + verificación con PIN personalizado o default)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('aura_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 2. Sección activa de navegación
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Estado de pedidos (Híbrido con fallback MOCK)
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);

  // 4. Estados del Drawer de Producto (Crear / Editar)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPin = localStorage.getItem('aura_admin_custom_pin') || 'aura2026';
    if (pinInput === savedPin || pinInput === 'admin' || pinInput === 'aura2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('aura_admin_auth');
    setIsAuthenticated(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshCatalog();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Creación o Edición de producto a través de ProductDrawer
  const handleProductSubmit = async (productData: any) => {
    setIsSubmittingProduct(true);
    try {
      if (productData.id) {
        // Modo Edición
        await updateProduct(productData.id, productData);
        setSuccessNotice(`¡Prenda "${productData.name}" actualizada con éxito!`);
      } else {
        // Modo Creación
        const newProd = await createProduct(productData);
        onProductCreated(newProd);
        setSuccessNotice(`¡Prenda "${productData.name}" publicada con éxito en el catálogo!`);
      }

      await onRefreshCatalog();
      setIsDrawerOpen(false);
      setEditingProduct(null);
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      alert(`Error al guardar la prenda: ${err.message}`);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const handleOpenCreateDrawer = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (product: Product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleToggleSold = async (product: Product) => {
    const nextStatus = product.available ? 'sold' : 'available';
    await updateProductStatus(product.id, nextStatus);
    onRefreshCatalog();
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('¿Seguro que deseás eliminar esta prenda única del catálogo?')) {
      await deleteProduct(productId);
      onRefreshCatalog();
      setSuccessNotice('Prenda eliminada del catálogo.');
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: AdminOrder['fulfillmentStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, fulfillmentStatus: nextStatus } : o));
  };

  const activeProductsCount = products.filter(p => p.available).length;
  const pendingOrdersCount = orders.filter(o => o.fulfillmentStatus === 'pending' || o.fulfillmentStatus === 'processing').length;

  // 1. Pantalla de PIN de Acceso
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#443530]/95 backdrop-blur-md">
        <div className="w-full max-w-sm bg-[#FAF6F0] text-[#2c221e] rounded-3xl p-7 shadow-2xl border border-[#DEC0C0] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EA8A8A]/20 flex items-center justify-center mx-auto mb-4 text-[#EA8A8A]">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-1 text-[#2c221e]">
            Acceso Administrador
          </h3>
          <p className="text-xs text-[#5c4b45] mb-5">
            Ingresá tu PIN para acceder al panel de gestión
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="PIN de acceso (ej: aura2026)"
              className="w-full text-center tracking-widest text-lg font-bold bg-white border border-[#DEC0C0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#EA8A8A] focus:outline-none"
            />
            {pinError && (
              <p className="text-xs text-rose-600 font-semibold">
                PIN incorrecto. Probá con aura2026 o admin
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-bold text-xs shadow-md shadow-[#EA8A8A]/30 transition-all cursor-pointer"
            >
              Ingresar al Panel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#5c4b45] hover:text-[#2c221e] underline block mx-auto pt-1 cursor-pointer"
            >
              Volver a la tienda
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Render Principal del Backoffice con AdminLayout
  return (
    <AdminLayout
      currentSection={currentSection}
      onSelectSection={setCurrentSection}
      onExitAdmin={onClose}
      onLogout={handleLogout}
      searchTerm={globalSearch}
      onSearchChange={setGlobalSearch}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      onOpenNewProductDrawer={() => {
        setCurrentSection('catalog');
        handleOpenCreateDrawer();
      }}
      activeProductsCount={activeProductsCount}
      pendingOrdersCount={pendingOrdersCount}
      isSupabaseLive={isSupabaseConfigured}
    >
      {/* Toast Feedback */}
      {successNotice && (
        <div className="mb-5 bg-emerald-600 text-white rounded-2xl p-4 text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VISTA 1: DASHBOARD OVERVIEW */}
      {currentSection === 'dashboard' && (
        <DashboardOverview
          products={products}
          orders={orders}
          onNavigateToSection={setCurrentSection}
          onOpenNewProductDrawer={() => {
            setCurrentSection('catalog');
            handleOpenCreateDrawer();
          }}
        />
      )}

      {/* VISTA 2: CATÁLOGO & INVENTARIO */}
      {currentSection === 'catalog' && (
        <InventoryView
          products={products}
          onOpenCreateDrawer={handleOpenCreateDrawer}
          onOpenEditDrawer={handleOpenEditDrawer}
          onToggleAvailability={handleToggleSold}
          onDeleteProduct={handleDelete}
          externalSearch={globalSearch}
        />
      )}

      {/* VISTA 3: PEDIDOS OMNICANAL */}
      {currentSection === 'orders' && (
        <OrdersView
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

      {/* VISTA 4: CONFIGURACIÓN */}
      {currentSection === 'settings' && (
        <SettingsView />
      )}

      {/* Product Drawer (Off-Canvas Desktop / Bottom Sheet Mobile) */}
      <ProductDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleProductSubmit}
        initialProduct={editingProduct}
        isSubmitting={isSubmittingProduct}
      />
    </AdminLayout>
  );
};
