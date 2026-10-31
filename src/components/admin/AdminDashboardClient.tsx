'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Coins,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import type { Product, QuoteOrder } from '@/lib/types';
import { AdminMetricsModule } from './AdminMetricsModule';

export function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Exchange Rate State
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [lastUpdatedStr, setLastUpdatedStr] = useState<string>('');
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, rateRes, quotesRes] = await Promise.all([
        fetch('/api/products?includeInactive=true&t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/exchange-rate?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/quotes?t=' + Date.now(), { cache: 'no-store' })
      ]);

      const prodData = await prodRes.json();
      const rateData = await rateRes.json();
      const quotesData = await quotesRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (quotesData.success && Array.isArray(quotesData.data)) setOrders(quotesData.data);
      if (rateData.success && rateData.data) {
        const r = Number(rateData.data.exchangeRate) || 6.96;
        setExchangeRate(r);
        setAutoUpdate(rateData.data.autoUpdate !== false);

        const raw = rateData.data.lastChecked || rateData.data.updatedAt;
        const d = raw ? new Date(raw) : new Date();
        const dStr = d.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const tStr = d.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        setLastUpdatedStr(`${dStr} ${tStr}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error al sincronizar métricas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshExchangeRate = async () => {
    setIsRefreshingRate(true);
    try {
      const res = await fetch(`/api/exchange-rate?refresh=true&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newRate = Number(json.data.exchangeRate) || 6.96;
        setExchangeRate(newRate);
        setAutoUpdate(json.data.autoUpdate !== false);

        const now = new Date();
        const fullTimestamp = `${now.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })} ${now.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}`;
        setLastUpdatedStr(fullTimestamp);

        showToast(`Tipo de cambio actualizado: 1 USD = Bs. ${newRate.toFixed(2)} (${fullTimestamp})`);
      } else {
        showToast(json.error || 'No se pudo actualizar el tipo de cambio', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar el tipo de cambio', 'error');
    } finally {
      setIsRefreshingRate(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${toast.type === 'success'
            ? 'bg-[#161311] text-[#D4A359] border-[#D4A359]/40'
            : 'bg-red-950 text-red-200 border-red-800'
            }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Panel de Control Hobby Bolivia
          </h1>
          <p className="text-xs sm:text-sm text-[#8C827A] mt-0.5">
            Métricas de ingresos, pedidos y logística · Almacén Central La Paz
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Quick Currency Status */}
          <button
            type="button"
            onClick={handleRefreshExchangeRate}
            disabled={isRefreshingRate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF8F5] hover:bg-white active:scale-[0.98] text-[#1A1817] font-bold text-xs border border-[#E2DCD3] hover:border-[#D4A359] shadow-xs transition-all cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed select-none whitespace-nowrap shrink-0"
            title={`Clic para actualizar el tipo de cambio oficial ahora. Última actualización: ${lastUpdatedStr || 'reciente'}`}
          >
            {isRefreshingRate ? (
              <Loader2 className="w-4 h-4 text-[#D4A359] animate-spin shrink-0" />
            ) : (
              <Coins className="w-4 h-4 text-[#D4A359] shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span>
              TC Oficial{lastUpdatedStr ? ` (${lastUpdatedStr})` : ''}:
            </span>
            <span className="font-mono font-black text-[#1A1817]">
              Bs. {exchangeRate.toFixed(2)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] font-mono font-bold">
              {autoUpdate ? 'Auto' : 'Manual'}
            </span>
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#D4A359] transition-colors shrink-0 ${isRefreshingRate ? 'animate-spin text-[#D4A359]' : 'group-hover:rotate-180 transition-transform duration-500'
                }`}
            />
          </button>

          {/* Ver Tienda Pública al lado derecho después de TC Oficial */}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF8F5] text-[#1A1817] hover:text-[#D4A359] font-bold text-xs border border-[#E2DCD3] hover:border-[#D4A359] shadow-xs transition-all whitespace-nowrap shrink-0"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>
        </div>
      </div>

      {/* Main Metrics Content */}
      {loading && orders.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#D4A359] animate-spin" />
          <span className="text-xs text-[#8C827A] font-semibold">
            Cargando análisis de ventas y reportes comerciales...
          </span>
        </div>
      ) : (
        <AdminMetricsModule
          orders={orders}
          products={products}
          exchangeRate={exchangeRate}
          lastUpdatedStr={lastUpdatedStr}
          onRefreshRate={handleRefreshExchangeRate}
          isRefreshingRate={isRefreshingRate}
        />
      )}
    </div>
  );
}
