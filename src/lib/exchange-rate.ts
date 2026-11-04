/**
 * Módulo de Tipo de Cambio Oficial (USD a BOB) para Hobby Bolivia
 * 
 * Gestiona la sincronización automática vía API pública con caché de 24 horas,
 * persistencia dual (MySQL + Local JSON), soporte de override manual y
 * utilidades de cálculo de conversión de moneda.
 */

import { getExchangeRateDb, saveExchangeRateDb } from './db';
import type { ExchangeRateConfig } from './types';

// Tasa oficial de referencia por defecto (Banco Central de Bolivia)
export const DEFAULT_EXCHANGE_RATE = 6.96;

// Duración de la caché en milisegundos: 24 horas (revalidación una vez al día)
export const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

// Endpoints de APIs públicas oficiales para conversión USD -> BOB
const PRIMARY_API_URL = 'https://open.er-api.com/v6/latest/USD';
const FALLBACK_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

/**
 * Consulta la API pública externa con timeout y fallback para obtener la tasa oficial USD -> BOB
 */
export async function fetchLiveExchangeRate(): Promise<{ rate: number; source: string } | null> {
  // 1. Intentar API Primaria (Open ExchangeRate API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(PRIMARY_API_URL, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.rates?.BOB);
      if (rate && !isNaN(rate) && rate > 0) {
        return {
          rate: Number(rate.toFixed(4)),
          source: 'ExchangeRate-API (Oficial)'
        };
      }
    }
  } catch (err: any) {
    console.warn('[Exchange Rate API]: Falló API primaria:', err?.message || err);
  }

  // 2. Intentar API de Respaldo
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(FALLBACK_API_URL, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.rates?.BOB);
      if (rate && !isNaN(rate) && rate > 0) {
        return {
          rate: Number(rate.toFixed(4)),
          source: 'ExchangeRate-API v4 (Respaldo)'
        };
      }
    }
  } catch (err: any) {
    console.warn('[Exchange Rate API]: Falló API de respaldo:', err?.message || err);
  }

  return null;
}

/**
 * Obtiene la configuración de tipo de cambio activa.
 * Responde inmediatamente con la tasa en base de datos para no bloquear la carga de la página.
 */
export async function getExchangeRateConfig(forceRefresh = false): Promise<ExchangeRateConfig> {
  const current = await getExchangeRateDb();

  // Si autoUpdate está desactivado (modo manual), respetar la tasa manual sin consultar la API
  if (!current.autoUpdate && !forceRefresh) {
    return current;
  }

  const lastCheckedTime = current.lastChecked ? new Date(current.lastChecked).getTime() : 0;
  const isCacheExpired = Date.now() - lastCheckedTime > CACHE_DURATION_MS;

  // Si la tasa en DB es válida y no se fuerza una actualización manual explícita, devolver de inmediato
  if (!forceRefresh) {
    if (isCacheExpired) {
      // Revalidación asíncrona en segundo plano sin retrasar al usuario
      fetchLiveExchangeRate().then(live => {
        if (live) {
          saveExchangeRateDb({
            exchangeRate: live.rate,
            source: live.source,
            lastChecked: new Date().toISOString()
          }).catch(() => {});
        }
      }).catch(() => {});
    }
    return current;
  }

  // Si se solicita forceRefresh explícito desde el panel
  const live = await fetchLiveExchangeRate();
  if (live) {
    const updated = await saveExchangeRateDb({
      exchangeRate: live.rate,
      source: live.source,
      lastChecked: new Date().toISOString()
    });
    return updated;
  }

  return current;
}

/**
 * Obtiene directamente el valor numérico de la tasa activa
 */
export async function getActiveExchangeRate(forceRefresh = false): Promise<number> {
  const config = await getExchangeRateConfig(forceRefresh);
  return config.exchangeRate || DEFAULT_EXCHANGE_RATE;
}

/**
 * Sobrescribe manualmente el tipo de cambio fijado por el administrador
 */
export async function setManualExchangeRate(rate: number): Promise<ExchangeRateConfig> {
  if (rate <= 0 || isNaN(rate)) {
    throw new Error('La tasa de cambio debe ser un número positivo mayor a 0');
  }

  return saveExchangeRateDb({
    exchangeRate: Number(rate.toFixed(4)),
    autoUpdate: false,
    source: 'Manual (Administrador)',
    lastChecked: new Date().toISOString()
  });
}

/**
 * Activa o desactiva la actualización automática vía API
 */
export async function setAutoUpdate(enabled: boolean): Promise<ExchangeRateConfig> {
  if (enabled) {
    const live = await fetchLiveExchangeRate();
    return saveExchangeRateDb({
      autoUpdate: true,
      exchangeRate: live ? live.rate : undefined,
      source: live ? live.source : 'API Oficial',
      lastChecked: new Date().toISOString()
    });
  } else {
    return saveExchangeRateDb({
      autoUpdate: false,
      source: 'Manual (Fijado)'
    });
  }
}

/**
 * Actualiza la configuración de moneda
 */
export async function updateExchangeRateConfig(updates: {
  exchangeRate?: number;
  autoUpdate?: boolean;
  source?: string;
}): Promise<ExchangeRateConfig> {
  if (updates.exchangeRate !== undefined) {
    if (updates.exchangeRate <= 0 || isNaN(updates.exchangeRate)) {
      throw new Error('La tasa de cambio debe ser un número válido mayor a 0');
    }
  }

  return saveExchangeRateDb({
    exchangeRate: updates.exchangeRate !== undefined ? Number(updates.exchangeRate.toFixed(4)) : undefined,
    autoUpdate: updates.autoUpdate,
    source: updates.source,
    lastChecked: new Date().toISOString()
  });
}

/**
 * Convierte un monto en Dólares (USD) a Bolivianos (BOB)
 * @param amountUsd Monto base en USD
 * @param exchangeRate Tasa opcional (si no se pasa, utiliza DEFAULT_EXCHANGE_RATE)
 * @returns Monto calculado en BOB redondeado a 2 decimales
 */
export function convertUsdToBob(amountUsd: number, exchangeRate: number = DEFAULT_EXCHANGE_RATE): number {
  if (!amountUsd || isNaN(amountUsd)) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_EXCHANGE_RATE;
  return Number((amountUsd * rate).toFixed(2));
}

/**
 * Convierte un monto en Bolivianos (BOB) a Dólares (USD)
 * @param amountBob Monto en Bolivianos
 * @param exchangeRate Tasa opcional
 * @returns Monto en USD redondeado a 2 decimales
 */
export function convertBobToUsd(amountBob: number, exchangeRate: number = DEFAULT_EXCHANGE_RATE): number {
  if (!amountBob || isNaN(amountBob)) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : DEFAULT_EXCHANGE_RATE;
  return Number((amountBob / rate).toFixed(2));
}

/**
 * Formatea un monto en Bolivianos (ej. "Bs. 120,50")
 */
export function formatBob(amount: number): string {
  return `Bs. ${Number(amount || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Formatea un monto en Dólares (ej. "$us 15.00")
 */
export function formatUsd(amount: number): string {
  return `$us ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
