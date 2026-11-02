'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type CurrencyMode = 'USD' | 'Bs.' | 'auto' | 'ALL_USD' | 'ALL_BS' | 'BY_PRODUCT';

export interface CurrencyContextType {
  currency: string;
  currencyMode: CurrencyMode;
  isBsMode: boolean;
  isUsdMode: boolean;
  currencyLabel: string;
  currencySymbol: string;
  setCurrencyMode: (mode: CurrencyMode) => Promise<void>;
  formatPrice: (priceUsd?: number | null, priceBob?: number | null) => string;
}

const defaultContext: CurrencyContextType = {
  currency: 'USD',
  currencyMode: 'USD',
  isBsMode: false,
  isUsdMode: true,
  currencyLabel: 'USD',
  currencySymbol: '$',
  setCurrencyMode: async () => {},
  formatPrice: (priceUsd, priceBob) => {
    const val = priceUsd ?? priceBob ?? 0;
    return `$${Number(val).toFixed(2)} USD`;
  }
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<string>('USD');

  // Cargar configuración de moneda al montar
  useEffect(() => {
    fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.currency) {
          setCurrency(data.data.currency);
        }
      })
      .catch(() => {});

    // Escuchar cambios de configuración en tiempo real
    const handleConfigEvent = (e: any) => {
      const config = e?.detail || e;
      if (config?.currency) {
        setCurrency(config.currency);
      }
    };
    window.addEventListener('hb_config_updated', handleConfigEvent);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('hb_catalog_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CONFIG_UPDATED' && event.data?.config?.currency) {
          setCurrency(event.data.config.currency);
        }
      };
    } catch {}

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'hb_config_sync' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.config?.currency) {
            setCurrency(parsed.config.currency);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('hb_config_updated', handleConfigEvent);
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
  }, []);

  const isBsMode = currency === 'Bs.' || currency === 'BOB' || currency === 'ALL_BS';
  const isUsdMode = !isBsMode;

  const setCurrencyMode = useCallback(async (mode: CurrencyMode) => {
    const normalized = mode === 'ALL_BS' ? 'Bs.' : (mode === 'ALL_USD' ? 'USD' : (mode === 'BY_PRODUCT' ? 'auto' : mode));
    setCurrency(normalized);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: normalized })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          const ch = new BroadcastChannel('hb_catalog_channel');
          ch.postMessage({ type: 'CONFIG_UPDATED', config: data.data });
          ch.close();
        } catch {}
        try {
          localStorage.setItem('hb_config_sync', JSON.stringify({ config: data.data, t: Date.now() }));
          window.dispatchEvent(new CustomEvent('hb_config_updated', { detail: data.data }));
        } catch {}
      }
    } catch (err) {
      console.error('Error saving currency mode:', err);
    }
  }, []);

  // Formato estricto a criterio: NUNCA aplica cálculos matemáticos de tipo de cambio
  const formatPrice = useCallback((priceUsd?: number | null, priceBob?: number | null): string => {
    if (isBsMode) {
      const val = priceBob !== undefined && priceBob !== null && Number(priceBob) > 0
        ? Number(priceBob)
        : Number(priceUsd ?? 0);
      return `Bs. ${val.toFixed(2)}`;
    } else {
      const val = priceUsd !== undefined && priceUsd !== null && Number(priceUsd) > 0
        ? Number(priceUsd)
        : Number(priceBob ?? 0);
      return `$${val.toFixed(2)} USD`;
    }
  }, [isBsMode]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyMode: currency as CurrencyMode,
        isBsMode,
        isUsdMode,
        currencyLabel: isBsMode ? 'Bs.' : 'USD',
        currencySymbol: isBsMode ? 'Bs.' : '$',
        setCurrencyMode,
        formatPrice
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext);
  return context || defaultContext;
}

