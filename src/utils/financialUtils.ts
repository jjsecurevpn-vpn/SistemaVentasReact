/**
 * Utilidades para cálculos financieros
 * Centralizamos toda la lógica de cálculo de ganancias, márgenes, etc.
 */

/**
 * Calcula la ganancia de un producto
 * @param precioVenta - Precio al que se vende el producto
 * @param precioCompra - Precio al que se compró el producto (costo)
 * @returns La ganancia por unidad
 */
export const calcularGanancia = (precioVenta: number, precioCompra: number | null | undefined): number => {
  return precioVenta - (precioCompra || 0);
};

/**
 * Calcula el margen de ganancia en porcentaje
 * @param precioVenta - Precio al que se vende el producto
 * @param precioCompra - Precio al que se compró el producto (costo)
 * @returns El porcentaje de margen, o null si no hay precio de compra
 */
export const calcularMargen = (precioVenta: number, precioCompra: number | null | undefined): number | null => {
  if (!precioCompra || precioCompra === 0) return null;
  const ganancia = calcularGanancia(precioVenta, precioCompra);
  return (ganancia / precioCompra) * 100;
};

/**
 * Calcula la ganancia total de una venta
 * @param subtotal - Monto total de la venta (precio × cantidad)
 * @param precioCompra - Precio de compra por unidad
 * @param cantidad - Cantidad vendida
 * @returns La ganancia total de la venta
 */
export const calcularGananciaVenta = (
  subtotal: number,
  precioCompra: number | null | undefined,
  cantidad: number
): number => {
  return subtotal - ((precioCompra || 0) * cantidad);
};

/**
 * Formatea un número como porcentaje
 * @param valor - Número a formatear
 * @param decimales - Cantidad de decimales (default: 0)
 * @returns String formateado como porcentaje
 */
export const formatearPorcentaje = (valor: number | null, decimales: number = 0): string => {
  if (valor === null) return '-';
  return `${valor.toFixed(decimales)}%`;
};

/**
 * Determina el color CSS basado en si la ganancia es positiva, negativa o cero
 * @param ganancia - Valor de la ganancia
 * @returns Clase CSS de Tailwind para el color
 */
export const getGananciaColorClass = (ganancia: number): string => {
  if (ganancia > 0) return 'text-emerald-400';
  if (ganancia < 0) return 'text-red-400';
  return 'text-neutral-400';
};
