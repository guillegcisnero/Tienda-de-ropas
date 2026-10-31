export interface Measurements {
  sisa?: string;
  largo?: string;
  manga?: string;
  hombros?: string;
  cintura?: string;
  tiro?: string;
  bota?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: string;
  name: string;
  category: 'Urbana' | 'Infantil' | string;
  subCategory?: string;
  condition: string;
  size: string;
  measurements: Measurements;
  description: string;
  price: number;
  weightGrams?: number;
  image: string;
  isSinglePiece: boolean;
  available: boolean;
  createdAt?: string;
}

export interface CartItem extends Product {
  addedAt: number;
}

export interface ShippingRate {
  name: string;
  price: number;
}

export interface ShippingConfig {
  province: string;
  postalCode: string;
  type: 'shipping' | 'pickup';
  cost: number;
  service: string;
}

export interface BuyerInfo {
  name: string;
  phone: string;
  email: string;
  province: string;
  address: string;
  postalCode: string;
}

export interface FilterState {
  category: string;
  size: string;
  condition: string;
  search: string;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface StoreConfig {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  currency: string;
  mercadoPagoPublicKey?: string;
}
