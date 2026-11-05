import React from 'react';

interface DonutSlice {
  label: string;
  count: number;
  color: string;
}

interface OrdersStatusDonutProps {
  availableCount: number;
  soldCount: number;
  pendingOrdersCount: number;
}

export const OrdersStatusDonut: React.FC<OrdersStatusDonutProps> = ({
  availableCount,
  soldCount,
  pendingOrdersCount
}) => {
  const total = availableCount + soldCount + pendingOrdersCount;

  const slices: DonutSlice[] = [
    { label: 'Disponibles', count: availableCount, color: '#10B981' }, // Esmeralda
    { label: 'Vendidas', count: soldCount, color: '#EA8A8A' },       // Cherry
    { label: 'En proceso', count: pendingOrdersCount, color: '#F59E0B' } // Ámbar
  ];

  // Cálculo de los trazos de circunferencia SVG (stroke-dasharray & stroke-dashoffset)
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs flex flex-col justify-between">
      <div className="mb-4 pb-3 border-b border-zinc-100">
        <h3 className="font-serif font-bold text-base text-[#2c221e]">
          Estado de Catálogo
        </h3>
        <p className="text-xs text-[#5c4b45]">
          Distribución de inventario y pedidos
        </p>
      </div>

      {/* Donut Chart Visual */}
      <div className="relative flex items-center justify-center my-2">
        <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
          {/* Background circle ring */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#FAF6F0"
            strokeWidth="20"
          />

          {/* Slices */}
          {total > 0 &&
            slices.map((slice, index) => {
              if (slice.count === 0) return null;
              const ratio = slice.count / total;
              const dashLength = ratio * circumference;
              const dashOffset = accumulatedOffset;
              accumulatedOffset -= dashLength;

              return (
                <circle
                  key={index}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 hover:opacity-90 cursor-pointer"
                />
              );
            })}
        </svg>

        {/* Center Total Counter */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-serif text-2xl font-bold text-[#2c221e] leading-none">
            {total}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#5c4b45]/80 mt-1">
            Total ítems
          </span>
        </div>
      </div>

      {/* Legend & Breakdown */}
      <div className="space-y-2 mt-4 pt-3 border-t border-zinc-100">
        {slices.map((slice, idx) => {
          const percent = total > 0 ? Math.round((slice.count / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-[#5c4b45] font-medium">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2c221e]">{slice.count}</span>
                <span className="text-[10px] text-[#5c4b45]/70 w-8 text-right">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
