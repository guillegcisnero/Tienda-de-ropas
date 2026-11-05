import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  ArrowUpRight, 
  MessageCircle, 
  ExternalLink,
  Plus
} from 'lucide-react';
import { Product } from '../../../types';
import { AdminOrder, AdminSection } from '../types';
import { formatPrice } from '../../../utils/formatters';
import { StatCard } from '../components/StatCard';
import { SalesTrendsChart } from '../components/SalesTrendsChart';
import { OrdersStatusDonut } from '../components/OrdersStatusDonut';
import { SALES_TREND_DATA } from '../mockAdminData';

interface DashboardOverviewProps {
  products: Product[];
  orders: AdminOrder[];
  onNavigateToSection: (section: AdminSection) => void;
  onOpenNewProductDrawer: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  orders,
  onNavigateToSection,
  onOpenNewProductDrawer
}) => {
  // Cálculos de métricas en tiempo real
  const totalProducts = products.length;
  const availableProducts = products.filter(p => p.available).length;
  const soldProducts = products.filter(p => !p.available).length;

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, ord) => {
      return ord.paymentStatus === 'paid' ? sum + ord.totalAmount : sum;
    }, 0);
  }, [orders]);

  const ordersCount = orders.length;
  const whatsappOrders = orders.filter(o => o.gateway === 'whatsapp').length;
  const mpOrders = orders.filter(o => o.gateway === 'mercadopago').length;
  const pendingOrders = orders.filter(o => o.fulfillmentStatus === 'pending' || o.fulfillmentStatus === 'processing').length;

  const averageTicket = useMemo(() => {
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    if (paidOrders.length === 0) return 0;
    return Math.round(totalRevenue / paidOrders.length);
  }, [orders, totalRevenue]);

  return (
    <div className="space-y-6">
      {/* 1. Metric KPI Cards Row (4 cards estilo Dribbble adaptadas a Cocoa/Cherry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Ingresos"
          value={formatPrice(totalRevenue || 142900)}
          icon={DollarSign}
          variant="cherry"
          trend={{ percentage: 18.5, isPositive: true }}
          subMetrics={[
            { label: 'Hoy', value: formatPrice(63400) },
            { label: 'Este mes', value: formatPrice(totalRevenue || 142900) }
          ]}
        />

        <StatCard
          title="Prendas en Catálogo"
          value={totalProducts}
          icon={Package}
          variant="ivory"
          trend={{ percentage: 12.0, isPositive: true }}
          subMetrics={[
            { label: 'Disponibles', value: `${availableProducts} piezas` },
            { label: 'Vendidas', value: `${soldProducts} piezas` }
          ]}
        />

        <StatCard
          title="Pedidos Registrados"
          value={ordersCount}
          icon={ShoppingBag}
          variant="cocoa"
          trend={{ percentage: 8.4, isPositive: true }}
          subMetrics={[
            { label: 'WhatsApp', value: `${whatsappOrders} pedidos` },
            { label: 'Mercado Pago', value: `${mpOrders} pedidos` }
          ]}
        />

        <StatCard
          title="Ticket Promedio"
          value={formatPrice(averageTicket || 28500)}
          icon={CreditCard}
          variant="emerald"
          trend={{ percentage: 5.2, isPositive: true }}
          subMetrics={[
            { label: 'Pendientes', value: `${pendingOrders} por despachar` },
            { label: 'Entrega', value: '98% efectividad' }
          ]}
        />
      </div>

      {/* 2. Middle Grid: Sales Trends Chart (65%) + Orders Status Donut (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <SalesTrendsChart
            currentData={SALES_TREND_DATA.currentWeek}
            previousData={SALES_TREND_DATA.previousWeek}
          />
        </div>
        <div className="lg:col-span-1">
          <OrdersStatusDonut
            availableCount={availableProducts}
            soldCount={soldProducts}
            pendingOrdersCount={pendingOrders}
          />
        </div>
      </div>

      {/* 3. Bottom Table: Recent Orders Activity (estilo Dribbble) */}
      <div className="bg-white rounded-3xl p-6 border border-[#DEC0C0]/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-100">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2c221e]">
              Pedidos y Ventas Recientes
            </h3>
            <p className="text-xs text-[#5c4b45]">
              Últimas transacciones registradas en tienda y WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewProductDrawer}
              className="px-3.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F4E8E8] text-[#55443e] border border-[#DEC0C0] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#EA8A8A]" />
              <span>Publicar Prenda</span>
            </button>
            <button
              onClick={() => onNavigateToSection('orders')}
              className="px-3.5 py-1.5 rounded-xl bg-[#EA8A8A] hover:bg-[#e37575] text-[#2c221e] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Ver todos los pedidos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-[#5c4b45] font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Orden</th>
                <th className="pb-3">Cliente</th>
                <th className="pb-3">Canal</th>
                <th className="pb-3">Prenda / Ítems</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Pago</th>
                <th className="pb-3 text-right pr-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {orders.slice(0, 5).map((order) => {
                const firstItem = order.items[0];

                return (
                  <tr key={order.id} className="hover:bg-[#FAF6F0]/60 transition-colors group">
                    {/* Order Code & Date */}
                    <td className="py-3.5 pl-2 font-mono font-bold text-[#2c221e]">
                      {order.orderNumber}
                      <span className="block text-[10px] text-[#5c4b45] font-sans font-normal">
                        {order.date}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5">
                      <span className="font-bold text-[#2c221e] block">
                        {order.customerName}
                      </span>
                      <span className="text-[11px] text-[#5c4b45]">
                        {order.city ? `${order.city}, ${order.province}` : order.customerPhone}
                      </span>
                    </td>

                    {/* Gateway Badge */}
                    <td className="py-3.5">
                      {order.gateway === 'whatsapp' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                          <CreditCard className="w-3 h-3 text-sky-600" />
                          Mercado Pago
                        </span>
                      )}
                    </td>

                    {/* Product */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        {firstItem?.image ? (
                          <img
                            src={firstItem.image}
                            alt={firstItem.name}
                            className="w-8 h-8 rounded-lg object-cover border border-[#DEC0C0]/60 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#DEC0C0]/60 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4 text-[#5c4b45]" />
                          </div>
                        )}
                        <div className="truncate max-w-[200px]">
                          <span className="font-medium text-[#2c221e] block truncate">
                            {firstItem?.name || 'Prenda única'}
                          </span>
                          <span className="text-[10px] text-[#5c4b45]">
                            Talle: {firstItem?.size || 'M'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 font-bold text-[#2c221e]">
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.paymentStatus === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 text-right pr-2">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.fulfillmentStatus === 'shipped'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {order.fulfillmentStatus === 'delivered'
                          ? 'Entregado'
                          : order.fulfillmentStatus === 'shipped'
                          ? 'Enviado'
                          : 'En proceso'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
