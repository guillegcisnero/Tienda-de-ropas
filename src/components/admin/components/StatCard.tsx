import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface SubMetric {
  label: string;
  value: string | number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subMetrics?: SubMetric[];
  trend?: {
    percentage: number;
    isPositive: boolean;
    text?: string;
  };
  variant?: 'cherry' | 'cocoa' | 'ivory' | 'emerald';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subMetrics,
  trend,
  variant = 'ivory'
}) => {
  // Configuración de temas basados en la paleta Cocoa / Cherry / Ivory
  const themeStyles = {
    cherry: {
      card: 'bg-gradient-to-br from-[#EA8A8A] to-[#e37575] text-[#2c221e] border-[#EA8A8A]/50 shadow-md shadow-[#EA8A8A]/20',
      iconBox: 'bg-[#2c221e]/15 text-[#2c221e]',
      title: 'text-[#2c221e]/80',
      value: 'text-[#2c221e]',
      divider: 'border-[#2c221e]/15',
      subLabel: 'text-[#2c221e]/75',
      subVal: 'text-[#2c221e] font-bold'
    },
    cocoa: {
      card: 'bg-[#55443e] text-[#FAF6F0] border-white/10 shadow-md',
      iconBox: 'bg-white/10 text-[#EA8A8A]',
      title: 'text-[#EBD5D5]/80',
      value: 'text-white',
      divider: 'border-white/10',
      subLabel: 'text-[#EBD5D5]/70',
      subVal: 'text-white font-bold'
    },
    emerald: {
      card: 'bg-white text-[#2c221e] border-emerald-200/80 shadow-xs hover:border-emerald-300',
      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      title: 'text-[#5c4b45]',
      value: 'text-[#2c221e]',
      divider: 'border-zinc-100',
      subLabel: 'text-[#5c4b45]/80',
      subVal: 'text-emerald-700 font-bold'
    },
    ivory: {
      card: 'bg-white text-[#2c221e] border-[#DEC0C0]/70 shadow-xs hover:border-[#EA8A8A]/50',
      iconBox: 'bg-[#F4E8E8] text-[#55443e] border border-[#DEC0C0]/60',
      title: 'text-[#5c4b45]',
      value: 'text-[#2c221e]',
      divider: 'border-[#DEC0C0]/40',
      subLabel: 'text-[#5c4b45]/80',
      subVal: 'text-[#2c221e] font-bold'
    }
  }[variant];

  return (
    <div
      className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${themeStyles.card}`}
    >
      <div>
        {/* Header row: Title + Icon */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${themeStyles.title}`}>
            {title}
          </span>
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${themeStyles.iconBox}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Main Value & Trend Badge */}
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <span className={`font-serif text-2xl sm:text-3xl font-bold tracking-tight ${themeStyles.value}`}>
            {value}
          </span>

          {trend && (
            <div
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/15 text-emerald-700'
                  : 'bg-rose-500/15 text-rose-700'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-3 h-3 stroke-[2.5]" />
              )}
              <span>{trend.percentage > 0 ? `+${trend.percentage}%` : `${trend.percentage}%`}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submetrics Split Row (estilo Dribbble) */}
      {subMetrics && subMetrics.length > 0 && (
        <div className={`pt-3 border-t grid grid-cols-${subMetrics.length} gap-2 ${themeStyles.divider}`}>
          {subMetrics.map((sm, idx) => (
            <div key={idx} className="leading-tight">
              <span className={`block text-[10px] ${themeStyles.subLabel}`}>
                {sm.label}
              </span>
              <span className={`text-xs ${themeStyles.subVal}`}>
                {sm.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
