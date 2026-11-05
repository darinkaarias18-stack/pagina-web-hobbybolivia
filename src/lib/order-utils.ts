import type { QuoteOrder } from './types';

/**
 * Calcula los totales reales en USD y Bolivianos (BOB) de un pedido,
 * leyendo los precios unitarios de cada producto en items_json con
 * sincronización al tipo de cambio oficial del catálogo.
 */
export function getOrderAmounts(order: QuoteOrder, currentRate: number = 12.10): { usd: number; bob: number } {
  const rate = currentRate > 0 ? currentRate : 12.10;
  let totalUsd = 0;
  let totalBob = 0;

  if (Array.isArray(order.items) && order.items.length > 0) {
    for (const it of order.items) {
      const prod = it.item || (it as any);
      const qty = Number(it.quantity) || 1;
      const itemUsd = Number(prod?.priceUsd ?? prod?.price_usd);
      const itemBob = Number(prod?.price);

      if (!isNaN(itemUsd) && itemUsd > 0) {
        totalUsd += itemUsd * qty;
        totalBob += (itemBob > 0 ? itemBob : itemUsd * rate) * qty;
      } else if (!isNaN(itemBob) && itemBob > 0) {
        totalBob += itemBob * qty;
        totalUsd += (itemBob / rate) * qty;
      }
    }
  }

  // Fallback si no hay items detallados o estructura vacía
  if (totalUsd === 0 && totalBob === 0) {
    const raw = Number(order.total) || 0;
    totalBob = raw;
    totalUsd = rate > 0 ? raw / rate : raw;
  }

  return {
    usd: Number(totalUsd.toFixed(2)),
    bob: Number(totalBob.toFixed(2))
  };
}

