import React, { useState, useMemo } from 'react';
import { formatPrice } from '../../../utils/formatters';

interface DataPoint {
  label: string;
  sales: number;
  orders: number;
}

interface SalesTrendsChartProps {
  currentData: DataPoint[];
  previousData: DataPoint[];
}

export const SalesTrendsChart: React.FC<SalesTrendsChartProps> = ({
  currentData,
  previousData
}) => {
  const [metricMode, setMetricMode] = useState<'sales' | 'orders'>('sales');
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Dimensiones del canvas SVG
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  // Encontrar el valor máximo para escalar el eje Y
  const maxValue = useMemo(() => {
    const allVals = [
      ...currentData.map(d => metricMode === 'sales' ? d.sales : d.orders),
      ...previousData.map(d => metricMode === 'sales' ? d.sales : d.orders)
    ];
    const max = Math.max(...allVals, 10);
    return Math.ceil(max * 1.15); // 15% margen superior
  }, [currentData, previousData, metricMode]);

  // Transformar datos a coordenadas (X, Y)
  const getCoordinates = (data: DataPoint[]) => {
    const stepX = (width - paddingX * 2) / (data.length - 1);
    return data.map((d, index) => {
      const val = metricMode === 'sales' ? d.sales : d.orders;
      const x = paddingX + index * stepX;
      const y = height - paddingBottom - (val / maxValue) * (height - paddingTop - paddingBottom);
      return { x, y, val, label: d.label, original: d };
    });
  };

  const currentCoords = useMemo(() => getCoordinates(currentData), [currentData, maxValue, metricMode]);
  const prevCoords = useMemo(() => getCoordinates(previousData), [previousData, maxValue, metricMode]);

  // Generador de curva Bézier suave (Spline)
  const generateSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const currentPath = useMemo(() => generateSmoothPath(currentCoords), [currentCoords]);
  const prevPath = useMemo(() => generateSmoothPath(prevCoords), [prevCoords]);

  // Path de relleno degradado bajo la curva actual
  const currentAreaPath = useMemo(() => {
    if (currentCoords.length === 0) return '';
    const baseY = height - paddingBottom;
    return `${currentPath} L ${currentCoords[currentCoords.length - 1].x} ${baseY} L ${currentCoords[0].x} ${baseY} Z`;
  }, [currentPath, currentCoords, height, paddingBottom]);

  // Y-axis ticks
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => Math.round(maxValue * ratio));

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs flex flex-col justify-between">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="font-serif font-bold text-base text-[#2c221e]">
            Tendencias de Ventas
          </h3>
          <p className="text-xs text-[#5c4b45]">
            Comparativa de rendimiento en tiempo real
          </p>
        </div>

        {/* Metric Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#FAF6F0] p-1 rounded-2xl border border-[#DEC0C0]/60">
            <button
              onClick={() => setMetricMode('sales')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                metricMode === 'sales'
                  ? 'bg-[#EA8A8A] text-[#2c221e] shadow-xs'
                  : 'text-[#5c4b45] hover:text-[#2c221e]'
              }`}
            >
              Ventas ($)
            </button>
            <button
              onClick={() => setMetricMode('orders')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                metricMode === 'orders'
                  ? 'bg-[#EA8A8A] text-[#2c221e] shadow-xs'
                  : 'text-[#5c4b45] hover:text-[#2c221e]'
              }`}
            >
              Pedidos (#)
            </button>
          </div>

          {/* Legend */}
          <div className="hidden md:flex items-center gap-3 pl-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#EA8A8A]" />
              <span className="text-[#2c221e] font-semibold text-[11px]">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 rounded-full bg-[#DEC0C0]" />
              <span className="text-[#5c4b45] text-[11px]">Anterior</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
        >
          <defs>
            <linearGradient id="cherryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EA8A8A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EA8A8A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yTicks.map((tickVal, i) => {
            const y = height - paddingBottom - (tickVal / maxValue) * (height - paddingTop - paddingBottom);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#FAF6F0"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#7a645c"
                  opacity="0.7"
                >
                  {metricMode === 'sales'
                    ? (tickVal >= 1000 ? `$${Math.round(tickVal / 1000)}k` : `$${tickVal}`)
                    : tickVal}
                </text>
              </g>
            );
          })}

          {/* Previous period line (Ivory/Cocoa) */}
          <path
            d={prevPath}
            fill="none"
            stroke="#DEC0C0"
            strokeWidth="2.5"
            strokeDasharray="5 5"
            strokeLinecap="round"
          />

          {/* Current period area fill */}
          <path
            d={currentAreaPath}
            fill="url(#cherryGradient)"
          />

          {/* Current period bold line (Cherry) */}
          <path
            d={currentPath}
            fill="none"
            stroke="#EA8A8A"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Interactive Data points and Labels */}
          {currentCoords.map((coord, idx) => {
            const isHovered = activePointIndex === idx;

            return (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setActivePointIndex(idx)}>
                {/* X-axis label */}
                <text
                  x={coord.x}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? 'bold' : '500'}
                  fill={isHovered ? '#2c221e' : '#5c4b45'}
                >
                  {coord.label}
                </text>

                {/* Vertical hover marker */}
                {isHovered && (
                  <line
                    x1={coord.x}
                    y1={paddingTop}
                    x2={coord.x}
                    y2={height - paddingBottom}
                    stroke="#EA8A8A"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? 6 : 4}
                  fill="#FFFFFF"
                  stroke="#EA8A8A"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Floating Tooltip */}
        {activePointIndex !== null && currentCoords[activePointIndex] && (
          <div
            className="absolute top-2 right-4 bg-[#2c221e] text-[#FAF6F0] rounded-xl px-3 py-1.5 text-xs shadow-lg animate-fadeIn pointer-events-none"
          >
            <span className="font-bold text-[#EA8A8A]">
              {currentCoords[activePointIndex].label}:
            </span>{' '}
            {metricMode === 'sales'
              ? formatPrice(currentCoords[activePointIndex].original.sales)
              : `${currentCoords[activePointIndex].original.orders} pedidos`}
          </div>
        )}
      </div>
    </div>
  );
};
