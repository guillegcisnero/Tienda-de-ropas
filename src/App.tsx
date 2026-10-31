import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FiltersBar } from './components/FiltersBar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MeasurementsGuideModal } from './components/MeasurementsGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { MOCK_CATALOG, STORE_CONFIG, SHIPPING_RATES } from './data/mockCatalog';
import { Product, FilterState, ShippingConfig } from './types';
import { Check, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'aura_preloved_cart_v1';

export default function App() {
  const [products] = useState<Product[]>(MOCK_CATALOG);
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [shipping, setShipping] = useState<ShippingConfig>({
    province: 'CABA',
    postalCode: '1425',
    type: 'shipping',
    cost: SHIPPING_RATES.cabaGba.price,
    service: SHIPPING_RATES.cabaGba.name
  });

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    size: 'all',
    condition: 'all',
    search: '',
    sort: 'featured'
  });

  // Modal States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist cart
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Error guardando carrito en localStorage:', e);
    }
  }, [cart]);

  // Handle Cart Operations
  const handleAddToCart = (product: Product) => {
    if (cart.some(item => item.id === product.id)) {
      showToast('Esta prenda única ya está en tu carrito');
      return;
    }
    setCart(prev => [...prev, product]);
    showToast(`¡${product.name} agregada al carrito!`);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Prenda quitada del carrito');
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('Carrito vaciado');
  };

  const handleShippingChange = (regionKey: string) => {
    const rate = SHIPPING_RATES[regionKey] || SHIPPING_RATES.cabaGba;
    setShipping(prev => ({
      ...prev,
      cost: rate.price,
      service: rate.name
    }));
  };

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (filters.category !== 'all' && p.category !== filters.category) {
        return false;
      }
      // Size filter
      if (filters.size !== 'all' && p.size !== filters.size) {
        return false;
      }
      // Condition filter
      if (filters.condition !== 'all' && !p.condition.includes(filters.condition)) {
        return false;
      }
      // Search term
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchSize = p.size.toLowerCase().includes(query);
        const matchCategory = p.category.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchSize && !matchCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sort === 'price-asc') return a.price - b.price;
      if (filters.sort === 'price-desc') return b.price - a.price;
      if (filters.sort === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return 0; // featured default
    });
  }, [products, filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      size: 'all',
      condition: 'all',
      search: '',
      sort: 'featured'
    });
  };

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#68544d] text-[#FAF6F0] selection:bg-[#EA8A8A] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2c221e] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce">
          <Check className="w-4 h-4 text-[#EA8A8A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar 
        storeName={STORE_CONFIG.storeName}
        cartCount={cart.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchTerm={filters.search}
        onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
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
            onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
            onResetFilters={handleResetFilters}
            totalProductsCount={filteredProducts.length}
          />
        </div>

        {/* Product Grid Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 max-w-lg mx-auto p-6">
              <Sparkles className="w-10 h-10 text-[#EA8A8A] mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-white mb-2">
                No encontramos prendas con esos filtros
              </h3>
              <p className="text-xs text-[#EBD5D5]/80 mb-6 font-light">
                Probá cambiando el talle o limpiá la búsqueda para ver todas las piezas disponibles.
              </p>
              <button
                onClick={handleResetFilters}
                className="py-2.5 px-6 rounded-full bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-semibold text-xs shadow-md transition-all cursor-pointer"
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
                  isInCart={cart.some(item => item.id === product.id)}
                  onOpenDetail={handleOpenDetail}
                  onAddToCart={handleAddToCart}
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
      />

      {/* Modals & Drawers */}
      <ProductDetailModal 
        product={selectedProduct}
        isOpen={isDetailOpen}
        isInCart={selectedProduct ? cart.some(item => item.id === selectedProduct.id) : false}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
        onOpenGuide={() => {
          setIsDetailOpen(false);
          setIsGuideOpen(true);
        }}
      />

      <MeasurementsGuideModal 
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        cart={cart}
        shipping={shipping}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveFromCart}
        onShippingChange={handleShippingChange}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExplore={handleScrollToCatalog}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        cart={cart}
        shipping={shipping}
        whatsappNumber={STORE_CONFIG.whatsappNumber}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccessOrder={() => {
          handleClearCart();
          showToast('¡Muchas gracias por tu compra en Aura Pre-Loved!');
        }}
      />

    </div>
  );
}
