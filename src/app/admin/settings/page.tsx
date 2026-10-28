'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Image as ImageIcon,
  Layout,
  Save,
  Loader2,
  Sparkles,
  Eye,
  QrCode
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
  const [paymentQrInstructions, setPaymentQrInstructions] = useState('');
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

  // 5. Policies
  const [termsPolicy, setTermsPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [shippingPolicy, setShippingPolicy] = useState('');
  const [returnsPolicy, setReturnsPolicy] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('hb_user_role') || 'ADMIN';
    if (role !== 'SUPERADMIN') {
      router.replace('/admin/items');
      return;
    }

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
          setPaymentQrInstructions(c.paymentQrInstructions || '');
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
            <span className="w-2 h-2 rounded-full bg-[#F85606] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Personalización & Apariencia · Hobby Bolivia
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Configuración de la Tienda
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Modifica la identidad, logotipo, temas de color y estructura visual del catálogo público.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>Ver Catálogo en Vivo ↗</span>
          </a>

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
                Moneda del Catálogo*
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none text-[#1A1817] focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all cursor-pointer"
              >
                <option value="Bs.">Bolivianos (Bs.)</option>
                <option value="$us">Dólares Americanos ($us)</option>
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
            2. LOGOTIPO OFICIAL DE LA WEB
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#FAF8F5]">
            <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1A1817]">2. Logotipo Oficial de la Web</h2>
              <p className="text-xs text-[#8C827A]">Sube el logotipo que se mostrará en la cabecera principal, menú y pie de página del catálogo.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3]">
            <ImageUploader
              label="Logotipo Oficial (Header y Footer)"
              value={logoUrl}
              onChange={setLogoUrl}
              recommendedSize="Proporción recomendada: 512x512 px o formato horizontal con fondo transparente (PNG, SVG, WebP)."
            />
          </div>
        </section>

        {/* ========================================================
            3. CONFIGURACIÓN DE PAGO CON QR (QR SIMPLE BOLIVIA)
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#FAF8F5] flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1A1817]">3. Cobro con QR Simple (Bolivia)</h2>
                <p className="text-xs text-[#8C827A]">Publica el código QR bancario para que tus clientes completen pagos al instante en el carrito.</p>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer bg-[#FAF8F5] hover:bg-white px-3.5 py-2 rounded-xl border border-[#E2DCD3] transition-colors shadow-xs">
              <input
                type="checkbox"
                checked={enablePaymentQr}
                onChange={(e) => setEnablePaymentQr(e.target.checked)}
                className="w-4 h-4 rounded text-[#D4A359] focus:ring-0 accent-[#D4A359] cursor-pointer"
              />
              <span className="text-xs font-black text-[#1A1817]">Habilitar QR en Carrito</span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Uploader QR */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
              <ImageUploader
                label="Imagen del Código QR Bancario"
                value={paymentQrUrl}
                onChange={setPaymentQrUrl}
                recommendedSize="Sube la captura de tu QR Simple generado desde tu banco (Banco Unión, BCP, BNB, Mercantil, etc.)."
              />
            </div>

            {/* Instrucciones & Vista Previa */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block mb-1.5">
                  Datos de Cuenta / Instrucciones para el Comprador:
                </label>
                <textarea
                  rows={4}
                  value={paymentQrInstructions}
                  onChange={(e) => setPaymentQrInstructions(e.target.value)}
                  placeholder="Ej: Titular: Hobby Bolivia SRL&#10;Banco: Banco Unión&#10;Cuenta en Bs.: 100000XXXX&#10;Por favor adjunta tu comprobante al enviar la orden por WhatsApp."
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:bg-white focus:ring-2 focus:ring-[#D4A359]/20 transition-all text-[#1A1817]"
                />
                <p className="text-[11px] text-[#8C827A] mt-1.5">
                  Este texto se mostrará directamente debajo del QR en el cajón del carrito de compras.
                </p>
              </div>

              {/* Vista previa en vivo */}
              {paymentQrUrl && (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] flex items-center gap-4">
                  <div className="w-24 h-24 bg-white p-1 rounded-xl border border-[#E2DCD3] flex items-center justify-center shrink-0 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={paymentQrUrl} alt="Vista previa QR" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs space-y-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#3E7B44]/15 border border-[#3E7B44]/30 text-[#1E4D2B] text-[10px] font-black uppercase">
                      ✓ QR Configurado
                    </span>
                    <p className="font-black text-[#1A1817]">Vista previa en el Carrito</p>
                    <p className="text-[11px] text-[#5C554E] whitespace-pre-line line-clamp-3">
                      {paymentQrInstructions || 'Titular: Hobby Bolivia\nEnvía tu comprobante con tu orden por WhatsApp.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================
            4. OPCIONES DE DISEÑO DEL CATÁLOGO PÚBLICO
        ======================================================== */}
        <section className="bg-white p-6 sm:p-7 rounded-3xl border border-[#E2DCD3] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#FAF8F5]">
            <div className="w-9 h-9 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1A1817]">4. Opciones de Diseño del Catálogo Público</h2>
              <p className="text-xs text-[#8C827A]">Controla el estilo de tarjetas, cantidad de columnas y elementos visibles en la tienda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Style Selector */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                Estilo de Tarjetas de Producto:
              </label>

              <div className="space-y-2.5">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E2DCD3] cursor-pointer hover:border-[#D4A359] transition-colors shadow-xs">
                  <input
                    type="radio"
                    name="cardStyle"
                    value="with_button"
                    checked={cardStyle === 'with_button'}
                    onChange={() => setCardStyle('with_button')}
                    className="mt-0.5 accent-[#D4A359]"
                  />
                  <div>
                    <span className="text-xs font-black text-[#1A1817] block">Con botón &quot;+ Añadir&quot;</span>
                    <span className="text-[11px] text-[#8C827A] leading-tight block mt-0.5">
                      Permite compras y cotizaciones directas al carrito.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#E2DCD3] cursor-pointer hover:border-[#D4A359] transition-colors shadow-xs">
                  <input
                    type="radio"
                    name="cardStyle"
                    value="catalog_only"
                    checked={cardStyle === 'catalog_only'}
                    onChange={() => setCardStyle('catalog_only')}
                    className="mt-0.5 accent-[#D4A359]"
                  />
                  <div>
                    <span className="text-xs font-black text-[#1A1817] block">Estilo catálogo simple</span>
                    <span className="text-[11px] text-[#8C827A] leading-tight block mt-0.5">
                      Muestra fotografía, título y precio para consulta visual.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Columns Count */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                Columnas en Escritorio:
              </label>

              <select
                value={desktopColumns}
                onChange={(e) => setDesktopColumns(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-[#E2DCD3] rounded-xl outline-none focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/20 text-[#1A1817] cursor-pointer shadow-xs"
              >
                <option value={3}>3 productos por fila (Tarjetas Grandes)</option>
                <option value={4}>4 productos por fila (Estándar E-commerce)</option>
                <option value={6}>6 productos por fila (Estilo Galba Compacto)</option>
              </select>

              <span className="text-[11px] text-[#8C827A] block">
                En pantallas móviles se adapta automáticamente a 2 columnas para una navegación ágil.
              </span>
            </div>

            {/* Top Bar Switch */}
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] space-y-3">
              <label className="text-xs font-black text-[#1A1817] uppercase tracking-wide block">
                Barra Superior de Anuncios:
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-[#E2DCD3] cursor-pointer hover:border-[#D4A359] transition-colors shadow-xs">
                <input
                  type="checkbox"
                  checked={showTopBar}
                  onChange={(e) => setShowTopBar(e.target.checked)}
                  className="w-4 h-4 text-[#D4A359] rounded focus:ring-0 accent-[#D4A359] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-black text-[#1A1817] block">Mostrar barra superior</span>
                  <span className="text-[11px] text-[#8C827A] block mt-0.5">
                    Muestra redes sociales, contacto y anuncio de envíos.
                  </span>
                </div>
              </label>
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
