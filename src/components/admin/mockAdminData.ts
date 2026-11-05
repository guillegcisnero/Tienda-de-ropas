import { AdminOrder } from './types';

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-8492',
    date: 'Hoy, 18:42',
    customerName: 'Camila Rodriguez',
    customerPhone: '5491138492817',
    customerEmail: 'cami.rodriguez@gmail.com',
    city: 'Palermo',
    province: 'CABA',
    items: [
      {
        name: 'Campera Bomber Oversize Vintage 90s',
        size: 'L',
        price: 34500,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop&q=80',
        quantity: 1
      }
    ],
    totalAmount: 34500,
    gateway: 'mercadopago',
    paymentStatus: 'paid',
    fulfillmentStatus: 'processing'
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-8488',
    date: 'Hoy, 15:10',
    customerName: 'Lucas Benitez',
    customerPhone: '5491167281920',
    customerEmail: 'lucas.benitez@outlook.com',
    city: 'San Isidro',
    province: 'Buenos Aires',
    items: [
      {
        name: 'Buzo Crewneck Carhartt Washed',
        size: 'M',
        price: 28900,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&auto=format&fit=crop&q=80',
        quantity: 1
      }
    ],
    totalAmount: 28900,
    gateway: 'whatsapp',
    paymentStatus: 'paid',
    fulfillmentStatus: 'shipped'
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-8475',
    date: 'Ayer, 20:15',
    customerName: 'Martina Varela',
    customerPhone: '5491148192033',
    customerEmail: 'martu.varela@gmail.com',
    city: 'Belgrano',
    province: 'CABA',
    items: [
      {
        name: 'Pantalón Cargo Wide Leg Carpenter',
        size: '38',
        price: 24000,
        image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&auto=format&fit=crop&q=80',
        quantity: 1
      }
    ],
    totalAmount: 24000,
    gateway: 'mercadopago',
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered'
  },
  {
    id: 'ord-004',
    orderNumber: 'ORD-8461',
    date: 'Ayer, 16:30',
    customerName: 'Facundo Morales',
    customerPhone: '5491192837461',
    customerEmail: 'facu.morales@hotmail.com',
    city: 'Rosario',
    province: 'Santa Fe',
    items: [
      {
        name: 'Gorra Vintage Corduroy 6 Paneles',
        size: 'Único',
        price: 12500,
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&auto=format&fit=crop&q=80',
        quantity: 1
      }
    ],
    totalAmount: 12500,
    gateway: 'whatsapp',
    paymentStatus: 'pending',
    fulfillmentStatus: 'pending'
  },
  {
    id: 'ord-005',
    orderNumber: 'ORD-8450',
    date: '02 Nov, 11:20',
    customerName: 'Sofía Guidi',
    customerPhone: '5491157291048',
    customerEmail: 'sofi.guidi@gmail.com',
    city: 'Córdoba Capital',
    province: 'Córdoba',
    items: [
      {
        name: 'Trench Coat Vintage Gabardina Arena',
        size: 'S',
        price: 42000,
        image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&auto=format&fit=crop&q=80',
        quantity: 1
      }
    ],
    totalAmount: 42000,
    gateway: 'mercadopago',
    paymentStatus: 'paid',
    fulfillmentStatus: 'delivered'
  }
];

export const SALES_TREND_DATA = {
  currentWeek: [
    { label: 'Lun', sales: 48500, orders: 2 },
    { label: 'Mar', sales: 62000, orders: 3 },
    { label: 'Mié', sales: 38900, orders: 2 },
    { label: 'Jue', sales: 95400, orders: 4 },
    { label: 'Vie', sales: 128000, orders: 6 },
    { label: 'Sáb', sales: 165000, orders: 7 },
    { label: 'Dom', sales: 110000, orders: 5 }
  ],
  previousWeek: [
    { label: 'Lun', sales: 35000, orders: 2 },
    { label: 'Mar', sales: 45000, orders: 2 },
    { label: 'Mié', sales: 50000, orders: 3 },
    { label: 'Jue', sales: 72000, orders: 3 },
    { label: 'Vie', sales: 98000, orders: 4 },
    { label: 'Sáb', sales: 130000, orders: 5 },
    { label: 'Dom', sales: 85000, orders: 4 }
  ]
};
