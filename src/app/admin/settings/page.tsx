'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Image as ImageIcon,
  Layout,
  Save,
  Loader2,
  Sparkles,
  Eye,
  QrCode,
  Plane,
  ArrowLeftRight,
  ExternalLink
} from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { SiteConfig } from '@/lib/types';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Business Identity
  const [companyName, setCompanyName] = useState('Hobby Bolivia');
  const [subtitle, setSubtitle] = useState('Aeromodelismo & R/C');
  const [currency, setCurrency] = useState('$us');
  const [whatsappNumber, setWhatsappNumber] = useState('+591 77293446');
  const [contactEmail, setContactEmail] = useState('contacto@hobbybolivia.com');
  const [topBarText, setTopBarText] = useState('Hobby Bolivia · Aeromodelismo y radio control en Bolivia | Envíos a todo el país');
  const [domain, setDomain] = useState('https://hobbybolivia.com');

  // 2. Web Images
  const [logoUrl, setLogoUrl] = useState('');

  // 3. Payment QR (QR Simple Bolivia)
  const [paymentQrUrl, setPaymentQrUrl] = useState('/images/payment/qr_simple_hobbybolivia.svg');
  const [paymentQrInstructions, setPaymentQrInstructions] = useState(
    'Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp.'
  );
  const [enablePaymentQr, setEnablePaymentQr] = useState(true);

  // 4. Theme Presets & Custom Colors
  const [themePreset, setThemePreset] = useState('ferreteria');
  const [primaryColor, setPrimaryColor] = useState('#e04f26');
  const [secondaryColor, setSecondaryColor] = useState('#162544');
  const [accentColor, setAccentColor] = useState('#2563eb');

  // 4. Catalog Layout Options
  const [cardStyle, setCardStyle] = useState<'with_button' | 'catalog_only'>('with_button');
  const [desktopColumns, setDesktopColumns] = useState<number>(6);
  const [showTopBar, setShowTopBar] = useState<boolean>(true);

  // Live Currency Calculator State
  const [exchangeRate, setExchangeRate] = useState<number>(11.997);
  const [rateDateStr, setRateDateStr] = useState<string>('');
  const [calcUsd, setCalcUsd] = useState<string>('50');
  const [calcBob, setCalcBob] = useState<string>('599.85');
  const [calcDirection, setCalcDirection] = useState<'USD_TO_BOB' | 'BOB_TO_USD'>('USD_TO_BOB');

  // 5. Policies
  const [termsPolicy, setTermsPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnsPolicy, setReturnsPolicy] = useState('');

  const handleUsdChange = (val: string) => {
    setCalcUsd(val);
    const num = parseFloat(val) || 0;
    const currentRate = exchangeRate || 11.997;
    setCalcBob((num * currentRate).toFixed(2));
  };

  const handleBobChange = (val: string) => {
    setCalcBob(val);
    const num = parseFloat(val) || 0;
    const currentRate = exchangeRate || 11.997;
    setCalcUsd((num / currentRate).toFixed(2));
  };

  useEffect(() => {
    setRateDateStr(
      new Date().toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    );

    fetch('/api/exchange-rate?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((rateJson) => {
        if (rateJson?.success && rateJson?.data?.exchangeRate) {
          const r = Number(rateJson.data.exchangeRate) || 11.997;
          setExchangeRate(r);
          setCalcBob((50 * r).toFixed(2));
          const raw = rateJson.data.lastChecked || rateJson.data.updatedAt;
          if (raw) {
            const d = new Date(raw);
            const dStr = d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const tStr = d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
            setRateDateStr(`${dStr} ${tStr}`);
          }
        }
      })
      .catch(() => { });

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const c: SiteConfig = data.data;
          setCompanyName(c.companyName || 'Hobby Bolivia');
          setSubtitle(c.subtitle || 'Repuestos y componentes de precisión para aeromodelismo & R/C');
          setCurrency(c.currency || 'Bs.');
          setWhatsappNumber(c.whatsappNumber || '+591 77293446');
          setContactEmail(c.contactEmail || 'contacto@hobbybolivia.com');
          setTopBarText(c.topBarText || 'Hobby Bolivia: Repuestos y componentes de precisión para aeromodelismo | Envíos a todo el país');
          setDomain(c.domain || 'https://hobbybolivia.com');

          setLogoUrl(c.logoUrl || '');

          setPaymentQrUrl(c.paymentQrUrl || '/images/payment/qr_simple_hobbybolivia.svg');
          setPaymentQrInstructions(
            c.paymentQrInstructions && !c.paymentQrInstructions.includes('Banco Unión')
              ? c.paymentQrInstructions
              : 'Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp.'
          );
          setEnablePaymentQr(c.enablePaymentQr !== false);

          setThemePreset(c.themePreset || 'warm-tech');
          setPrimaryColor(c.primaryColor || '#D4A359');
          setSecondaryColor(c.secondaryColor || '#161311');
          setAccentColor(c.accentColor || '#F85606');

          setCardStyle(c.cardStyle || 'with_button');
          setDesktopColumns(c.desktopColumns || 6);
          setShowTopBar(c.showTopBar !== false);

          setTermsPolicy(c.termsPolicy || '');
          setPrivacyPolicy(c.privacyPolicy || '');
          setShippingPolicy(c.shippingPolicy || '');
          setReturnsPolicy(c.returnsPolicy || '');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const broadcastConfigChange = (updatedConfig: SiteConfig) => {
    try {
      const channel = new BroadcastChannel('hb_catalog_channel');
      channel.postMessage({ type: 'CONFIG_UPDATED', config: updatedConfig });
      channel.close();
    } catch {
      // ignore
    }
    try {
      localStorage.setItem('hb_config_sync', JSON.stringify({ config: updatedConfig, t: Date.now() }));
      window.dispatchEvent(new CustomEvent('hb_config_updated', { detail: updatedConfig }));
    } catch {
      // ignore
    }
  };

  const handleInstantLogoUpdate = async (newLogoUrl: string) => {
    setLogoUrl(newLogoUrl);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: newLogoUrl.trim() || null })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        broadcastConfigChange(data.data);
        setSuccessMsg(
          newLogoUrl.trim()
            ? '¡Logotipo actualizado! Ya se muestra en la cabecera, pie de página y panel.'
            : 'Logotipo restaurado al ícono original de Hobby Bolivia.'
        );
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (e) {
      console.error('Error guardando logo:', e);
    }
  };

  const handleInstantQrUpdate = async (
    nextQrUrl: string = paymentQrUrl,
    nextInstructions: string = paymentQrInstructions,
    nextEnabled: boolean = enablePaymentQr
  ) => {
    setPaymentQrUrl(nextQrUrl);
    setPaymentQrInstructions(nextInstructions);
    setEnablePaymentQr(nextEnabled);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentQrUrl: nextQrUrl.trim() || null,
          paymentQrInstructions: nextInstructions.trim() || null,
          enablePaymentQr: nextEnabled
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        broadcastConfigChange(data.data);
        setSuccessMsg('¡Configuración de código QR actualizada y publicada en el carrito de compras!');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (e) {
      console.error('Error guardando QR:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      const payload = {
        companyName,
        subtitle,
        currency,
        whatsappNumber,
        contactEmail,
        topBarText,
        domain,
        logoUrl: logoUrl.trim() || null,
        heroBannerUrl: null,
        paymentQrUrl: paymentQrUrl.trim() || null,
        paymentQrInstructions: paymentQrInstructions.trim() || null,
        enablePaymentQr,
        themePreset,
        primaryColor,
        secondaryColor,
        accentColor,
        cardStyle,
        desktopColumns: Number(desktopColumns),
        showTopBar,
        termsPolicy,
        privacyPolicy,
        shippingPolicy,
        returnsPolicy
      };

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        broadcastConfigChange(data.data);
        setSuccessMsg('¡Configuración guardada! Los cambios ya se reflejan en el catálogo público.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#8C827A] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#D4A359]" />
        <span className="font-bold">Cargando configuración de la tienda...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Panel de Control · Hobby Bolivia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Configuración General
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Modifica la identidad del negocio, cobro con QR y el diseño de columnas del catálogo público.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-[#161311] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#D4A359]" />}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#3E7B44]/15 border border-[#3E7B44]/30 text-[#1E4D2B] text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <div className="w-7 h-7 rounded-full bg-[#3E7B44] text-white flex items-center justify-center font-black flex-shrink-0">
            ✓
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================
            1. IDENTIDAD DEL NEGOCIO
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#FAF8F5]">
            <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1A1817]">1. Identidad del Negocio</h2>
              <p className="text-xs text-[#8C827A]">Datos principales de la marca, moneda y canales oficiales de contacto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Nombre de la Tienda*
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej. Hobby Bolivia"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] placeholder:text-[#A89F91] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all"
              />
            </div>

            <div className="lg:col-span-8">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Subtítulo / Rubro Comercial*
              </label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej. Repuestos de precisión, drones & aeromodelismo"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] placeholder:text-[#A89F91] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all"
              />
            </div>

            <div className="lg:col-span-4">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Moneda Predeterminada del Catálogo*
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all cursor-pointer"
              >
                <option value="auto">Automática (Según cada producto)</option>
                <option value="Bs.">Todo en Bolivianos (Bs.)</option>
                <option value="USD">Todo en Dólares (USD)</option>
              </select>
            </div>

            <div className="lg:col-span-4">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Número de WhatsApp (con +591)*
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+591 77293446"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] placeholder:text-[#A89F91] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all font-mono"
              />
            </div>

            <div className="lg:col-span-4">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Correo Electrónico de Contacto
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contacto@hobbybolivia.com"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] placeholder:text-[#A89F91] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all"
              />
            </div>

            <div className="lg:col-span-12">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                Texto de la Barra Superior (Top Bar)
              </label>
              <input
                type="text"
                value={topBarText}
                onChange={(e) => setTopBarText(e.target.value)}
                placeholder="Ej. Envíos a toda Bolivia | Atención personalizada"
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] placeholder:text-[#A89F91] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all"
              />
            </div>


          </div>
        </section>

        {/* ========================================================
            2. CONFIGURACIÓN DE PAGO CON QR (QR SIMPLE BOLIVIA)
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#FAF8F5] flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1A1817]">2. Cobro con QR Simple (Bolivia)</h2>
                <p className="text-xs text-[#8C827A]">Publica o cambia el código QR bancario cuando desees para pagos al instante en el carrito.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <label className="flex items-center gap-2.5 cursor-pointer bg-[#FAF8F5] hover:bg-white px-3.5 py-2 rounded-xl border border-[#E2DCD3] transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={enablePaymentQr}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    handleInstantQrUpdate(paymentQrUrl, paymentQrInstructions, checked);
                  }}
                  className="w-4 h-4 rounded text-[#D4A359] focus:ring-0 accent-[#D4A359] cursor-pointer"
                />
                <span className="text-xs font-black text-[#1A1817]">Habilitar QR en Carrito</span>
              </label>

              <button
                type="button"
                onClick={() => handleInstantQrUpdate(paymentQrUrl, paymentQrInstructions, enablePaymentQr)}
                className="px-4 py-2 rounded-xl bg-[#161311] hover:bg-[#D4A359] text-white hover:text-[#161311] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Guardar QR</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Uploader QR */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
              <ImageUploader
                label="Imagen del Código QR Bancario"
                value={paymentQrUrl}
                onChange={setPaymentQrUrl}
                onUploadSuccess={(newUrl) => handleInstantQrUpdate(newUrl, paymentQrInstructions, enablePaymentQr)}
                recommendedSize="Sube la imagen de tu QR Simple generado desde tu banco (PNG, JPG, WebP o SVG hasta 5 MB)."
              />
            </div>

            {/* Instrucciones & Vista Previa */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                    Instrucciones para el Comprador:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleInstantQrUpdate(paymentQrUrl, paymentQrInstructions, enablePaymentQr)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#D4A359] hover:bg-[#C69755] text-[#161311] text-[11px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Save className="w-3 h-3 text-[#161311]" />
                    <span>Aplicar texto al carrito</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={paymentQrInstructions}
                  onChange={(e) => setPaymentQrInstructions(e.target.value)}
                  placeholder="Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp."
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all text-[#1A1817]"
                />
                <p className="text-[11px] text-[#3E7B44] font-bold mt-1.5">
                  Las instrucciones para realizar la compra se coordinarán únicamente por WhatsApp.
                </p>
              </div>

              {/* Vista previa en vivo */}
              {paymentQrUrl ? (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-xl border border-[#D4A359] flex items-center justify-center shrink-0 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={paymentQrUrl} alt="Vista previa QR" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs space-y-1 min-w-0 flex-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${enablePaymentQr
                        ? 'bg-[#3E7B44]/15 border-[#3E7B44]/30 text-[#1E4D2B]'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                    >
                      {enablePaymentQr ? 'QR Activo en Carrito' : 'QR Deshabilitado en Carrito'}
                    </span>
                    <p className="font-black text-[#1A1817]">Vista previa en el Carrito</p>
                    <p className="text-[11px] text-[#5C554E] whitespace-pre-line line-clamp-3">
                      {paymentQrInstructions || 'Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-semibold">
                  No hay imagen de código QR cargada actualmente. Haz clic en &quot;Haz clic para buscar o arrastra tu archivo aquí&quot; a la izquierda para subir tu QR bancario.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            3. MÓDULO DE CONFIGURACIÓN GENERAL (DISEÑO DEL CATÁLOGO & CALCULADORA)
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#FAF8F5] flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shrink-0 border border-[#D4A359]/40">
                <Layout className="w-4 h-4 text-[#D4A359]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-[#1A1817]">3. Módulo de Configuración General</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#211E1C] text-[#D4A359]">
                    Tiempo Real
                  </span>
                </div>
                <p className="text-xs text-[#8C827A]">
                  Controla las columnas por fila, la moneda del catálogo público y simula precios con la calculadora de conversión.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              {/* Opción 1: Columnas en Escritorio */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                    Columnas por Fila (Escritorio):
                  </label>
                  <span className="text-[10px] font-bold text-[#8C827A]">
                    Actual: {desktopColumns} col.
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 6, 8].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={async () => {
                        setDesktopColumns(cols);
                        try {
                          const res = await fetch('/api/settings', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ desktopColumns: cols })
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            broadcastConfigChange(data.data);
                            setSuccessMsg(`¡Diseño actualizado a ${cols} productos por fila en escritorio!`);
                            setTimeout(() => setSuccessMsg(''), 4000);
                          }
                        } catch {
                          // ignore
                        }
                      }}
                      className={`py-2.5 px-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${desktopColumns === cols
                        ? 'bg-[#211E1C] text-[#D4A359] border-[#D4A359] shadow-xs'
                        : 'bg-white text-[#5C5650] hover:text-[#1A1817] border-[#E2DCD3]'
                        }`}
                    >
                      {cols} Col.
                    </button>
                  ))}
                </div>

                <select
                  value={desktopColumns}
                  onChange={async (e) => {
                    const cols = Number(e.target.value);
                    setDesktopColumns(cols);
                    try {
                      const res = await fetch('/api/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ desktopColumns: cols })
                      });
                      const data = await res.json();
                      if (res.ok && data.success) {
                        broadcastConfigChange(data.data);
                        setSuccessMsg(`¡Diseño actualizado a ${cols} productos por fila en escritorio!`);
                        setTimeout(() => setSuccessMsg(''), 4000);
                      }
                    } catch {
                      // ignore
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/20 text-[#1A1817] cursor-pointer shadow-xs"
                >
                  <option value={3}>3 productos por fila (Tarjetas Grandes)</option>
                  <option value={4}>4 productos por fila (Estándar E-commerce)</option>
                  <option value={6}>6 productos por fila (Estilo Galba Compacto)</option>
                  <option value={8}>8 productos por fila (Vista Ultra Compacta)</option>
                </select>

                <span className="text-[11px] text-[#8C827A] block">
                  En pantallas móviles se adapta automáticamente a 2 columnas para una navegación ágil.
                </span>
              </div>

              {/* Opción 2: Moneda Predeterminada del Catálogo Público */}
              <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
                <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                  Moneda del Catálogo Público:
                </label>
                <p className="text-[11px] text-[#8C827A]">
                  Define si el catálogo respeta la moneda individual de cada repuesto o fuerza una moneda global:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'auto', label: 'Por Producto' },
                    { value: 'Bs.', label: 'Todo en Bs.' },
                    { value: 'USD', label: 'Todo en USD' }
                  ].map((opt) => {
                    const isActive =
                      (opt.value === 'USD' && (currency === 'USD' || currency === '$us')) ||
                      currency === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={async () => {
                          setCurrency(opt.value);
                          try {
                            const res = await fetch('/api/settings', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ currency: opt.value })
                            });
                            const data = await res.json();
                            if (res.ok && data.success) {
                              broadcastConfigChange(data.data);
                              setSuccessMsg(
                                opt.value === 'auto'
                                  ? 'Moneda configurada según cada producto individual'
                                  : `Moneda global del catálogo fijada en ${opt.label}`
                              );
                              setTimeout(() => setSuccessMsg(''), 4000);
                            }
                          } catch {
                            // ignore
                          }
                        }}
                        className={`py-2.5 px-2 rounded-xl font-black text-xs border transition-all cursor-pointer ${isActive
                          ? 'bg-[#211E1C] text-[#D4A359] border-[#D4A359] shadow-xs'
                          : 'bg-white text-[#5C5650] hover:text-[#1A1817] border-[#E2DCD3]'
                          }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Calculadora de Conversión (USD ⇄ Bs.) */}
            <div className="bg-[#161311] text-[#FAF8F5] p-6 rounded-3xl border border-[#2D2622] shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#2D2622] flex-wrap">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-[#D4A359]" />
                  <h3 className="font-black text-sm tracking-tight text-[#FAF8F5]">
                    Calculadora de Conversión
                  </h3>
                </div>

                {/* Selector rápido de dirección: USD a Bs. | Bs. a USD */}
                <div className="inline-flex items-center p-0.5 bg-[#211E1C] border border-[#3D352E] rounded-xl text-[10px] font-black">
                  <button
                    type="button"
                    onClick={() => setCalcDirection('USD_TO_BOB')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${calcDirection === 'USD_TO_BOB'
                      ? 'bg-[#D4A359] text-[#161311]'
                      : 'text-[#A89F91] hover:text-[#FAF8F5]'
                      }`}
                  >
                    USD → Bs.
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcDirection('BOB_TO_USD')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${calcDirection === 'BOB_TO_USD'
                      ? 'bg-[#D4A359] text-[#161311]'
                      : 'text-[#A89F91] hover:text-[#FAF8F5]'
                      }`}
                  >
                    Bs. → USD
                  </button>
                </div>
              </div>

              <div className="mb-4 space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#211E1C] border border-[#D4A359]/40 text-[10px] font-bold text-[#D4A359]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3E7B44] animate-pulse" />
                  <span>
                    Tipo de cambio actualizado a la fecha{rateDateStr ? ` (${rateDateStr})` : ''}: 1 USD = Bs. {exchangeRate}
                  </span>
                </div>
                <p className="text-xs text-[#A89F91]">
                  Convierte al instante de Dólares a Bolivianos o de Bolivianos a Dólares con el tipo de cambio vigente.
                </p>
              </div>

              <div className="space-y-3.5">
                {calcDirection === 'USD_TO_BOB' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A359] mb-1">
                        Monto en Dólares (USD)
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
                      <button
                        type="button"
                        onClick={() =>
                          setCalcDirection((prev) =>
                            prev === 'USD_TO_BOB' ? 'BOB_TO_USD' : 'USD_TO_BOB'
                          )
                        }
                        title="Invertir conversión (Bs. ⇄ USD)"
                        className="w-7 h-7 rounded-full bg-[#211E1C] hover:bg-[#D4A359] border border-[#3D352E] text-[#D4A359] hover:text-[#161311] flex items-center justify-center text-xs transition-colors cursor-pointer"
                      >
                        ⇅
                      </button>
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
                          placeholder="599.85"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A359] mb-1">
                        Monto en Bolivianos (Bs.)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-mono text-[#A89F91]">Bs.</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calcBob}
                          onChange={(e) => handleBobChange(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-[#211E1C] border border-[#3D352E] rounded-xl text-sm font-black text-[#FAF8F5] focus:border-[#D4A359] outline-none"
                          placeholder="599.85"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setCalcDirection((prev) =>
                            prev === 'USD_TO_BOB' ? 'BOB_TO_USD' : 'USD_TO_BOB'
                          )
                        }
                        title="Invertir conversión (USD ⇄ Bs.)"
                        className="w-7 h-7 rounded-full bg-[#211E1C] hover:bg-[#D4A359] border border-[#3D352E] text-[#D4A359] hover:text-[#161311] flex items-center justify-center text-xs transition-colors cursor-pointer"
                      >
                        ⇅
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#D4A359] mb-1">
                        Equivalente en Dólares (USD)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-mono text-[#D4A359]">$us</span>
                        <input
                          type="number"
                          step="0.01"
                          value={calcUsd}
                          onChange={(e) => handleUsdChange(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-[#211E1C] border border-[#3D352E] rounded-xl text-sm font-black text-[#D4A359] focus:border-[#D4A359] outline-none"
                          placeholder="50.00"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#2D2622] text-[11px] text-[#A89F91] text-center">
                {calcDirection === 'USD_TO_BOB' ? (
                  <>
                    Fórmula: <code>Precio en Bs. = USD × {exchangeRate}</code>
                  </>
                ) : (
                  <>
                    Fórmula: <code>Precio en USD = Bs. ÷ {exchangeRate}</code>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-4 bg-[#161311] text-[#FAF8F5] p-4 sm:p-5 rounded-3xl border border-[#2D2622] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/20 text-[#D4A359] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4A359]" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black text-white block">
                Sincronización Inmediata
              </span>
              <span className="text-[11px] text-[#A89F91] block">
                Guarda los cambios para reflejarlos de inmediato en el catálogo público y la base de datos.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 rounded-full bg-[#F85606] hover:bg-[#D44500] text-white text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02] disabled:opacity-50 cursor-pointer shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Todo Ahora'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
