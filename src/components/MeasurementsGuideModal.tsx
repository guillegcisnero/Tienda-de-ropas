import React from 'react';
import { X, Ruler, CheckCircle2 } from 'lucide-react';

interface MeasurementsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeasurementsGuideModal: React.FC<MeasurementsGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#181816] text-[#1A1A1A] dark:text-[#F5F5F0] rounded-3xl shadow-2xl border border-[#E8E6E1] dark:border-[#282826] p-6 sm:p-8 max-h-[90vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FBFBF9] dark:bg-[#222220] hover:bg-[#F2F1EC] dark:hover:bg-[#2A2A28] text-[#1A1A1A] dark:text-[#F5F5F0] border border-[#E8E6E1] dark:border-[#282826] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-[#F4EFEA] dark:bg-[#1E1E1C] border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880]">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-[#F5F5F0]">
              ¿Cómo medimos las prendas?
            </h3>
            <p className="text-xs text-[#5A5A5A] dark:text-[#A8A69E]">
              Medidas exactas en plano para comprar con 100% de seguridad.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5A5A5A] dark:text-[#A8A69E] leading-relaxed mb-6 font-light">
          Al tratarse de prendas vintage y modelos únicos de marcas diversas, las etiquetas pueden engañar. Por eso, en ESVEN medimos cada prenda <strong className="text-[#1A1A1A] dark:text-[#F5F5F0]">apoyada sobre una superficie plana</strong> con un centímetro de costurera, de extremo a extremo sin estirar:
        </p>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121212] border border-[#E8E6E1] dark:border-[#282826] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block">Sisa a Sisa (Ancho de pecho):</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E]">De axila a axila de la prenda en línea recta. Multiplicá por 2 para saber el contorno total.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121212] border border-[#E8E6E1] dark:border-[#282826] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block">Largo Total:</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E]">Desde el punto más alto del hombro (junto al cuello) hasta la botamanga o dobladillo inferior.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121212] border border-[#E8E6E1] dark:border-[#282826] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block">Cintura y Cadera (Pantalones & Faldas):</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E]">Medido de lado a lado con el botón cerrado sobre la mesa. Multiplicá por 2 para calcular contorno de cintura.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FBFBF9] dark:bg-[#121212] border border-[#E8E6E1] dark:border-[#282826] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1A1A1A] dark:text-[#F5F5F0] block">Tiro y Largo de Pierna:</strong>
              <span className="text-[#5A5A5A] dark:text-[#A8A69E]">Tiro desde la entrepierna hasta la cintura; largo desde la entrepierna hasta el dobladillo inferior.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#E8E6E1] dark:border-[#282826] flex items-center justify-between text-xs text-[#5A5A5A] dark:text-[#A8A69E]">
          <span>💡 Consejo: Compará estos cm con tu prenda favorita en casa.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A1A1A] dark:bg-[#F5F5F0] text-white dark:text-[#121212] font-semibold cursor-pointer hover:bg-black dark:hover:bg-white transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
