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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-[#F4E8E8] text-[#2c221e] rounded-3xl shadow-2xl border border-[#DEC0C0] p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#5c4b45]/10 hover:bg-[#5c4b45]/20 text-[#2c221e] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#EA8A8A] flex items-center justify-center text-[#2c221e]">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2c221e]">
              ¿Cómo medimos las prendas?
            </h3>
            <p className="text-xs text-[#5c4b45]">
              Medidas exactas en plano para comprar con 100% de seguridad.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5c4b45] leading-relaxed mb-6 font-light">
          Al tratarse de prendas vintage y modelos únicos de marcas diversas, las etiquetas pueden engañar. Por eso, medimos cada prenda <strong>apoyada sobre una superficie plana</strong> con un centímetro de costurera, de extremo a extremo sin estirar:
        </p>

        <div className="space-y-3.5 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-white/80 border border-[#DEC0C0] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#EA8A8A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2c221e] block">Sisa a Sisa (Ancho de pecho):</strong>
              <span className="text-[#5c4b45]">De axila a axila de la prenda en línea recta. Multiplicá por 2 para saber el contorno total.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-[#DEC0C0] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#EA8A8A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2c221e] block">Largo Total:</strong>
              <span className="text-[#5c4b45]">Desde el punto más alto del hombro (junto al cuello) hasta la botamanga o dobladillo inferior.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-[#DEC0C0] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#EA8A8A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2c221e] block">Cintura y Tiro (Pantalones y Enteritos):</strong>
              <span className="text-[#5c4b45]">La cintura se mide de borde a borde de la pretina en plano. El tiro va desde la entrepierna hasta el borde superior.</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/80 border border-[#DEC0C0] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#EA8A8A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#2c221e] block">Largo de Manga:</strong>
              <span className="text-[#5c4b45]">Desde la costura del hombro hasta el puño inclusive.</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DEC0C0] flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            Entendido, volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
};
