import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  CreditCard, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Filter,
  User,
  Phone,
  MapPin,
  Calendar,
  X,
  Copy,
  Check,
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { AdminOrder } from '../types';
import { formatPrice } from '../../../utils/formatters';

interface OrdersViewProps {
  orders: AdminOrder[];
  onUpdateOrderStatus?: (orderId: string, status: AdminOrder['fulfillmentStatus']) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onUpdateOrderStatus }) => {
  const [filterGateway, setFilterGateway] = useState<'all' | 'whatsapp' | 'mercadopago'>('all');
  const [filterFulfillment, setFilterFulfillment] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Orders metrics
  const totalRevenue = useMemo(() => orders.reduce((acc, o) => acc + o.totalAmount, 0), [orders]);
  const whatsappCount = useMemo(() => orders.filter(o => o.gateway === 'whatsapp').length, [orders]);
  const mpCount = useMemo(() => orders.filter(o => o.gateway === 'mercadopago').length, [orders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filterGateway !== 'all' && order.gateway !== filterGateway) {
        return false;
      }
      if (filterFulfillment !== 'all') {
        if (filterFulfillment === 'pending' && order.fulfillmentStatus !== 'pending' && order.fulfillmentStatus !== 'processing') {
          return false;
        }
        if (filterFulfillment === 'shipped' && order.fulfillmentStatus !== 'shipped') {
          return false;
        }
        if (filterFulfillment === 'delivered' && order.fulfillmentStatus !== 'delivered') {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchNumber = order.orderNumber.toLowerCase().includes(q);
        const matchPhone = order.customerPhone.includes(q);
        if (!matchName && !matchNumber && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, filterGateway, filterFulfillment, searchQuery]);

  // Generador de enlace WhatsApp con mensaje personalizado según estado
  const buildWhatsAppLink = (order: AdminOrder) => {
    const rawPhone = order.customerPhone.replace(/\D/g, '');
    let statusMsg = 'estamos procesando tu pedido';
    if (order.fulfillmentStatus === 'shipped') {
      statusMsg = 'tu pedido ya se encuentra en camino con el correo';
    } else if (order.fulfillmentStatus === 'delivered') {
      statusMsg = 'tu pedido ya figura como entregado';
    }

    const text = encodeURIComponent(
      `¡Hola ${order.customerName}! Te escribimos de Aura Tienda de Ropas sobre tu pedido ${order.orderNumber}. Te contactamos para comentarte que ${statusMsg}. ¿Tenés alguna consulta o querés coordinar algún detalle?`
    );
    return `https://wa.me/${rawPhone}?text=${text}`;
  };

  const handleCopyOrderInfo = (order: AdminOrder) => {
    const itemsText = order.items.map(it => `• ${it.name} (Talle: ${it.size}) - ${formatPrice(it.price)}`).join('\n');
    const summary = `ORDEN: ${order.orderNumber}\nFecha: ${order.date}\nCliente: ${order.customerName}\nTeléfono: ${order.customerPhone}\nDirección: ${order.shippingAddress || 'No especificada'}, ${order.city || ''}\nCanal: ${order.gateway.toUpperCase()}\nItems:\n${itemsText}\nTotal: ${formatPrice(order.totalAmount)}`;
    
    navigator.clipboard.writeText(summary);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  return (
    <div className="space-y-5">
      {/* 1. Quick Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#DEC0C0]/70 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5c4b45] block mb-1">
            Total Pedidos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-[#2c221e]">
              {orders.length}
            </span>
            <span className="text-[11px] text-[#5c4b45]">registrados</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
            Vía WhatsApp
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-emerald-700">
              {whatsappCount}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {orders.length > 0 ? `${Math.round((whatsappCount / orders.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-sky-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 block mb-1">
            Vía Mercado Pago
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-black text-2xl text-sky-700">
              {mpCount}
            </span>
            <span className="text-[11px] text-sky-600 font-semibold">
              {orders.length > 0 ? `${Math.round((mpCount / orders.length) * 100)}%` : '0%'}
            </span>
          </div>
        </div>

        <div className="bg-[#443530] text-[#FAF6F0] rounded-2xl p-4 border border-[#55443e] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#DEC0C0] block mb-1">
            Total Facturado
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif font-bold text-xl text-[#FAF6F0]">
              {formatPrice(totalRevenue)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Header & Filters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DEC0C0]/70 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-base text-[#2c221e]">
            Gestión Omnicanal de Pedidos
          </h3>
          <p className="text-xs text-[#5c4b45]">
            Seguimiento de compras por WhatsApp y Mercado Pago ({filteredOrders.length} pedidos)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search order */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-[#5c4b45] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cliente, orden o teléfono..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#FAF6F0] border border-[#DEC0C0] rounded-xl text-xs text-[#2c221e] focus:outline-none focus:ring-2 focus:ring-[#EA8A8A]"
            />
          </div>

          {/* Gateway Tabs */}
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DEC0C0]/60 text-xs">
            <button
              onClick={() => setFilterGateway('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterGateway === 'all'
                  ? 'bg-[#EA8A8A] text-[#2c221e]'
                  : 'text-[#5c4b45] hover:text-[#2c221e]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterGateway('whatsapp')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterGateway === 'whatsapp'
                  ? 'bg-emerald-600 text-white'
                  : 'text-[#5c4b45] hover:text-[#2c221e]'
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              WhatsApp
            </button>
            <button
              onClick={() => setFilterGateway('mercadopago')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                filterGateway === 'mercadopago'
                  ? 'bg-sky-600 text-white'
                  : 'text-[#5c4b45] hover:text-[#2c221e]'
              }`}
            >
              <CreditCard className="w-3 h-3" />
              Mercado Pago
            </button>
          </div>

          {/* Status filter pills */}
          <div className="flex bg-[#FAF6F0] p-1 rounded-xl border border-[#DEC0C0]/60 text-xs">
            <button
              onClick={() => setFilterFulfillment('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterFulfillment === 'all' ? 'bg-white text-[#2c221e] shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterFulfillment('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterFulfillment === 'pending' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilterFulfillment('shipped')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterFulfillment === 'shipped' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-[#5c4b45]'
              }`}
            >
              Enviados
            </button>
          </div>
        </div>
      </div>

      {/* 3. Orders List / Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#DEC0C0]/70 shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-14 text-center text-[#5c4b45] space-y-2">
            <ShoppingBag className="w-10 h-10 text-[#DEC0C0] mx-auto" />
            <p className="font-serif font-bold text-sm text-[#2c221e]">
              No se encontraron pedidos
            </p>
            <p className="text-xs max-w-sm mx-auto">
              Probá ajustando los filtros de canal o el término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#DEC0C0]/60 text-[#5c4b45] font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">Pedido</th>
                  <th className="pb-3">Cliente & Contacto</th>
                  <th className="pb-3">Canal</th>
                  <th className="pb-3">Prenda Adquirida</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Cobro</th>
                  <th className="pb-3">Despacho</th>
                  <th className="pb-3 text-right pr-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEC0C0]/30">
                {filteredOrders.map((order) => {
                  const item = order.items[0];

                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-[#FAF6F0]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Number & Date */}
                      <td className="py-3.5 pl-2 font-mono font-bold text-[#2c221e]">
                        {order.orderNumber}
                        <span className="block text-[10px] text-[#5c4b45] font-sans font-normal">
                          {order.date}
                        </span>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#F4E8E8] text-[#55443e] font-bold text-xs flex items-center justify-center shrink-0">
                            {order.customerName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#2c221e] block">
                              {order.customerName}
                            </span>
                            <span className="text-[10px] text-[#5c4b45]">
                              {order.customerPhone} {order.city ? `· ${order.city}` : ''}
                            </span>
                          </div>
                        </div>
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

                      {/* Item Preview */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          {item?.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded-xl object-cover border border-[#DEC0C0]/60 shrink-0"
                            />
                          )}
                          <div className="truncate max-w-[170px]">
                            <span className="font-medium text-[#2c221e] block truncate text-xs">
                              {item?.name}
                            </span>
                            <span className="text-[10px] text-[#5c4b45]">
                              Talle {item?.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 font-bold text-xs sm:text-sm text-[#2c221e]">
                        {formatPrice(order.totalAmount)}
                      </td>

                      {/* Payment Status Pill */}
                      <td className="py-3.5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus === 'paid' ? 'Acreditado' : 'Pendiente'}
                        </span>
                      </td>

                      {/* Fulfillment Status & Dropdown */}
                      <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                        {onUpdateOrderStatus ? (
                          <select
                            value={order.fulfillmentStatus}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as AdminOrder['fulfillmentStatus'])}
                            className={`text-[10px] font-bold py-1 px-2 rounded-lg border transition-all cursor-pointer ${
                              order.fulfillmentStatus === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : order.fulfillmentStatus === 'shipped'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                                : 'bg-amber-50 text-amber-700 border-amber-300'
                            }`}
                          >
                            <option value="pending">En preparación</option>
                            <option value="processing">Procesando</option>
                            <option value="shipped">En camino</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                              : 'En preparación'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyOrderInfo(order)}
                            className="p-1.5 rounded-xl text-[#5c4b45] hover:text-[#2c221e] hover:bg-[#FAF6F0] border border-transparent hover:border-[#DEC0C0] transition-all cursor-pointer"
                            title="Copiar datos del pedido"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={buildWhatsAppLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-xs"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Order Detail Slide-Over Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-[#443530]/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <aside 
              className="w-screen max-w-md bg-[#FAF6F0] shadow-2xl flex flex-col h-full rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl border-l border-[#DEC0C0] transform transition-transform duration-300 ease-out"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-white border-b border-[#DEC0C0]/70 flex items-center justify-between sm:rounded-tl-3xl">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EA8A8A] block">
                    Detalle de Compra
                  </span>
                  <h3 className="font-serif font-bold text-lg text-[#2c221e]">
                    Pedido {selectedOrder.orderNumber}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-[#5c4b45] hover:text-[#2c221e] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  aria-label="Cerrar detalle de compra"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#2c221e]">
                {/* Status & Gateway banner */}
                <div className="bg-white p-4 rounded-2xl border border-[#DEC0C0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#5c4b45] uppercase font-bold block mb-0.5">
                      Canal de Compra
                    </span>
                    <span className="font-bold text-sm text-[#2c221e] flex items-center gap-1.5">
                      {selectedOrder.gateway === 'whatsapp' ? (
                        <>
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <span>WhatsApp Checkout</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-sky-600" />
                          <span>Mercado Pago Direct</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#5c4b45] uppercase font-bold block mb-0.5">
                      Estado de Pago
                    </span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedOrder.paymentStatus === 'paid' ? 'Acreditado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-white p-4 rounded-2xl border border-[#DEC0C0] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#55443e] block">
                      Datos del Comprador
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderInfo(selectedOrder)}
                      className="text-[10px] text-[#EA8A8A] hover:underline font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar etiqueta</span>
                    </button>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#5c4b45]" />
                      <span className="font-semibold">{selectedOrder.customerName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#5c4b45]" />
                      <span>{selectedOrder.customerPhone}</span>
                    </p>
                    {selectedOrder.customerEmail && (
                      <p className="text-[#5c4b45] pl-5">
                        {selectedOrder.customerEmail}
                      </p>
                    )}
                    <p className="flex items-center gap-2 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5c4b45]" />
                      <span>{selectedOrder.shippingAddress || 'Retiro en Showroom'}, {selectedOrder.city || ''}</span>
                    </p>
                  </div>
                </div>

                {/* Purchased items */}
                <div className="bg-white p-4 rounded-2xl border border-[#DEC0C0] space-y-3">
                  <span className="font-bold text-[#55443e] block">
                    Prendas en el Pedido ({selectedOrder.items.length})
                  </span>

                  <div className="divide-y divide-[#DEC0C0]/40">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#DEC0C0] shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <span className="font-bold text-[#2c221e] block text-xs">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[#5c4b45]">
                            Talle: {item.size}
                          </span>
                        </div>
                        <span className="font-bold text-xs text-[#2c221e]">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial breakdown */}
                  <div className="pt-2 border-t border-[#DEC0C0]/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#5c4b45]">
                      <span>Subtotal</span>
                      <span>{formatPrice(selectedOrder.totalAmount - (selectedOrder.shippingCost || 0))}</span>
                    </div>
                    {selectedOrder.shippingCost ? (
                      <div className="flex justify-between text-[#5c4b45]">
                        <span>Costo de Envío</span>
                        <span>{formatPrice(selectedOrder.shippingCost)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between font-bold text-sm text-[#2c221e] pt-1 border-t border-[#DEC0C0]/40">
                      <span>Total Pagado</span>
                      <span>{formatPrice(selectedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Action */}
                <div className="pt-2">
                  <a
                    href={buildWhatsAppLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Chat de WhatsApp con {selectedOrder.customerName}</span>
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
};
