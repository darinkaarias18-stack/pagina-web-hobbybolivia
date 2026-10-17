'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Palette,
  Image as ImageIcon,
  Layout,
  FileText,
  Save,
  Check,
  Loader2,
  Sparkles,
  RefreshCw,
  Eye
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
  const [whatsappNumber, setWhatsappNumber] = useState('+59178000000');
  const [contactEmail, setContactEmail] = useState('contacto@hobbybolivia.com');
  const [topBarText, setTopBarText] = useState('Hobby Bolivia · Aeromodelismo y radio control en Bolivia | Envíos a todo el país');
  const [domain, setDomain] = useState('https://hobbybolivia.com');

  // 2. Web Images
  const [logoUrl, setLogoUrl] = useState('');
  const [heroBannerUrl, setHeroBannerUrl] = useState('');

  // 3. Theme Presets & Custom Colors
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

  // Presets definition
  const presets = [
    {
      id: 'floreria',
      name: 'Florería & Detalles',
      desc: 'Rosa Carmesí + Verde Botánico',
      primary: '#E11D48',
      secondary: '#064E3B',
      accent: '#F43F5E',
      previewBg: 'from-[#E11D48] to-[#064E3B]'
    },
    {
      id: 'ferreteria',
      name: 'Catálogo Industrial / Ferretería',
      desc: 'Naranja Intenso + Azul Oscuro Slate',
      primary: '#EA580C',
      secondary: '#0F172A',
      accent: '#2563EB',
      previewBg: 'from-[#EA580C] to-[#0F172A]'
    },
    {
      id: 'tech',
      name: 'Tecnología / Moderno',
      desc: 'Azul Real + Gris Pizarra',
      primary: '#2563EB',
      secondary: '#1E293B',
      accent: '#3B82F6',
      previewBg: 'from-[#2563EB] to-[#1E293B]'
    },
    {
      id: 'classic',
      name: 'Editorial / Clásico',
      desc: 'Dorado Elegante + Azul Noche',
      primary: '#EAB308',
      secondary: '#0F172A',
      accent: '#CA8A04',
      previewBg: 'from-[#EAB308] to-[#0F172A]'
    }
  ];

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
          setSubtitle(c.subtitle || 'Aeromodelismo & R/C');
          setCurrency(c.currency || '$us');
          setWhatsappNumber(c.whatsappNumber || '+59178000000');
          setContactEmail(c.contactEmail || 'contacto@hobbybolivia.com');
          setTopBarText(c.topBarText || '');
          setDomain(c.domain || 'https://hobbybolivia.com');

          setLogoUrl(c.logoUrl || '');
          setHeroBannerUrl(c.heroBannerUrl || '');

          setThemePreset(c.themePreset || 'ferreteria');
          setPrimaryColor(c.primaryColor || '#e04f26');
          setSecondaryColor(c.secondaryColor || '#162544');
          setAccentColor(c.accentColor || '#2563eb');

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
  }, []);

  const applyPreset = (presetId: string) => {
    const p = presets.find((x) => x.id === presetId);
    if (p) {
      setThemePreset(p.id);
      setPrimaryColor(p.primary);
      setSecondaryColor(p.secondary);
      setAccentColor(p.accent);
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
        heroBannerUrl: heroBannerUrl.trim() || null,
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
      <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#162544]" />
        <span>Cargando configuración de la tienda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#e04f26] uppercase tracking-wider block">
            Personalización & Apariencia
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#162544] tracking-tight">
            Configuración de la Tienda
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modifica la identidad, logotipo, temas de color y estructura visual del catálogo público.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver Catálogo en Vivo ↗</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full bg-[#162544] hover:bg-[#1d2b53] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">
            ✓
          </div>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* ========================================================
            1. IDENTIDAD DEL NEGOCIO
        ======================================================== */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#162544]/10 text-[#162544] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#162544]">1. Identidad del Negocio</h2>
              <p className="text-xs text-slate-400">Datos principales de la marca, moneda y líneas de contacto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Tienda*</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej. Hobby Bolivia"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Subtítulo / Rubro Comercial*</label>
              <input
                type="text"
                required
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ej. Aeromodelismo & R/C o Florería & Detalles"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Moneda del Catálogo*</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              >
                <option value="$us">Dólares Americanos ($us)</option>
                <option value="Bs.">Bolivianos (Bs.)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Número de WhatsApp (con +591)*</label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+59178000000"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico de Contacto</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="contacto@hobbybolivia.com"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Texto de la Barra Superior (Top Bar)</label>
              <input
                type="text"
                value={topBarText}
                onChange={(e) => setTopBarText(e.target.value)}
                placeholder="Envíos a todo el país..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            2. IMÁGENES DE LA WEB (LOGOTIPO Y HERO BANNER)
        ======================================================== */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#e04f26]/10 text-[#e04f26] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#162544]">2. Imágenes Oficiales de la Web</h2>
              <p className="text-xs text-slate-400">Sube tus archivos de imagen directamente desde tu PC o pega enlaces externos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Uploader Logotipo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <ImageUploader
                label="Logotipo de la Tienda (Header y Footer)"
                value={logoUrl}
                onChange={setLogoUrl}
                recommendedSize="Proporción recomendada: Cuadrado 512x512 px o formato horizontal transparente (PNG, SVG, WebP)."
              />
            </div>

            {/* Uploader Hero Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <ImageUploader
                label="Imagen del Banner Principal (Hero)"
                value={heroBannerUrl}
                onChange={setHeroBannerUrl}
                recommendedSize="Recomendado: 1200x600 px o similar para la portada principal del catálogo."
              />
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SELECTOR DE TEMA Y COLORES (PRESETS DE APARIENCIA)
        ======================================================== */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#162544]">3. Selector de Tema y Colores (Presets)</h2>
              <p className="text-xs text-slate-400">Aplica una paleta preconfigurada con 1 solo clic o personaliza los colores exactos.</p>
            </div>
          </div>

          {/* 4 Presets de 1 clic */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-3">Temas Rápidos de 1 Clic:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {presets.map((p) => {
                const isActive = themePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[105px] ${
                      isActive
                        ? 'border-[#162544] ring-2 ring-[#162544]/20 shadow-md bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
                    }`}
                  >
                    <div>
                      {/* Gradient preview bar */}
                      <div className={`w-full h-3 rounded-full bg-gradient-to-r ${p.previewBg} mb-2 shadow-xs`} />
                      <span className="text-xs font-bold text-[#162544] block leading-tight">
                        {p.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5 leading-tight">
                        {p.desc}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: p.secondary }} />
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-extrabold uppercase text-[#16a34a] flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Activo
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Pickers Custom */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block mb-3">Ajuste Fino de Colores (Personalizado):</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Primary Color */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Color Primario (Botones)</span>
                  <span className="text-[11px] text-slate-400">Pestañas, botones y acentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => {
                      setPrimaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Color de Cabecera</span>
                  <span className="text-[11px] text-slate-400">Cinta de navegación y banners</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => {
                      setSecondaryColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Color de Acento</span>
                  <span className="text-[11px] text-slate-400">Subrayados y enlaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-300 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            4. OPCIONES DE DISEÑO DEL CATÁLOGO PÚBLICO
        ======================================================== */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Layout className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#162544]">4. Opciones de Diseño del Catálogo Público</h2>
              <p className="text-xs text-slate-400">Controla el estilo de tarjetas, cantidad de columnas y elementos visibles.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Style Selector */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Estilo de Tarjetas de Producto:
              </label>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="cardStyle"
                    value="with_button"
                    checked={cardStyle === 'with_button'}
                    onChange={() => setCardStyle('with_button')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#162544] block">Con botón &quot;+ Añadir&quot;</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Permite compras y cotizaciones rápidas directas al carrito.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="cardStyle"
                    value="catalog_only"
                    checked={cardStyle === 'catalog_only'}
                    onChange={() => setCardStyle('catalog_only')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#162544] block">Estilo catálogo simple</span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      Solo muestra fotografía, título y precio para consulta visual.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Columns Count */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Columnas en Pantalla Grande (Escritorio):
              </label>

              <select
                value={desktopColumns}
                onChange={(e) => setDesktopColumns(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#162544]"
              >
                <option value={3}>3 productos por fila (Tarjetas Grandes)</option>
                <option value={4}>4 productos por fila (Estándar E-commerce)</option>
                <option value={6}>6 productos por fila (Estilo Galba Compacto)</option>
              </select>

              <span className="text-[11px] text-slate-400 block">
                En pantallas móviles se ajusta automáticamente a 2 columnas para comodidad táctil.
              </span>
            </div>

            {/* Top Bar Switch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Barra Superior de Anuncios:
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="checkbox"
                  checked={showTopBar}
                  onChange={(e) => setShowTopBar(e.target.checked)}
                  className="w-4 h-4 text-[#e04f26] rounded focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-[#162544] block">Mostrar barra superior</span>
                  <span className="text-[11px] text-slate-400 block">
                    Muestra redes sociales a la izquierda y teléfono/email a la derecha.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-4 bg-[#162544] text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 z-20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#e04f26]" />
            <span className="text-xs sm:text-sm font-semibold">
              Guarda tus cambios para sincronizar la base de datos y la web pública.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#e04f26] hover:bg-[#c93e18] text-white text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Todo Ahora'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
