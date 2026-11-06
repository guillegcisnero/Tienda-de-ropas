import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Ruler, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Heart 
} from 'lucide-react';
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
  isFavorite?: boolean;
  onToggleFavorite?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isInCart,
  onAddToCart,
  onBuyNow,
  onOpenGuide,
  isFavorite = false,
  onToggleFavorite
}) => {
  // Lista unificada de fotos (retrocompatible)
  const images: string[] = product 
    ? (product.images && product.images.length > 0 ? product.images : [product.image])
    : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Estado para zoom interactivo con posicionamiento cursor
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Estado para Lightbox a pantalla completa
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);

  // Reiniciar estado cada vez que cambia el producto o se abre
  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setIsZoomed(false);
      setZoomPos({ x: 50, y: 50 });
      setIsLightboxOpen(false);
      setLightboxScale(1);
    }
  }, [isOpen, product?.id]);

  // Manejo de navegación por teclado en Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length]);

  if (!isOpen || !product) return null;

  const currentImage = images[activeImageIndex] || product.image;

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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(false);
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-4xl bg-white text-[#1A1A1A] rounded-3xl shadow-2xl border border-[#E8E6E1] overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botones de Cabecera (Cerrar y Favorito) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            {onToggleFavorite && (
              <button 
                onClick={() => onToggleFavorite(product)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-xs ${
                  isFavorite 
                    ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105' 
                    : 'bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] border-[#E8E6E1]'
                }`}
                aria-label={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#FBFBF9] hover:bg-[#F2F1EC] text-[#1A1A1A] flex items-center justify-center transition-colors cursor-pointer border border-[#E8E6E1] shadow-xs"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Columna Izquierda: Galería Multi-foto + Selector */}
          <div className="md:w-1/2 flex flex-col bg-[#FBFBF9] border-b md:border-b-0 md:border-r border-[#E8E6E1]">
            {/* Contenedor Principal de la Imagen */}
            <div 
              ref={containerRef}
              onClick={() => setIsZoomed(prev => !prev)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className={`relative flex-1 min-h-[300px] md:min-h-[420px] flex items-center justify-center overflow-hidden select-none ${
                isZoomed ? 'cursor-crosshair' : 'cursor-zoom-in'
              }`}
              title={isZoomed ? 'Hacé clic para alejar' : 'Hacé clic para hacer zoom interactivo'}
            >
              <img 
                src={currentImage} 
                alt={`${product.name} - Vista ${activeImageIndex + 1}`} 
                draggable={false}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? 'scale(2.4)' : 'scale(1)',
                }}
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[60vh] p-4 transition-transform duration-300 ease-out select-none pointer-events-none"
              />

              {/* Pill indicador de movimiento con zoom activo */}
              {isZoomed && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fadeIn">
                  <span className="bg-[#1A1A1A]/85 backdrop-blur-md text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-white/20 whitespace-nowrap">
                    <Move className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Mové el cursor para inspeccionar</span>
                  </span>
                </div>
              )}

              {/* Flechas de navegación (si hay más de 1 foto) */}
              {images.length > 1 && !isZoomed && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1A1A1A] flex items-center justify-center shadow-md backdrop-blur-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#1A1A1A] flex items-center justify-center shadow-md backdrop-blur-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label="Siguiente foto"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Botón flotante: Lightbox a pantalla completa */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                  setLightboxScale(1);
                }}
                className="absolute bottom-4 left-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-[#1A1A1A] backdrop-blur-md transition-all shadow-md cursor-pointer border border-[#E8E6E1] hover:scale-105"
                title="Ver a pantalla completa con zoom HD"
              >
                <Maximize2 className="w-4 h-4 text-[#1A1A1A]" />
              </button>

              {/* Botón Zoom Toggle */}
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
                    <span>Alejar</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Zoom Dinámico</span>
                  </>
                )}
              </button>

              {/* Badges de Pieza Única y Talle */}
              <div className={`absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none transition-opacity duration-200 ${isZoomed ? 'opacity-20' : 'opacity-100'}`}>
                <span className="bg-[#1A1A1A]/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                  Prenda Única 1/1
                </span>
                <span className="bg-white text-[#1A1A1A] border border-[#C5A880] font-bold text-xs px-3 py-0.5 rounded-full shadow-xs">
                  {product.size}
                </span>
                {images.length > 1 && (
                  <span className="bg-white/90 backdrop-blur-xs text-[#5A5A5A] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#E8E6E1] w-fit">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                )}
              </div>
            </div>

            {/* Carrusel de Miniaturas (Thumbnails) */}
            {images.length > 1 && (
              <div className="p-3 bg-white border-t border-[#E8E6E1] flex items-center gap-2 overflow-x-auto scrollbar-none">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsZoomed(false);
                      setActiveImageIndex(idx);
                    }}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-[#1A1A1A] ring-2 ring-[#C5A880]/40 scale-105' 
                        : 'border-[#E8E6E1] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Miniatura ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna Derecha: Detalles del Producto */}
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

              {/* Tabla de Medidas Reales en cm */}
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

              {/* Sello de Confianza Moda Circular */}
              <div className="flex items-center gap-2 mt-4 text-[11px] text-[#5A5A5A]">
                <ShieldCheck className="w-4 h-4 text-[#C5A880] shrink-0" />
                <span>Prenda higienizada, verificada en costuras y lista para usar.</span>
              </div>
            </div>

            {/* Botones de Acción */}
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
                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full py-3.5 px-4 rounded-xl border border-[#C5A880] hover:bg-[#FBFBF9] text-[#1A1A1A] font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                    <span>Agregar al Carrito</span>
                  </button>

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

      {/* Lightbox a Pantalla Completa con Zoom HD */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Barra Superior Lightbox */}
          <div 
            className="flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif text-lg font-medium text-white/90">
                {product.name}
              </span>
              <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-md">
                {activeImageIndex + 1} de {images.length}
              </span>
            </div>

            {/* Controles de Zoom y Cerrar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.min(3, prev + 0.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxScale((prev) => Math.max(1, prev - 0.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Disminuir zoom"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-all cursor-pointer ml-2"
                title="Cerrar (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Visualización Central */}
          <div 
            className="flex-1 relative flex items-center justify-center overflow-auto my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 sm:left-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div 
              className="max-w-5xl max-h-[75vh] flex items-center justify-center overflow-hidden transition-transform duration-200"
              style={{ transform: `scale(${lightboxScale})` }}
            >
              <img 
                src={currentImage} 
                alt={product.name} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg select-none"
              />
            </div>
          </div>

          {/* Miniaturas en Footer del Lightbox */}
          {images.length > 1 && (
            <div 
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setLightboxScale(1);
                  }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx 
                      ? 'border-[#C5A880] ring-2 ring-white/50 scale-105' 
                      : 'border-white/20 opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
