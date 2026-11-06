import React, { useState, lazy, Suspense, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FiltersBar } from './components/FiltersBar';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { STORE_CONFIG, SHIPPING_RATES } from './data/mockCatalog';
import { Product, ShippingConfig } from './types';
import { useCart } from './hooks/useCart';
import { useCatalog } from './hooks/useCatalog';
import { useCatalogFilters } from './hooks/useCatalogFilters';
import { useFavorites } from './hooks/useFavorites';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Check, Sparkles } from 'lucide-react';

// Lazy loading de modales y drawers: se descargan bajo demanda sin penalizar la carga inicial (<0.8s FCP)
const ProductDetailModal = lazy(() =>
  import('./components/ProductDetailModal').then(m => ({ default: m.ProductDetailModal }))
);
const MeasurementsGuideModal = lazy(() =>
  import('./components/MeasurementsGuideModal').then(m => ({ default: m.MeasurementsGuideModal }))
);
const CartDrawer = lazy(() =>
  import('./components/CartDrawer').then(m => ({ default: m.CartDrawer }))
);
const FavoritesDrawer = lazy(() =>
  import('./components/FavoritesDrawer').then(m => ({ default: m.FavoritesDrawer }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then(m => ({ default: m.AuthModal }))
);
const CheckoutModal = lazy(() =>
  import('./components/CheckoutModal').then(m => ({ default: m.CheckoutModal }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
const RevocationModal = lazy(() =>
  import('./components/RevocationModal').then(m => ({ default: m.RevocationModal }))
);
const LegalViews = lazy(() =>
  import('./components/LegalViews').then(m => ({ default: m.LegalViews }))
);
import type { LegalDocType } from './components/LegalViews';

export default function App() {
  const { products, isLoading, isLive, refreshCatalog } = useCatalog();
  const { isDark, toggleTheme } = useTheme();
  
  // Autenticación de Usuario (Supabase Auth / Local demo)
  const { user, isAuthenticated, signInWithEmail, signInWithGoogle, signOut } = useAuth();

  // Carrito con Reconciliación de Stock en Tiempo Real frente al Catálogo
  const { 
    cart, 
    availableItems, 
    unavailableItems, 
    itemCount, 
    isInCart, 
    addToCart, 
    removeFromCart, 
    clearCart,
    moveUnavailableToFavorites 
  } = useCart(products);

  // Favoritos persistentes con sincronización en la nube opcional
  const {
    favoriteProducts,
    favoritesCount,
    isFavorite,
    toggleFavorite,
    removeFavorite
  } = useFavorites(products, user?.id);

  const {
    filters,
    filteredProducts,
    availableSizes,
    updateFilters,
    resetFilters
  } = useCatalogFilters(products);

  // Estado de Envío
  const [shipping, setShipping] = useState<ShippingConfig>({
    province: 'CABA',
    postalCode: '1425',
    type: 'shipping',
    cost: SHIPPING_RATES.cabaGba.price,
    service: SHIPPING_RATES.cabaGba.name
  });

  // Modales y Drawers
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [legalView, setLegalView] = useState<LegalDocType | null>(null);
  const [isRevocationOpen, setIsRevocationOpen] = useState(false);

  React.useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setIsAdminOpen(true);
      } else if (hash === '#terminos') {
        setLegalView('terms');
      } else if (hash === '#privacidad') {
        setLegalView('privacy');
      } else if (hash === '#devoluciones') {
        setLegalView('returns');
      } else if (hash === '#arrepentimiento') {
        setIsRevocationOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleAddToCart = useCallback((product: Product) => {
    const result = addToCart(product);
    showToast(result.message);
    if (result.success) {
      setIsCartOpen(true);
    }
  }, [addToCart, showToast]);

  const handleBuyNow = useCallback((product: Product) => {
    if (!isInCart(product.id)) {
      addToCart(product);
    }
    setIsCartOpen(false);
    setIsDetailOpen(false);
    setIsCheckoutOpen(true);
  }, [isInCart, addToCart]);

  const handleRemoveFromCart = useCallback((productId: string) => {
    removeFromCart(productId);
    showToast('Prenda quitada del carrito');
  }, [removeFromCart, showToast]);

  const handleToggleFavorite = useCallback((product: Product) => {
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product);
    showToast(wasFavorite ? 'Prenda quitada de favoritos' : '¡Prenda guardada en favoritos!');
  }, [isFavorite, toggleFavorite, showToast]);

  const handleShippingChange = useCallback((regionKey: string) => {
    const rate = SHIPPING_RATES[regionKey] || SHIPPING_RATES.cabaGba;
    setShipping(prev => ({
      ...prev,
      cost: rate.price,
      service: rate.name
    }));
  }, []);

  const handleOpenDetail = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  }, []);

  const handleScrollToCatalog = useCallback(() => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Vista de Documentos Legales
  if (legalView) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center text-xs text-[#8F7049]">Cargando documento...</div>}>
        <LegalViews 
          initialDoc={legalView} 
          onBackToStore={() => {
            setLegalView(null);
            if (window.location.hash.startsWith('#')) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          onOpenRevocationModal={() => setIsRevocationOpen(true)}
        />
        {isRevocationOpen && (
          <RevocationModal 
            isOpen={isRevocationOpen}
            onClose={() => setIsRevocationOpen(false)}
          />
        )}
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#121212] text-[#1A1A1A] dark:text-[#F5F5F0] selection:bg-[#C5A880] selection:text-white transition-colors duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] px-5 py-3 rounded-2xl shadow-2xl border border-white/20 dark:border-black/20 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce">
          <Check className="w-4 h-4 text-[#C5A880] dark:text-[#8F7049]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        storeName={STORE_CONFIG.storeName}
        cartCount={itemCount}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favoritesCount}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => {
          signOut();
          showToast('Sesión cerrada');
        }}
        searchTerm={filters.search}
        onSearchChange={(val) => updateFilters({ search: val })}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero 
          onOpenGuide={() => setIsGuideOpen(true)}
          onExplore={handleScrollToCatalog}
        />

        {/* Filters Sticky Bar */}
        <div id="catalogo">
          <FiltersBar 
            filters={filters}
            onFilterChange={updateFilters}
            onResetFilters={resetFilters}
            totalProductsCount={filteredProducts.length}
            availableSizes={availableSizes}
          />
        </div>

        {/* Product Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-[#FBFBF9] dark:bg-[#181816] rounded-2xl h-96 border border-[#E8E6E1] dark:border-[#282826]" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-[#FBFBF9] dark:bg-[#181816] rounded-3xl border border-[#E8E6E1] dark:border-[#282826] max-w-lg mx-auto p-6 shadow-xs">
              <Sparkles className="w-10 h-10 text-[#C5A880] mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0] mb-2">
                No encontramos prendas con esos filtros
              </h3>
              <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E] mb-6 font-light">
                Probá cambiando el talle o limpiá la búsqueda para ver todas las piezas disponibles en ESVEN.
              </p>
              <button
                onClick={resetFilters}
                className="py-2.5 px-6 rounded-full bg-[#1A1A1A] dark:bg-[#F5F5F0] hover:bg-black dark:hover:bg-white text-white dark:text-[#121212] font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                Ver Todo el Catálogo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  isInCart={isInCart(product.id)}
                  isFavorite={isFavorite(product.id)}
                  onOpenDetail={handleOpenDetail}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer 
        storeName={STORE_CONFIG.storeName}
        tagline={STORE_CONFIG.tagline}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenTerms={() => setLegalView('terms')}
        onOpenPrivacy={() => setLegalView('privacy')}
        onOpenReturns={() => setLegalView('returns')}
        onOpenRevocationModal={() => setIsRevocationOpen(true)}
      />

      {/* Modales y Drawers bajo demanda (Code Splitting con React.lazy) */}
      <Suspense fallback={null}>
        {isDetailOpen && selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            isOpen={isDetailOpen}
            isInCart={isInCart(selectedProduct.id)}
            isFavorite={isFavorite(selectedProduct.id)}
            onClose={() => setIsDetailOpen(false)}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onBuyNow={handleBuyNow}
            onOpenGuide={() => {
              setIsDetailOpen(false);
              setIsGuideOpen(true);
            }}
          />
        )}

        {isGuideOpen && (
          <MeasurementsGuideModal 
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        )}

        {isFavoritesOpen && (
          <FavoritesDrawer
            isOpen={isFavoritesOpen}
            onClose={() => setIsFavoritesOpen(false)}
            favorites={favoriteProducts}
            onRemoveFavorite={removeFavorite}
            onAddToCart={handleAddToCart}
            isInCart={isInCart}
            onOpenProductDetail={handleOpenDetail}
            onOpenAuth={() => setIsAuthOpen(true)}
            isAuthenticated={isAuthenticated}
            userEmail={user?.email}
          />
        )}

        {isAuthOpen && (
          <AuthModal
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            onSignInWithEmail={signInWithEmail}
            onSignInWithGoogle={signInWithGoogle}
          />
        )}

        {isCartOpen && (
          <CartDrawer 
            isOpen={isCartOpen}
            cart={cart}
            availableItems={availableItems}
            unavailableItems={unavailableItems}
            shipping={shipping}
            onClose={() => setIsCartOpen(false)}
            onRemoveItem={handleRemoveFromCart}
            onMoveToFavorites={(item) => {
              moveUnavailableToFavorites(item.id, toggleFavorite);
              showToast('Prenda pasada a tus favoritos');
            }}
            onShippingChange={handleShippingChange}
            onProceedToCheckout={() => setIsCheckoutOpen(true)}
            onExplore={handleScrollToCatalog}
          />
        )}

        {isCheckoutOpen && (
          <CheckoutModal 
            isOpen={isCheckoutOpen}
            cart={availableItems}
            shipping={shipping}
            whatsappNumber={STORE_CONFIG.whatsappNumber}
            onClose={() => setIsCheckoutOpen(false)}
            onOpenTerms={() => {
              setIsCheckoutOpen(false);
              setLegalView('terms');
            }}
            onOpenReturns={() => {
              setIsCheckoutOpen(false);
              setLegalView('returns');
            }}
            onSuccessOrder={() => {
              clearCart();
              showToast('¡Muchas gracias por tu compra en ESVEN!');
            }}
          />
        )}

        {isRevocationOpen && (
          <RevocationModal 
            isOpen={isRevocationOpen}
            onClose={() => setIsRevocationOpen(false)}
          />
        )}

        {isAdminOpen && (
          <AdminDashboard 
            products={products}
            onClose={() => {
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') {
                window.history.pushState(null, '', window.location.pathname);
              }
            }}
            onProductCreated={() => {
              refreshCatalog();
              showToast('¡Nueva prenda publicada con éxito!');
            }}
            onRefreshCatalog={refreshCatalog}
          />
        )}
      </Suspense>

    </div>
  );
}
