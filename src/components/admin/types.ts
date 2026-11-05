import { Product } from '../../types';

export type AdminSection = 'dashboard' | 'catalog' | 'orders' | 'settings';

export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'cancelled';
export type FulfillmentStatus = 'delivered' | 'shipped' | 'processing' | 'pending' | 'cancelled';
export type GatewayType = 'whatsapp' | 'mercadopago';

export interface AdminOrderItem {
  productId?: string;
  name: string;
  size: string;
  price: number;
  image?: string;
  quantity?: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city?: string;
  province?: string;
  items: AdminOrderItem[];
  totalAmount: number;
  gateway: GatewayType;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueToday: number;
  revenueMonth: number;
  totalOrders: number;
  ordersToday: number;
  ordersMonth: number;
  activeProducts: number;
  soldProducts: number;
  totalProducts: number;
  whatsappOrdersCount: number;
  mpOrdersCount: number;
}
