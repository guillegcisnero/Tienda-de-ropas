/**
 * Formateador de moneda singleton para evitar recrear instancias de Intl.NumberFormat en cada render
 */
const currencyFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

export const formatPrice = (val: number): string => {
  return currencyFormatter.format(val);
};
