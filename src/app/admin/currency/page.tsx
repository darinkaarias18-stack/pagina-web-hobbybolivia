'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  DollarSign,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Globe,
  ArrowLeftRight,
  Save,
  Sliders,
  Check,
  ExternalLink
} from 'lucide-react';
import type { ExchangeRateConfig } from '@/lib/types';

export default function CurrencySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ExchangeRateConfig>({
    exchangeRate: 6.96,
    autoUpdate: true,
    source: 'API Oficial',
    lastChecked: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Local Form State
  const [rateInput, setRateInput] = useState('6.96');
  const [autoUpdateInput, setAutoUpdateInput] = useState(true);
  const [cacheHours, setCacheHours] = useState<number>(24);

  // Live Calculator State
  const [calcUsd, setCalcUsd] = useState<string>('50');
  const [calcBob, setCalcBob] = useState<string>('348');

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Exchange Rate from API
  const fetchRateConfig = async (refresh = false) => {
    if (refresh) setSyncing(true);
    else setLoading(true);

    try {
      const url = `/api/exchange-rate${refresh ? '?refresh=true' : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();

      if (json.success && json.data) {
        setConfig(json.data);
        setRateInput(String(json.data.exchangeRate));
        setAutoUpdateInput(Boolean(json.data.autoUpdate));
        if (json.data.cacheExpiresInHours !== undefined) {
          setCacheHours(json.data.cacheExpiresInHours);
        }

        // Update live calculator with active rate
        const rate = Number(json.data.exchangeRate) || 6.96;
        setCalcBob((50 * rate).toFixed(2));

        if (refresh) {
          showToast(`¡Tasa sincronizada con éxito: 1 USD = Bs. ${json.data.exchangeRate}!`);
        }
      } else {
        showToast(json.error || 'No se pudo obtener el tipo de cambio', 'error');
      }
    } catch (err: any) {
      showToast('Error de red al conectar con el servicio de tipo de cambio', 'error');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchRateConfig();
  }, []);

  // Save changes to API
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    const parsedRate = parseFloat(rateInput);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      showToast('Por favor introduce un valor numérico válido mayor a 0', 'error');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchangeRate: parsedRate,
          autoUpdate: autoUpdateInput,
          source: autoUpdateInput ? 'API Oficial' : 'Manual (Administrador)'
        })
      });

      const json = await res.json();
      if (json.success) {
        setConfig(json.data);
        setRateInput(String(json.data.exchangeRate));
        setAutoUpdateInput(json.data.autoUpdate);
        showToast('Configuración del tipo de cambio guardada correctamente');
      } else {
        showToast(json.error || 'Error al guardar los cambios', 'error');
      }
    } catch {
      showToast('Error de conexión al guardar los ajustes', 'error');
    } finally {
      setSaving(false);
    }
  };



  // Recalculate converter
  const handleUsdChange = (val: string) => {
    setCalcUsd(val);
    const num = parseFloat(val) || 0;
    const currentRate = parseFloat(rateInput) || config.exchangeRate || 6.96;
    setCalcBob((num * currentRate).toFixed(2));
  };

  const handleBobChange = (val: string) => {
    setCalcBob(val);
    const num = parseFloat(val) || 0;
    const currentRate = parseFloat(rateInput) || config.exchangeRate || 6.96;
    setCalcUsd((num / currentRate).toFixed(2));
  };

  // Format dates
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Reciente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F85606] animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Configuración Monetaria · E-Commerce
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Tipo de Cambio Oficial (USD / BOB)
          </h1>
          <p className="text-xs text-[#5C5650] mt-0.5 max-w-2xl">
            Control automático y manual de paridad monetaria para cálculo de costos de importación y conversión de precios en Bolivianos.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Volver al Dashboard</span>
          </Link>

          <button
            onClick={() => fetchRateConfig(true)}
            disabled={syncing || loading}
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#161311] ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar con API'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Tasa Activa Actual */}
        <div className="bg-[#161311] text-[#FAF8F5] p-5 sm:p-6 rounded-3xl border border-[#2D2622] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-[#D4A359]/20 border border-[#D4A359]/40 text-[#D4A359]">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
              config.autoUpdate 
                ? 'bg-[#3E7B44]/30 text-[#78C47F] border border-[#3E7B44]'
                : 'bg-[#C69755]/30 text-[#D4A359] border border-[#C69755]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.autoUpdate ? 'bg-[#78C47F] animate-pulse' : 'bg-[#D4A359]'}`} />
              {config.autoUpdate ? 'Actualización Auto' : 'Fijado Manual'}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#A89F91] uppercase tracking-wider">
              Tasa Oficial Activa en Tienda
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#D4A359] tracking-tight mt-1 flex items-baseline gap-2">
              <span>Bs. {config.exchangeRate.toFixed(2)}</span>
              <span className="text-xs text-[#A89F91] font-normal">/ 1 USD</span>
            </div>
            <p className="text-[11px] text-[#A89F91] mt-1.5 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#D4A359]" />
              <span>Fuente: <strong>{config.source || 'API Oficial'}</strong></span>
            </p>
          </div>
        </div>

        {/* Card 2: Cronograma de Sincronización */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-[#F5F2EB] border border-[#E2DCD3] text-[#F85606]">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#8C827A] uppercase tracking-wider">
              Caché 24 Horas
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
              Última Sincronización
            </span>
            <div className="text-base sm:text-lg font-black text-[#1A1817] mt-1">
              {formatDateTime(config.lastChecked || config.updatedAt)}
            </div>
            <p className="text-[11px] text-[#5C5650] mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#3E7B44]" />
              <span>{config.autoUpdate ? `Próxima revalidación en aprox. ${cacheHours}h` : 'Modo manual activo sin revalidación'}</span>
            </p>
          </div>
        </div>

        {/* Card 3: Equivalencia de Prueba */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E2DCD3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-[#F5F2EB] border border-[#E2DCD3] text-[#3E7B44]">
              <Coins className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-[#3E7B44] uppercase tracking-wider bg-[#3E7B44]/10 px-2 py-0.5 rounded-full">
              Conversión Referencial
            </span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#8C827A] uppercase tracking-wider">
              Ejemplo Referencial (10 USD)
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#1A1817] mt-1">
              Bs. {(10 * config.exchangeRate).toFixed(2)}
            </div>
            <p className="text-[11px] text-[#5C5650] mt-1.5">
              100 USD = Bs. {(100 * config.exchangeRate).toFixed(2)}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Management Form & Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Switch (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E2DCD3] p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[#E8E2D8]">
            <div className="p-2 bg-[#161311] text-[#D4A359] rounded-xl">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1A1817]">
                Ajustes del Tipo de Cambio
              </h2>
              <p className="text-xs text-[#5C5650]">
                Configura si la tasa se actualiza automáticamente o si prefieres aplicar un valor manual fijo.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Switch de Actualización Automática */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] flex items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#1A1817]">
                    Actualización Automática vía API Oficial
                  </span>
                  {autoUpdateInput && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#3E7B44] text-white">
                      Activo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5C5650] max-w-lg leading-relaxed">
                  Consulta de forma transparente los servicios oficiales de tipo de cambio cada 24 horas. Evita saturar el servidor mediante un sistema de caché inteligente.
                </p>
              </div>

              {/* Modern Switch Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={autoUpdateInput}
                onClick={async () => {
                  const nextVal = !autoUpdateInput;
                  setAutoUpdateInput(nextVal);
                  try {
                    const res = await fetch('/api/exchange-rate', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        autoUpdate: nextVal,
                        source: nextVal ? 'API Oficial' : 'Manual (Administrador)'
                      })
                    });
                    const json = await res.json();
                    if (json.success && json.data) {
                      setConfig(json.data);
                      showToast(nextVal ? 'Sincronización automática activada con éxito' : 'Modo manual fijado con éxito');
                    }
                  } catch {
                    showToast('Error al actualizar estado de sincronización', 'error');
                  }
                }}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoUpdateInput ? 'bg-[#3E7B44]' : 'bg-[#D1C9BE]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    autoUpdateInput ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 2. Campo Manual de Tasa de Cambio */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#1A1817] mb-2">
                Tasa de Cambio Manual (1 USD en Bolivianos - BOB)
              </label>

              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-[#D4A359] text-base">
                  Bs.
                </span>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={rateInput}
                  onChange={(e) => {
                    setRateInput(e.target.value);
                    const usdNum = parseFloat(calcUsd) || 0;
                    const r = parseFloat(e.target.value) || 0;
                    setCalcBob((usdNum * r).toFixed(2));
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-lg font-black text-[#1A1817] focus:border-[#D4A359] focus:bg-white outline-none transition-all"
                  placeholder="6.96"
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
              <span className="text-xs text-[#8C827A]">
                Los cambios se aplican de forma inmediata en la web.
              </span>

              <button
                type="submit"
                disabled={saving}
                className="px-7 py-3 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Live Calculator & API Info (1 col) */}
        <div className="space-y-6">
          
          {/* Calculadora en Vivo */}
          <div className="bg-[#161311] text-[#FAF8F5] p-6 rounded-3xl border border-[#2D2622] shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2D2622]">
              <ArrowLeftRight className="w-4 h-4 text-[#D4A359]" />
              <h3 className="font-black text-sm tracking-tight text-[#FAF8F5]">
                Simulador de Conversión en Vivo
              </h3>
            </div>

            <p className="text-xs text-[#A89F91] mb-4">
              Comprueba cómo se calculan los precios con la tasa configurada (1 USD = Bs. {parseFloat(rateInput) || config.exchangeRate}).
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A359] mb-1">
                  Monto en Dólares ($us)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono text-[#A89F91]">$us</span>
                  <input
                    type="number"
                    step="0.01"
                    value={calcUsd}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#211E1C] border border-[#3D352E] rounded-xl text-sm font-black text-[#FAF8F5] focus:border-[#D4A359] outline-none"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-[#211E1C] border border-[#3D352E] text-[#D4A359] flex items-center justify-center text-xs">
                  ⇅
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A359] mb-1">
                  Equivalente en Bolivianos (Bs.)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono text-[#D4A359]">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={calcBob}
                    onChange={(e) => handleBobChange(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-[#211E1C] border border-[#3D352E] rounded-xl text-sm font-black text-[#D4A359] focus:border-[#D4A359] outline-none"
                    placeholder="348"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2D2622] text-[11px] text-[#A89F91] text-center">
              Fórmula: <code>Precio en Bs. = USD × {parseFloat(rateInput) || config.exchangeRate}</code>
            </div>
          </div>

          {/* Tarjeta de Especificación Técnica */}
          <div className="bg-white p-6 rounded-3xl border border-[#E2DCD3] shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1817] mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#F85606]" />
              <span>Endpoints & Módulo Técnico</span>
            </h4>
            
            <p className="text-xs text-[#5C5650] leading-relaxed mb-3">
              Puedes consultar la tasa oficial programáticamente desde cualquier vista o componente:
            </p>

            <div className="bg-[#161311] text-[#FAF8F5] p-3 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1">
              <div className="text-[#D4A359]"># Endpoint público JSON:</div>
              <div>GET /api/exchange-rate</div>
              <div className="text-[#78C47F]"># Helper en TypeScript:</div>
              <div>import &#123; convertUsdToBob &#125; from &apos;@/lib/exchange-rate&apos;;</div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
