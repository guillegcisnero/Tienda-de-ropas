import React, { useState, useRef, useEffect } from 'react';
import { X, Ruler, ShoppingBag, Check, ShieldCheck, ArrowRight, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isInCart: boolean;
  onAddToCart: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onOpenGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isInCart,
  onAddToCart,
  onBuyNow,
  onOpenGuide
}) => {
  // Estado para zoom interactivo con posicionamiento cursor
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reiniciar estado de zoom cada vez que cambia o se abre la prenda
  useEffect(() => {
    if (isOpen) {
      setIsZoomed(false);
      setZoomPos({ x: 50, y: 50 });
    }
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  // Manejar el movimiento de mouse sobre la imagen para trasladar el punto focal del zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  // Manejar interacción touch en móviles
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - top) / height) * 100));
    setZoomPos({ x, y });
  };

  const handleContainerClick = () => {
    setIsZoomed(prev => !prev);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white text-[#1A1A1A] rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] flex items-center justify-center transition-colors cursor-pointer border border-[#E8E6E1] shadow-xs"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section with Interactive Dynamic Zoom — Marfil Seda Background */}
        <div 
          ref={containerRef}
          onClick={handleContainerClick}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className={`md:w-1/2 relative min-h-[300px] md:min-h-full flex items-center justify-center overflow-hidden transition-colors duration-300 select-none bg-[#FBFBF9] border-b md:border-b-0 md:border-r border-[#E8E6E1] ${
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
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[75vh] p-4 transition-transform duration-300 ease-out select-none pointer-events-none"
          />

          {/* Pill when zoomed indicating you can move around */}
          {isZoomed && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fadeIn">
              <span className="bg-[#1A1A1A]/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/20 whitespace-nowrap">
                <Move className="w-3.5 h-3.5 text-[#C5A880]" />
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
            className="absolute bottom-4 right-4 z-10 py-1.5 px-3 rounded-full bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-md cursor-pointer border border-white/20 active:scale-95"
            title={isZoomed ? 'Ver prenda completa' : 'Activar zoom dinámico'}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Prenda Completa</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Zoom Dinámico</span>
              </>
            )}
          </button>

          {/* Badges */}
          <div className={`absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none transition-opacity duration-200 ${isZoomed ? 'opacity-30' : 'opacity-100'}`}>
            <span className="bg-[#1A1A1A]/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Prenda Única 1/1
            </span>
            <span className="bg-white text-[#1A1A1A] border border-[#C5A880] font-bold text-xs px-3 py-0.5 rounded-full shadow-xs">
              {product.size}
            </span>
          </div>
        </div>

        {/* Product Details Section — 80% Blanco Luminoso */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#7A7A7A] font-semibold mb-1">
              <span>{product.category}</span>
              <span>·</span>
              <span>{product.subCategory}</span>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] leading-snug">
              {product.name}
            </h2>

            <div className="flex items-center gap-3 my-3">
              <span className="font-serif text-2xl font-bold text-[#1A1A1A]">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs bg-[#FBFBF9] border border-[#E8E6E1] text-[#1A1A1A] font-semibold px-2.5 py-1 rounded-full">
                Estado: {product.condition}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#5A5A5A] leading-relaxed font-light mb-5">
              {product.description}
            </p>

            {/* Measurements Table — Marfil Seda Contenedor & Calidez Textil */}
            <div className="bg-[#FBFBF9] rounded-2xl p-4 border border-[#E8E6E1]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#C5A880]" /> Medidas Reales en cm
                </span>
                <button
                  onClick={onOpenGuide}
                  className="text-[11px] text-[#8F7049] hover:text-[#1A1A1A] font-semibold underline cursor-pointer"
                >
                  ¿Cómo medirse?
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.measurements)
                  .filter(([_, val]) => Boolean(val && val.trim()))
                  .map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E8E6E1]">
                      <span className="capitalize text-[#5A5A5A] font-medium">{key}:</span>
                      <span className="font-bold text-[#1A1A1A] tabular-nums">{val}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Sustainability Trust Seal */}
            <div className="flex items-center gap-2 mt-4 text-[11px] text-[#5A5A5A]">
              <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
              <span>Prenda higienizada, verificada en costuras y lista para usar.</span>
            </div>
          </div>

          {/* Action Buttons: Agregar al Carrito & Iniciar Compra — Regla 80/15/5 */}
          <div className="mt-6 pt-4 border-t border-[#EDEBE6]">
            {isInCart ? (
              <button
                disabled
                className="w-full py-3.5 px-6 rounded-xl bg-[#FBFBF9] text-[#7A7A7A] border border-[#E8E6E1] font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 text-[#C5A880]" />
                <span>Esta prenda única ya está en tu carrito</span>
              </button>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Botón Secundario Oro Champaña */}
                <button
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl border border-[#C5A880] hover:bg-[#FBFBF9] text-[#1A1A1A] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                  <span>Agregar al Carrito</span>
                </button>
                {/* Botón Primario Negro Suave */}
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                    onBuyNow?.(product);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#1A1A1A] hover:bg-black active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Iniciar Compra</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A880] group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
