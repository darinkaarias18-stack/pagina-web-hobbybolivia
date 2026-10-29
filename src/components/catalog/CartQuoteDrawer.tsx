'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Send,
  CheckCircle2,
  QrCode,
  Maximize2,
  ChevronDown,
  Plane
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig } from '@/lib/types';

interface CartQuoteDrawerProps {
  config?: SiteConfig | null;
}

const COUNTRY_LIST = [
  { code: '+591', country: 'Bolivia', iso: 'BO' },
  { code: '+51', country: 'Perú', iso: 'PE' },
  { code: '+54', country: 'Argentina', iso: 'AR' },
  { code: '+56', country: 'Chile', iso: 'CL' },
  { code: '+55', country: 'Brasil', iso: 'BR' },
  { code: '+595', country: 'Paraguay', iso: 'PY' },
  { code: '+1', country: 'Estados Unidos', iso: 'US' },
  { code: '+34', country: 'España', iso: 'ES' },
];

export function CartQuoteDrawer({ config }: CartQuoteDrawerProps) {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    closeDrawer,
    subtotal,
    totalCount
  } = useCart();

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(config || null);
  const [customerName, setCustomerName] = useState('');
  const [countryCode, setCountryCode] = useState('+591');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('La Paz');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const selectedCountry = COUNTRY_LIST.find((c) => c.code === countryCode) || COUNTRY_LIST[0];

  // Fetch settings dynamically and listen to live updates from Admin
  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/settings?t=' + Date.now(), { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setSiteConfig(data.data);
          }
        })
        .catch((err) => console.error("Error loading cart settings:", err));
    };

    if (isDrawerOpen) {
      loadSettings();
    }

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('hb_catalog_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CONFIG_UPDATED' && event.data?.config) {
          setSiteConfig(event.data.config);
        }
      };
    } catch {
      // ignore
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hb_config_sync' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.config) {
            setSiteConfig(parsed.config);
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const currentConfig = siteConfig || config;
  const whatsapp = currentConfig?.whatsappNumber || "+591 77293446";

  const paymentQrUrl = currentConfig ? (currentConfig.paymentQrUrl || '') : "/images/payment/qr_simple_hobbybolivia.svg";
  const paymentQrInstructions = currentConfig?.paymentQrInstructions ||
    "Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp.";
  const showPaymentQr = currentConfig?.enablePaymentQr !== false && Boolean(paymentQrUrl);

  const handleGoToCatalog = () => {
    closeDrawer();
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const fullCustomerPhone = customerPhone.startsWith('+')
        ? customerPhone
        : `${countryCode} ${customerPhone}`.trim();

      // 1. Save quote/order in database via API
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone: fullCustomerPhone,
          deliveryCity,
          deliveryAddress,
          customerNotes,
          items: cartItems,
          total: subtotal
        })
      });

      const orderData = await res.json();
      const orderCode = orderData?.data?.orderCode || `HB-${Date.now().toString().slice(-6)}`;

      // 2. Generate WhatsApp formatted message
      let message = `*NUEVO PEDIDO DE REPUESTOS - HOBBY BOLIVIA*\n`;
      message += `*Código de Orden:* ${orderCode}\n`;
      message += `------------------------------------\n`;
      message += `*Cliente:* ${customerName}\n`;
      message += `*Teléfono / WhatsApp:* ${fullCustomerPhone}\n`;
      message += `*Ciudad de Envío:* ${deliveryCity}\n`;
      message += `*Dirección para el Pedido:* ${deliveryAddress}\n`;
      if (customerNotes.trim()) {
        message += `*Notas:* ${customerNotes}\n`;
      }
      message += `------------------------------------\n`;
      message += `*REPUESTOS SELECCIONADOS (${totalCount} piezas):*\n`;

      cartItems.forEach((ci, idx) => {
        const item = ci.item;
        const itemTotal = item.price * ci.quantity;
        message += `${idx + 1}. *${item.name || item.title}*\n`;
        message += `   • SKU: ${item.sku}\n`;
        message += `   • Cantidad: ${ci.quantity} x Bs. ${item.price.toFixed(2)} = *Bs. ${itemTotal.toFixed(2)}*\n`;
      });

      message += `------------------------------------\n`;
      message += `*TOTAL A PAGAR:* Bs. ${subtotal.toFixed(2)}\n`;
      message += `*MÉTODO DE PAGO:* QR Simple Bolivia (Comprobante adjunto)\n`;
      message += `------------------------------------\n`;
      message += `Adjunto mi comprobante de pago QR Simple para verificación y despacho.`;

      // 3. Clear cart and show completion
      setOrderCompleted(orderCode);
      clearCart();

      // 4. Open WhatsApp to configured web number
      const targetPhone = (siteConfig?.whatsappNumber || config?.whatsappNumber || whatsapp || "+591 77293446").replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');

    } catch (err) {
      console.error("Error creating quote order:", err);
      alert("Hubo un problema al procesar el pedido. Abriremos WhatsApp de todas formas.");
      const targetPhone = (siteConfig?.whatsappNumber || config?.whatsappNumber || whatsapp || "+591 77293446").replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${targetPhone}?text=Hola%20Hobby%20Bolivia,%20quisiera%20hacer%20un%20pedido%20de%20repuestos.`;
      window.open(waUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop + Right Sidebar Drawer */}
      <div
        onClick={closeDrawer}
        className="fixed inset-0 z-50 bg-[#161311]/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
      >
        {/* Sidebar Panel from Right Side */}
        <aside
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg sm:max-w-xl h-full bg-[#F5F2EB] text-[#1A1817] shadow-2xl border-l border-[#2D2622] flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Top Sidebar Header Bar */}
          <header className="shrink-0 border-b border-[#2D2622] bg-[#161311] text-[#FAF8F5] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359] shadow-md shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-sm sm:text-base uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
                  <span>Datos de la compra</span>
                </h2>
                <p className="text-[11px] text-[#D4A359] font-bold">
                  {totalCount} {totalCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && !orderCompleted && (
                <button
                  onClick={clearCart}
                  type="button"
                  title="Vaciar carrito"
                  className="text-xs text-[#A89F91] hover:text-[#FAF8F5] font-bold px-2.5 py-1.5 rounded-xl bg-[#211E1C] hover:bg-[#2E2A27] border border-[#2D2622] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Vaciar</span>
                </button>
              )}

              <button
                onClick={closeDrawer}
                type="button"
                className="p-2 rounded-xl bg-[#211E1C] hover:bg-[#D4A359] text-[#FAF8F5] hover:text-[#161311] border border-[#D4A359]/40 transition-all cursor-pointer"
                aria-label="Cerrar panel"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Scrollable Sidebar Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {orderCompleted ? (
              <div className="my-6 p-6 rounded-3xl bg-[#FAF8F5] border border-[#E2DCD3] shadow-lg text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center mx-auto border border-[#D4A359]/50 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-[#1A1817] uppercase tracking-wide">
                  ¡Orden Registrada con Éxito!
                </h4>
                <p className="text-xs sm:text-sm text-[#5C5650] leading-relaxed">
                  Tu orden con código{' '}
                  <strong className="text-[#1A1817] font-mono bg-[#F5F2EB] px-2 py-0.5 rounded border border-[#E2DCD3]">
                    {orderCompleted}
                  </strong>{' '}
                  fue enviada por WhatsApp para confirmación de pago y despacho.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setOrderCompleted(null);
                      closeDrawer();
                    }}
                    type="button"
                    className="px-7 py-3 bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-md"
                  >
                    Volver al Catálogo
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty Sidebar State */
              <div className="my-4 p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-[#E2DCD3] shadow-sm text-center space-y-5">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center shadow-md">
                  <ShoppingCart className="w-8 h-8 text-[#D4A359]" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-base sm:text-lg text-[#1A1817] uppercase tracking-wide">
                    Tu carrito aún está vacío
                  </h4>
                  <p className="text-xs text-[#5C5650] leading-relaxed">
                    Elige los conectores, varillajes, hélices o componentes mecánicos que necesitas en el catálogo y haz clic en el botón{' '}
                    <strong className="text-[#1A1817]">&quot;+&quot;</strong> o{' '}
                    <strong className="text-[#1A1817]">&quot;Añadir a mi Pedido&quot;</strong> de cada pieza.
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGoToCatalog}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4A359]/25 hover:scale-105 cursor-pointer"
                  >
                    <span>Ir al Catálogo de Repuestos</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F2EB] border border-[#E2DCD3] text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1A1817]">
                    <ShieldCheck className="w-4 h-4 text-[#D4A359]" />
                    <span>Atención y Despacho Directo</span>
                  </div>
                  <p className="text-xs text-[#5C5650] leading-relaxed">
                    Las instrucciones para realizar la compra se brindarán únicamente por WhatsApp. Realizamos envíos blindados con número de guía a toda Bolivia.
                  </p>
                </div>
              </div>
            ) : (
              /* Sidebar Content: 1. Items + 2. Delivery Form + 3. Optional QR */
              <div className="space-y-5">
                {/* 1. LISTA DE REPUESTOS SELECCIONADOS */}
                <section className="p-4 sm:p-5 bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#E2DCD3]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#211E1C] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1817]">
                        Repuestos Seleccionados ({cartItems.length})
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-[#D4A359] bg-[#211E1C] px-2.5 py-0.5 rounded-full border border-[#D4A359]/30">
                      Precios en Bs.
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {cartItems.map((ci, index) => {
                      const item = ci.item;
                      const itemImg =
                        item.image_url ||
                        (item.images && item.images[0]) ||
                        'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
                      const itemTotal = item.price * ci.quantity;

                      return (
                        <div
                          key={`${item.id}-${index}`}
                          className="p-3 bg-[#F5F2EB] rounded-2xl border border-[#E2DCD3] flex gap-3 items-center hover:border-[#D4A359] transition-colors"
                        >
                          <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-[#E2DCD3]">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-xs text-[#1A1817] truncate">
                                  {item.name || item.title}
                                </h5>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="text-[9.5px] font-mono font-bold text-[#D4A359] bg-[#211E1C] px-1.5 py-0.5 rounded">
                                    {item.sku}
                                  </span>
                                  <span className="text-[11px] text-[#5C5650] font-semibold">
                                    Bs. {item.price.toFixed(2)} c/u
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(index)}
                                className="text-[#8C827A] hover:text-red-600 bg-white hover:bg-red-50 border border-[#E2DCD3] rounded-lg p-1 transition-colors cursor-pointer shrink-0"
                                title="Quitar repuesto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E2DCD3]">
                              <div className="flex items-center border border-[#E2DCD3] rounded-full overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, ci.quantity - 1)}
                                  className="px-2.5 py-0.5 text-[#5C5650] hover:bg-[#F5F2EB] text-xs font-black cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="px-2.5 text-xs font-black text-[#1A1817]">
                                  {ci.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(index, ci.quantity + 1)}
                                  className="px-2.5 py-0.5 text-[#5C5650] hover:bg-[#F5F2EB] text-xs font-black cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <span className="text-xs font-black text-[#1A1817]">
                                Bs. {itemTotal.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* 2. FORMULARIO: DIRECCIÓN PARA EL PEDIDO */}
                <section className="p-4 sm:p-5 bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] shadow-xs">
                  <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3.5">
                    <div className="flex items-center gap-2 pb-2.5 border-b border-[#E2DCD3]">
                      <div className="w-7 h-7 rounded-lg bg-[#211E1C] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1817]">
                          DIRECCIÓN PARA EL PEDIDO
                        </h3>
                        <p className="text-[10.5px] text-[#8C827A] font-semibold">
                          Datos del comprador y ciudad de despacho en Bolivia
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Ing. Carlos Méndez"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-[#F5F2EB] focus:bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                          WhatsApp / Teléfono *
                        </label>
                        <div className="flex rounded-xl border border-[#E2DCD3] bg-[#F5F2EB] focus-within:bg-white overflow-hidden focus-within:border-[#D4A359] transition-all">
                          <div
                            className="relative flex items-center gap-1 bg-[#EFEAE2] hover:bg-[#E5DEC9] border-r border-[#E2DCD3] px-2 py-1 select-none shrink-0 cursor-pointer"
                            title="Seleccionar país y código de área"
                          >
                            <span className="text-[9px] font-black text-[#D4A359] bg-[#211E1C] px-1 py-0.5 rounded">
                              {selectedCountry.iso}
                            </span>
                            <span className="text-[11px] font-black text-[#1A1817]">
                              {selectedCountry.code}
                            </span>
                            <ChevronDown className="w-3 h-3 text-[#8C827A]" />
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              aria-label="Código de país para WhatsApp"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            >
                              {COUNTRY_LIST.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.iso} - {c.country} ({c.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            type="tel"
                            required
                            placeholder="Ej. 77012345"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="flex-1 min-w-0 text-xs p-2.5 bg-transparent text-[#1A1817] outline-none font-medium placeholder-[#A89F91]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                          Ciudad Destino *
                        </label>
                        <select
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          className="w-full text-xs p-2.5 bg-[#F5F2EB] focus:bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold cursor-pointer transition-colors"
                        >
                          <option value="La Paz">La Paz / El Alto</option>
                          <option value="Santa Cruz">Santa Cruz</option>
                          <option value="Cochabamba">Cochabamba</option>
                          <option value="Sucre">Sucre</option>
                          <option value="Tarija">Tarija</option>
                          <option value="Oruro">Oruro</option>
                          <option value="Potosí">Potosí</option>
                          <option value="Beni">Beni (Trinidad)</option>
                          <option value="Pando">Pando (Cobija)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                        Dirección para el Pedido *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Av. Arce #123 o 'Retiro en Terminal de Flotas'"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-xs p-2.5 bg-[#F5F2EB] focus:bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                        Notas de Protección / Embalaje (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ej. Por favor despachar las varillas en tubo rígido de PVC."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full text-xs p-2.5 bg-[#F5F2EB] focus:bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium transition-colors"
                      ></textarea>
                    </div>
                  </form>
                </section>

                {/* 3. PAGO MEDIANTE QR SIMPLE (SI ESTÁ ACTIVO) */}
                {showPaymentQr && (
                  <section className="p-4 sm:p-5 rounded-3xl bg-[#FAF8F5] border border-[#D4A359] shadow-sm space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#E2DCD3]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/40 flex items-center justify-center">
                          <QrCode className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1817]">
                          PAGO MEDIANTE QR SIMPLE
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQrModal(true)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#161311] hover:text-[#D4A359] cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3 text-[#D4A359]" />
                        <span>Ampliar QR</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3.5 bg-[#F5F2EB] p-3 rounded-2xl border border-[#E2DCD3]">
                      <div
                        onClick={() => setShowQrModal(true)}
                        className="relative w-24 h-24 bg-white p-1.5 rounded-xl border border-[#D4A359] flex items-center justify-center shrink-0 cursor-pointer group"
                      >
                        <img
                          src={paymentQrUrl}
                          alt="Código QR de Pago Hobby Bolivia"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="flex-1 text-[11px] text-[#5C5650] whitespace-pre-line leading-relaxed">
                        {paymentQrInstructions}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Sticky Sidebar Footer: TOTAL A PAGAR & Finalizar Pedido */}
          {cartItems.length > 0 && !orderCompleted && (
            <footer className="shrink-0 border-t border-[#2D2622] bg-[#161311] text-[#FAF8F5] p-4 sm:p-5 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FAF8F5] block">
                    TOTAL A PAGAR:
                  </span>
                  <span className="text-[10.5px] text-[#D4A359] font-bold">
                    Las instrucciones de compra se coordinarán por WhatsApp
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-[#D4A359]">
                  Bs. {subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3.5 px-5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#D4A359]/20 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Registrando Orden...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Finalizar Pedido por WhatsApp</span>
                  </>
                )}
              </button>
            </footer>
          )}
        </aside>
      </div>

      {/* Modal Zoom QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-[#161311]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 max-w-sm w-full border border-[#D4A359] shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-3">
              <div className="text-left">
                <h4 className="font-black text-sm uppercase text-[#1A1817]">Código QR Simple</h4>
                <p className="text-[11px] text-[#8C827A]">Hobby Bolivia</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#EFEAE2] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#E2DCD3] inline-block">
              <img
                src={paymentQrUrl}
                alt="QR Simple Bolivia"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase text-[#8C827A] block">TOTAL A PAGAR:</span>
              <span className="text-2xl font-black text-[#161311]">
                Bs. {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="text-[11px] text-[#5C5650] whitespace-pre-line text-left bg-[#F5F2EB] p-3 rounded-xl border border-[#E2DCD3]">
              {paymentQrInstructions}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Listo, Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
