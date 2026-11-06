import { Product, StoreConfig } from '../types';

export const STORE_CONFIG: StoreConfig = {
  storeName: "ESVEN",
  tagline: "Lujo Silencioso · Calidez Textil",
  whatsappNumber: "5491130378139",
  currency: "$",
  mercadoPagoPublicKey: "TEST-00000000-0000-0000-0000-000000000000"
};

export const SHIPPING_RATES: Record<string, { name: string; price: number; days: string }> = {
  cabaGba: { name: "CABA / GBA - Correo Argentino", price: 3500, days: "24 a 48 hs hábiles" },
  centro: { name: "Buenos Aires Interior / Córdoba / Santa Fe", price: 5200, days: "2 a 4 días hábiles" },
  cuyoNoaNea: { name: "Cuyo, NOA y NEA", price: 6800, days: "3 a 5 días hábiles" },
  patagonia: { name: "Patagonia Argentina", price: 8200, days: "4 a 6 días hábiles" },
  pickup: { name: "Retiro en punto de encuentro (Lanús / CABA)", price: 0, days: "A coordinar gratis" }
};

export const MOCK_CATALOG: Product[] = [
  {
    id: "prod-001",
    name: "Campera Denim Vintage 90s",
    category: "adultos",
    subCategory: "Camperas",
    gender: "unisex",
    condition: "9/10 (Excelente)",
    size: "Oversize M",
    measurements: {
      sisa: "54 cm",
      largo: "62 cm",
      manga: "58 cm",
      hombros: "48 cm"
    },
    description: "Denim rígido 100% algodón lavado vintage original de los 90s. Botones metálicos de época y costuras reforzadas intactas.",
    price: 28500,
    weightGrams: 750,
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-15"
  },
  {
    id: "prod-002",
    name: "Enterito Jardinero Corduroy Mostaza",
    category: "ninos",
    subCategory: "Bebés & Niños",
    gender: "unisex",
    condition: "10/10 (Sin uso con etiqueta)",
    size: "Talle 2 (24 Meses)",
    measurements: {
      sisa: "31 cm",
      largo: "68 cm",
      tiro: "24 cm",
      cintura: "33 cm"
    },
    description: "Pana acanalada suave color mostaza cálido. Broches metálicos ajustables en tirantes y broches en entrepierna para fácil cambiado.",
    price: 17500,
    weightGrams: 300,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-20"
  },
  {
    id: "prod-003",
    name: "Buzo Hoodie Oversize Washed Lilac",
    category: "adultos",
    subCategory: "Buzos & Hoodies",
    gender: "unisex",
    condition: "9/10 (Excelente)",
    size: "Talle L",
    measurements: {
      sisa: "60 cm",
      largo: "68 cm",
      manga: "57 cm",
      hombros: "52 cm"
    },
    description: "Algodón frizado grueso de alta densidad con teñido pigmentario efecto lavado. Capucha doble forrada y bolsillo canguro.",
    price: 24900,
    weightGrams: 620,
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-18"
  },
  {
    id: "prod-004",
    name: "Vestidito Broderie Algodón Orgánico",
    category: "ninos",
    subCategory: "Niñas",
    gender: "nena",
    condition: "9/10 (Excelente)",
    size: "Talle 4",
    measurements: {
      sisa: "33 cm",
      largo: "55 cm",
      hombros: "26 cm"
    },
    description: "Confección artesanal en broderie 100% algodón crudo. Forrería interna de batista suave para pieles sensibles.",
    price: 16200,
    weightGrams: 220,
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-22"
  },
  {
    id: "prod-005",
    name: "Pantalón Cargo Streetwear Khaki",
    category: "adultos",
    subCategory: "Pantalones",
    gender: "hombre",
    condition: "8/10 (Muy bueno)",
    size: "Talle 40 (M)",
    measurements: {
      cintura: "40 cm",
      largo: "102 cm",
      tiro: "31 cm",
      bota: "21 cm"
    },
    description: "Gabardina esmerilada resistente con 6 bolsillos utilitarios. Ajuste regulable en tobillos con cordón elástico.",
    price: 26000,
    weightGrams: 550,
    image: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-10"
  },
  {
    id: "prod-006",
    name: "Campera Rompevientos Colorblock Retro",
    category: "ninos",
    subCategory: "Niños & Niñas",
    gender: "nene",
    condition: "9/10 (Excelente)",
    size: "Talle 6",
    measurements: {
      sisa: "42 cm",
      largo: "48 cm",
      manga: "40 cm"
    },
    description: "Microfibra deportiva impermeable estilo 90s con paneles en azul marino, verde y amarillo. Cierres YKK originales.",
    price: 21800,
    weightGrams: 280,
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-24"
  },
  {
    id: "prod-007",
    name: "Tapado Paño Tweed Camel Vintage",
    category: "adultos",
    subCategory: "Abrigos",
    gender: "mujer",
    condition: "10/10 (Como nuevo)",
    size: "Talle L",
    measurements: {
      sisa: "56 cm",
      largo: "92 cm",
      manga: "61 cm",
      hombros: "46 cm"
    },
    description: "Prenda de sastrería de alta gama con mezcla de lana natural en espiguilla tono camel. Forro de seda en excelente conservación.",
    price: 42000,
    weightGrams: 1100,
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-05"
  },
  {
    id: "prod-008",
    name: "Suéter Tejido Jacquard Nórdico",
    category: "ninos",
    subCategory: "Tejidos",
    gender: "unisex",
    condition: "10/10 (Como nuevo)",
    size: "Talle 8",
    measurements: {
      sisa: "40 cm",
      largo: "50 cm",
      manga: "44 cm"
    },
    description: "Hilado de dralón suave hipoalergénico que no pica. Motivo tradicional nórdico en tonos crudo, tierra y gris.",
    price: 19400,
    weightGrams: 350,
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca56a?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-19"
  },
  {
    id: "prod-009",
    name: "Remera Boxy Fit Gráfica Indie",
    category: "adultos",
    subCategory: "Remeras",
    gender: "hombre",
    condition: "9/10 (Excelente)",
    size: "Talle XL",
    measurements: {
      sisa: "60 cm",
      largo: "74 cm",
      manga: "23 cm"
    },
    description: "Jersey pesado 24/1 teñido con grafismo vintage de banda indie. Cuello rib grueso cerrado.",
    price: 15500,
    weightGrams: 260,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-25"
  },
  {
    id: "prod-010",
    name: "Salopette Denim Algodón Soft",
    category: "ninos",
    subCategory: "Bebés",
    gender: "unisex",
    condition: "10/10 (Como nuevo)",
    size: "Talle 12-18M",
    measurements: {
      sisa: "29 cm",
      largo: "60 cm",
      tiro: "22 cm"
    },
    description: "Denim elastizado extra suave lavado al agua. Tiradores elásticos y detalles de pespuntes contrastantes.",
    price: 18000,
    weightGrams: 240,
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80",
    isSinglePiece: true,
    available: true,
    createdAt: "2026-10-27"
  }
];
