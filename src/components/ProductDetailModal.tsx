import React, { useState, useEffect, useRef } from 'react';
import { X, Ruler, ShoppingBag, Check, ShieldCheck, ArrowRight, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  isInCart: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onOpenGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  isInCart,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenGuide
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsZoomed(false);
    setZoomPos({ x: 50, y: 50 });
  }, [product?.id, isOpen]);

  const updateCoordinates = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (!isZoomed) {
      updateCoordinates(e.clientX, e.clientY);
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-3xl bg-[#F4E8E8] text-[#2c221e] rounded-3xl shadow-2xl border border-[#DEC0C0] overflow-hidden max-h-[92vh] flex flex-col md:flex-row transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Cerrar ficha"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section with Interactive Dynamic Zoom */}
        <div 
          ref={containerRef}
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className={`md:w-1/2 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden transition-colors duration-300 select-none bg-[#3b2f2b]/10 ${
            isZoomed ? 'cursor-crosshair' : 'cursor-zoom-in'
          }`}
          title={isZoomed ? 'Hacé clic para ver la prenda completa' : 'Hacé clic para hacer zoom y recorrer la prenda'}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            draggable={false}
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
            }}
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[75vh] p-2 transition-transform duration-300 ease-out select-none pointer-events-none"
          />

          {/* Pill when zoomed indicating you can move around */}
          {isZoomed && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fadeIn">
              <span className="bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20 whitespace-nowrap">
                <Move className="w-3.5 h-3.5 text-[#EA8A8A]" />
                <span>Mové el cursor para explorar</span>
              </span>
            </div>
          )}

          {/* Zoom Toggle Floating Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(prev => !prev);
            }}
            className="absolute bottom-4 right-4 z-10 py-1.5 px-3 rounded-full bg-black/70 hover:bg-black/85 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg cursor-pointer border border-white/20 active:scale-95"
            title={isZoomed ? 'Ver prenda completa' : 'Activar zoom dinámico'}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5 text-[#EA8A8A]" />
                <span>Prenda Completa</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5 text-[#EA8A8A]" />
                <span>Zoom Dinámico</span>
              </>
            )}
          </button>

          {/* Badges */}
          <div className={`absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none transition-opacity duration-200 ${isZoomed ? 'opacity-30' : 'opacity-100'}`}>
            <span className="bg-[#55443e]/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Prenda Única 1/1
            </span>
            <span className="bg-[#EA8A8A] text-[#2c221e] font-bold text-xs px-3 py-0.5 rounded-full shadow-md">
              {product.size}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#5c4b45] font-semibold mb-1">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.subCategory}</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#2c221e] leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-3 my-3">
              <span className="font-serif text-2xl font-bold text-[#68544d]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                Estado: {product.condition}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#5c4b45] leading-relaxed font-light mb-5">
              {product.description}
            </p>

            {/* Measurements Table (The Core Feature of Pre-Loved) */}
            <div className="bg-[#EBD5D5]/60 rounded-2xl p-4 border border-[#DEC0C0]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2c221e] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#EA8A8A]" /> Medidas Reales en cm
                </span>
                <button
                  onClick={onOpenGuide}
                  className="text-[11px] text-[#68544d] hover:text-[#EA8A8A] font-semibold underline cursor-pointer"
                >
                  ¿Cómo medirse?
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.measurements)
                  .filter(([_, val]) => Boolean(val && val.trim()))
                  .map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/70 border border-[#DEC0C0]/50">
                      <span className="capitalize text-[#5c4b45] font-medium">{key}:</span>
                      <span className="font-bold text-[#2c221e] tabular-nums">{val}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sustainability Trust Seal */}
            <div className="flex items-center gap-2 mt-4 text-[11px] text-[#5c4b45]">
              <ShieldCheck className="w-4 h-4 text-[#EA8A8A] shrink-0" />
              <span>Prenda higienizada, verificada en costuras y lista para usar.</span>
            </div>
          </div>

          {/* Action Buttons: Agregar al Carrito & Iniciar Compra */}
          <div className="mt-6 pt-4 border-t border-[#DEC0C0]">
            {isInCart ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-[#68544d]/20 text-[#5c4b45] font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-emerald-700" />
                <span>Esta prenda única ya está en tu carrito</span>
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-[#68544d] hover:bg-[#68544d]/10 text-[#68544d] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Agregar al Carrito</span>
                </button>
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                    onBuyNow?.(product);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] active:scale-[0.98] text-[#2c221e] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Iniciar Compra</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
