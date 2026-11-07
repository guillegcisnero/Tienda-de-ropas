import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Product } from '../../types';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { 
  createProduct, 
  updateProduct, 
  updateProductStatus, 
  deleteProduct 
} from '../../services/catalogService';
import { fetchAdminOrders } from '../../services/orderService';
import { AdminSection, AdminOrder } from './types';
import { AdminLayout } from './AdminLayout';
import { DashboardOverview } from './views/DashboardOverview';
import { InventoryView } from './views/InventoryView';
import { OrdersView } from './views/OrdersView';
import { SettingsView } from './views/SettingsView';
import { ProductDrawer } from './components/ProductDrawer';
import { MOCK_ADMIN_ORDERS } from './mockAdminData';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'guillegcisnero@gmail.com';

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
  // 1. Estado de autenticación estricta (exclusivamente vía sesión de Supabase Auth)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUserEmail, setAdminUserEmail] = useState<string | null>(null);

  // Formulario de autenticación estricta (sin datos precargados)
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 2. Sección activa de navegación
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3. Estado de pedidos (Supabase en vivo con fallback)
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ADMIN_ORDERS);

  // 4. Estados del Drawer de Producto (Crear / Editar)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Escuchar sesión activa de Supabase
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAuthenticated(true);
          setAdminUserEmail(session.user.email || null);
        } else {
          setIsAuthenticated(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAuthenticated(true);
          setAdminUserEmail(session?.user?.email || null);
        } else {
          setIsAuthenticated(false);
          setAdminUserEmail(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Cargar órdenes reales de Supabase al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminOrders().then(realOrders => {
        if (realOrders && realOrders.length > 0) {
          setOrders(realOrders);
        }
      });
    }
  }, [isAuthenticated]);

  // Handler de login seguro con Email + Clave Secreta (Anti-Enumeration & Anti-Timing Attack)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanPassword) {
      setAuthError('Por favor completá todos los campos requeridos.');
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError(null);

    const startTime = Date.now();
    const MIN_AUTH_DELAY_MS = 600; // Normalización de tiempo de respuesta contra Timing Attacks

    try {
      // Verificación estricta de identidad administrativa
      if (cleanEmail.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        throw new Error('UNAUTHORIZED');
      }

      if (isSupabaseConfigured && supabase) {
        // Intentar iniciar sesión única y exclusivamente vía credenciales existentes
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword
        });

        if (signInError || !signInData.session) {
          throw new Error('INVALID_CREDENTIALS');
        }

        setIsAuthenticated(true);
        setAdminUserEmail(signInData.session.user.email || ADMIN_EMAIL);
      } else {
        // Modo demo local / sin backend
        setIsAuthenticated(true);
      }
    } catch {
      // Respuesta 100% uniforme contra Enumeración de Usuarios (OWASP ASVS)
      setAuthError('Credenciales incorrectas o acceso no autorizado.');
    } finally {
      // Asegurar retardo uniforme independientemente de si el usuario existía o no
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_AUTH_DELAY_MS) {
        await new Promise(resolve => setTimeout(resolve, MIN_AUTH_DELAY_MS - elapsed));
      }
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setAdminUserEmail(null);
    setEmailInput('');
    setPasswordInput('');
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshCatalog();
    const realOrders = await fetchAdminOrders();
    if (realOrders && realOrders.length > 0) {
      setOrders(realOrders);
    }
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

  // 1. Pantalla de Autenticación de Acceso Estricta (Solo Auth)
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#443530]/95 backdrop-blur-md">
        <div className="w-full max-w-sm bg-[#FAF6F0] text-[#2c221e] rounded-3xl p-7 shadow-2xl border border-[#DEC0C0] text-center animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-[#EA8A8A]/20 flex items-center justify-center mx-auto mb-4 text-[#EA8A8A]">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h3 className="font-serif text-xl font-bold mb-1 text-[#2c221e]">
            Acceso Backoffice ESVEN
          </h3>
          <p className="text-xs text-[#5c4b45] mb-5">
            Ingresá tus credenciales de administrador
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            {/* Campo 1: Email personal (en blanco) */}
            <div>
              <label className="block text-[11px] text-[#5c4b45] font-semibold mb-1">
                Email personal
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C7A74] absolute left-3 top-3 pointer-events-none" />
                <input 
                  type="email"
                  autoFocus
                  required
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="tu-email@dominio.com"
                  className="w-full text-xs font-medium bg-white border border-[#DEC0C0] rounded-xl pl-9 pr-3 py-2.5 text-[#2c221e] focus:ring-2 focus:ring-[#EA8A8A] focus:outline-none placeholder:text-[#5c4b45]/40"
                />
              </div>
            </div>

            {/* Campo 2: Clave secreta (en blanco) */}
            <div>
              <label className="block text-[11px] text-[#5c4b45] font-semibold mb-1">
                Clave secreta
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8C7A74] absolute left-3 top-3 pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
                  placeholder="••••••••"
                  className="w-full text-xs font-medium bg-white border border-[#DEC0C0] rounded-xl pl-9 pr-10 py-2.5 text-[#2c221e] focus:ring-2 focus:ring-[#EA8A8A] focus:outline-none placeholder:text-[#5c4b45]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-2.5 text-[#8C7A74] hover:text-[#2c221e] transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {authError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-center gap-1.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Botón de Entrada */}
            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-bold text-xs shadow-md shadow-[#EA8A8A]/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSubmittingAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#2c221e]" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span>Ingresar al Backoffice</span>
              )}
            </button>
          </form>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#5c4b45] hover:text-[#2c221e] underline block mx-auto pt-4 cursor-pointer"
          >
            Volver a la tienda
          </button>
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
    >
      {/* Toast Notice de éxito */}
      {successNotice && (
        <div className="fixed top-6 right-6 z-50 bg-[#2c221e] text-[#FAF6F0] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#EA8A8A]/40 animate-slideDown text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#EA8A8A]" />
          <span>{successNotice}</span>
          <button 
            onClick={() => setSuccessNotice(null)}
            className="ml-2 text-[#FAF6F0]/60 hover:text-[#FAF6F0]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Vistas según navegación */}
      {currentSection === 'dashboard' && (
        <DashboardOverview 
          products={products}
          orders={orders}
          onOpenNewProduct={handleOpenCreateDrawer}
          onSelectOrder={(order) => {
            setCurrentSection('orders');
          }}
        />
      )}

      {currentSection === 'catalog' && (
        <InventoryView
          products={products}
          onOpenCreateDrawer={handleOpenCreateDrawer}
          onEditProduct={handleOpenEditDrawer}
          onToggleSold={handleToggleSold}
          onDeleteProduct={handleDelete}
        />
      )}

      {currentSection === 'orders' && (
        <OrdersView
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}

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
