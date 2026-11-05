export interface CategoryConfig {
  id: string;
  label: string;
  badgeLabel: string;
  description: string;
  subcategories: string[];
  genders: { id: string; label: string }[];
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  adultos: {
    id: 'adultos',
    label: 'Ropa para adultos',
    badgeLabel: 'Adultos',
    description: 'Prendas seleccionadas vintage y segunda mano para adultos.',
    subcategories: [
      'Camperas & Abrigos',
      'Buzos & Hoodies',
      'Pantalones & Jeans',
      'Remeras & Tops',
      'Camisas & Blusas',
      'Vestidos & Faldas',
      'Tejidos & Sweaters',
      'Calzado',
      'Blazers & Sastrería'
    ],
    genders: [
      { id: 'mujer', label: 'Mujer' },
      { id: 'hombre', label: 'Hombre' },
      { id: 'unisex', label: 'Unisex' }
    ]
  },
  ninos: {
    id: 'ninos',
    label: 'Ropa para niños',
    badgeLabel: 'Niños & Bebés',
    description: 'Prendas y calzado para bebés, nenas y nenes en excelente estado.',
    subcategories: [
      'Bebés & Bodys',
      'Jardineros & Enteritos',
      'Camperas & Abrigos',
      'Buzos & Conjuntos',
      'Remeras & Chombas',
      'Pantalones & Shorts',
      'Vestidos & Faldas',
      'Tejidos & Saquitos',
      'Calzado Infantil'
    ],
    genders: [
      { id: 'nena', label: 'Nena' },
      { id: 'nene', label: 'Nene' },
      { id: 'unisex', label: 'Unisex' }
    ]
  },
  accesorios: {
    id: 'accesorios',
    label: 'Accesorios & Otros',
    badgeLabel: 'Accesorios',
    description: 'Gorras, bolsos, cinturones, bufandas y complementos vintage.',
    subcategories: [
      'Gorras & Sombreros',
      'Bolsos & Mochilas',
      'Cinturones & Marroquinería',
      'Bufandas & Pañuelos',
      'Joyería & Relojes',
      'Gafas de Sol'
    ],
    genders: [
      { id: 'unisex', label: 'Unisex' },
      { id: 'mujer', label: 'Mujer' },
      { id: 'hombre', label: 'Hombre' }
    ]
  }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
