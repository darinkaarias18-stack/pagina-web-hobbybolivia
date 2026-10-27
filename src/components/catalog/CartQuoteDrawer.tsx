'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  FileText,
  Send,
  CheckCircle2,
  QrCode,
  Maximize2,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig } from '@/lib/types';

interface CartQuoteDrawerProps {
  config?: SiteConfig | null;
}

const COUNTRY_LIST = [
  { code: '+591', flag: '🇧🇴', country: 'Bolivia', iso: 'BO' },
  { code: '+51', flag: '🇵🇪', country: 'Perú', iso: 'PE' },
  { code: '+54', flag: '🇦🇷', country: 'Argentina', iso: 'AR' },
  { code: '+56', flag: '🇨🇱', country: 'Chile', iso: 'CL' },
  { code: '+55', flag: '🇧🇷', country: 'Brasil', iso: 'BR' },
  { code: '+595', flag: '🇵🇾', country: 'Paraguay', iso: 'PY' },
  { code: '+1', flag: '🇺🇸', country: 'Estados Unidos', iso: 'US' },
  { code: '+34', flag: '🇪🇸', country: 'España', iso: 'ES' },
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

  // Fetch settings dynamically to get the latest QR code uploaded by admin
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSiteConfig(data.data);
        }
      })
      .catch((err) => console.error("Error loading cart settings:", err));
  }, []);

  if (!isDrawerOpen) return null;

  const currentConfig = siteConfig || config;
  const whatsapp = currentConfig?.whatsappNumber || "+591 77293446";
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  const paymentQrUrl = currentConfig?.paymentQrUrl || "/images/payment/qr_simple_hobbybolivia.svg";
  const paymentQrInstructions = currentConfig?.paymentQrInstructions || 
    "Titular: Hobby Bolivia\nBanco: Banco Unión / BCP / BNB\nMoneda: Bolivianos (Bs.)\nEnvía tu comprobante de pago por WhatsApp para procesar tu despacho inmediato.";
  const showPaymentQr = currentConfig?.enablePaymentQr !== false;

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
      message += `*Dirección / Flota:* ${deliveryAddress}\n`;
      if (customerNotes.trim()) {
        message += `*Notas:* ${customerNotes}\n`;
      }
      message += `------------------------------------\n`;
      message += `*REPUETOS SELECCIONADOS (${totalCount} piezas):*\n`;

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
      <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          onClick={closeDrawer}
          className="absolute inset-0 bg-[#161311]/75 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
          <div className="w-screen max-w-lg bg-[#FAF8F5] border-l border-[#E2DCD3] shadow-2xl flex flex-col justify-between">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#2D2622] bg-[#161311] text-[#FAF8F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F85606] flex items-center justify-center text-white shadow-md shadow-[#F85606]/30">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-[#FAF8F5] flex items-center gap-2">
                    <span>TU CARRITO DE REPUESTOS</span>
                  </h3>
                  <p className="text-[11px] text-[#D4A359] font-bold">
                    {totalCount} {totalCount === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    type="button"
                    title="Vaciar carrito"
                    className="text-[11px] text-[#A89F91] hover:text-red-400 font-bold px-2 py-1 rounded hover:bg-[#211E1C] transition-colors cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={closeDrawer}
                  type="button"
                  className="p-1.5 rounded-full text-[#A89F91] hover:text-[#FAF8F5] hover:bg-[#211E1C] transition-colors cursor-pointer"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
              
              {orderCompleted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#3E7B44]/10 text-[#3E7B44] flex items-center justify-center mx-auto border border-[#3E7B44]/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-[#1A1817] uppercase tracking-wide">¡Orden Registrada con Éxito!</h4>
                  <p className="text-xs text-[#5C5650] max-w-xs mx-auto">
                    Tu orden con código <strong className="text-[#1A1817] font-mono">{orderCompleted}</strong> fue enviada por WhatsApp para confirmación de pago y despacho.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setOrderCompleted(null);
                        closeDrawer();
                      }}
                      type="button"
                      className="px-6 py-2.5 bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-md"
                    >
                      Seguir Comprando
                    </button>
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                /* Empty Cart State */
                <div className="py-10 text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#E2DCD3] flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-8 h-8 text-[#D4A359]" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-base text-[#1A1817]">Tu carrito aún está vacío</h4>
                    <p className="text-xs text-[#5C5650] max-w-xs mx-auto leading-relaxed">
                      Elige los conectores, varillajes, hélices o componentes mecánicos que necesitas y haz clic en el botón <strong className="text-[#F85606]">"Añadir"</strong> de cada pieza.
                    </p>
                  </div>

                  {/* Primary CTA to catalog */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleGoToCatalog}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F85606] hover:bg-[#E04B00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#F85606]/30 hover:scale-105 cursor-pointer"
                    >
                      <span>Ir al Catálogo de Repuestos</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Payment Guarantee & QR Info */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E2DCD3] text-left space-y-2 mt-6">
                    <div className="flex items-center gap-2 text-xs font-black uppercase text-[#1A1817]">
                      <QrCode className="w-4 h-4 text-[#D4A359]" />
                      <span>Cobros con QR Simple Bolivia</span>
                    </div>
                    <p className="text-[11px] text-[#5C5650] leading-relaxed">
                      Aceptamos transferencias inmediatas vía QR Simple desde cualquier entidad financiera de Bolivia (Banco Unión, BCP, BNB, Banco Sol, Mercantil Santa Cruz, etc.).
                    </p>
                    <div className="pt-1 flex items-center gap-2 text-[10px] text-[#3E7B44] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Envíos blindados con número de guía a todo el país</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* ========================================================
                      1. LISTA COMPLETA DE ITEMS ELEGIDOS PARA COMPRAR
                  ======================================================== */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-black uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Repuestos Seleccionados ({cartItems.length}):</span>
                      </span>
                      <span className="text-[11px] text-[#8C827A] font-semibold">
                        Precios en Bs.
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {cartItems.map((ci, index) => {
                        const item = ci.item;
                        const itemImg = item.image_url || (item.images && item.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
                        const itemTotal = item.price * ci.quantity;

                        return (
                          <div
                            key={`${item.id}-${index}`}
                            className="p-3 bg-white rounded-2xl border border-[#E2DCD3] flex gap-3 items-center shadow-xs hover:border-[#D4A359] transition-colors"
                          >
                            {/* Product Image on Clean White Container */}
                            <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-[#EBE5DB]">
                              <img
                                src={itemImg}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <div>
                                  <h5 className="font-extrabold text-xs text-[#1A1817] line-clamp-1">
                                    {item.name || item.title}
                                  </h5>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-mono font-bold text-[#D4A359] bg-[#FAF8F5] px-1.5 py-0.2 rounded border border-[#E2DCD3]">
                                      SKU: {item.sku}
                                    </span>
                                    <span className="text-[10.5px] text-[#5C5650] font-semibold">
                                      Bs. {item.price.toFixed(2)} c/u
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeFromCart(index)}
                                  className="text-[#8C827A] hover:text-red-600 transition-colors p-1 cursor-pointer"
                                  title="Quitar repuesto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#EFEAE2]">
                                {/* Quantity Stepper */}
                                <div className="flex items-center border border-[#E2DCD3] rounded-full overflow-hidden bg-[#FAF8F5]">
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(index, ci.quantity - 1)}
                                    className="px-2.5 py-0.5 text-[#5C5650] hover:bg-white text-xs font-bold cursor-pointer transition-colors"
                                    title="Disminuir"
                                  >
                                    -
                                  </button>
                                  <span className="px-2.5 text-xs font-black text-[#1A1817]">
                                    {ci.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateQuantity(index, ci.quantity + 1)}
                                    className="px-2.5 py-0.5 text-[#5C5650] hover:bg-white text-xs font-bold cursor-pointer transition-colors"
                                    title="Aumentar"
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Item Total */}
                                <div className="text-right">
                                  <span className="text-xs font-black text-[#1A1817]">
                                    Bs. {itemTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Subtotal Banner */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E2DCD3] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5C5650]">Subtotal de piezas:</span>
                      <span className="text-sm font-black text-[#1A1817]">
                        Bs. {subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* ========================================================
                      2. ESPACIO PARA PUBLICAR EL QR (ADMIN / QR SIMPLE)
                  ======================================================== */}
                  {showPaymentQr && (
                    <div className="p-4 rounded-2xl bg-white border border-[#D4A359] shadow-sm space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-[#EFEAE2]">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[#F85606]/10 text-[#F85606]">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1817]">
                              PAGO MEDIANTE QR SIMPLE (BOLIVIA)
                            </h4>
                            <p className="text-[10px] text-[#8C827A]">
                              Escanea desde la app de cualquier banco boliviano
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-black uppercase bg-[#3E7B44]/10 text-[#3E7B44] px-2 py-0.5 rounded-full border border-[#3E7B44]/20">
                          Inmediato
                        </span>
                      </div>

                      {/* QR Display Card */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DCD3]">
                        {/* QR Image with zoom trigger */}
                        <div
                          onClick={() => setShowQrModal(true)}
                          className="relative w-36 h-36 bg-white p-2 rounded-xl border border-[#D4A359] flex items-center justify-center shrink-0 cursor-pointer group shadow-xs hover:shadow-md transition-shadow"
                          title="Clic para ver QR en grande"
                        >
                          <img
                            src={paymentQrUrl}
                            alt="Código QR de Pago Hobby Bolivia"
                            className="max-h-full max-w-full object-contain"
                          />
                          <div className="absolute inset-0 bg-[#161311]/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black gap-1">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Ampliar</span>
                          </div>
                        </div>

                        {/* Instructions & Bank Data */}
                        <div className="flex-1 space-y-2 text-left">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#8C827A] block">
                              Monto exacto a transferir:
                            </span>
                            <span className="text-lg font-black text-[#1A1817]">
                              Bs. {subtotal.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#5C5650] whitespace-pre-line leading-relaxed bg-white p-2 rounded-lg border border-[#EBE5DB]">
                            {paymentQrInstructions}
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowQrModal(true)}
                            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#D4A359] hover:text-[#C69755] cursor-pointer"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Ver código QR en pantalla completa</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#8C827A] leading-tight">
                        💡 <strong>Pasos:</strong> Realiza el pago con tu app bancaria y adjunta la captura o comprobante en el chat de WhatsApp al presionar el botón de abajo.
                      </p>
                    </div>
                  )}

                  {/* ========================================================
                      3. FORMULARIO DE DATOS DE ENVÍO
                  ======================================================== */}
                  <form id="checkout-form" onSubmit={handleCheckout} className="pt-2 border-t border-[#E2DCD3] space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>Datos para la Entrega en Bolivia</span>
                    </h4>

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
                        className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">
                          WhatsApp / Teléfono *
                        </label>
                        <div className="flex rounded-xl border border-[#E2DCD3] bg-white overflow-hidden focus-within:border-[#D4A359] focus-within:ring-1 focus-within:ring-[#D4A359] transition-all">
                          {/* Identificador de País con Bandera y Código */}
                          <div
                            className="relative flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] border-r border-[#E2DCD3] px-2.5 py-1 select-none shrink-0 transition-colors cursor-pointer"
                            title="Seleccionar país y código de área"
                          >
                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                            <span className="text-xs font-black text-[#1A1817]">{selectedCountry.code}</span>
                            <ChevronDown className="w-3 h-3 text-[#8C827A]" />
                            <select
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              aria-label="Código de país para WhatsApp"
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            >
                              {COUNTRY_LIST.map((c) => (
                                <option key={c.code} value={c.code}>
                                  {c.flag} {c.country} ({c.code})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Campo de Número */}
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
                          className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold cursor-pointer"
                        >
                          <option value="Santa Cruz">Santa Cruz</option>
                          <option value="La Paz">La Paz / El Alto</option>
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
                        Dirección o Encomienda *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Calle Los Pozos #123 o 'Retiro en Terminal de Flotas'"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium"
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
                        className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium"
                      ></textarea>
                    </div>
                  </form>
                </>
              )}

            </div>

            {/* Footer Subtotal & Action */}
            {cartItems.length > 0 && !orderCompleted && (
              <div className="p-4 sm:p-5 border-t border-[#E2DCD3] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#5C5650] block">
                      Total del Pedido:
                    </span>
                    <span className="text-[10px] text-[#3E7B44] font-bold">
                      ✓ Pago por QR Simple habilitado
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#1A1817]">
                    Bs. {subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-full bg-[#F85606] hover:bg-[#E04B00] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#F85606]/30 cursor-pointer hover:scale-[1.01] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registrando Orden...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Finalizar Pedido</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-[#8C827A]">
                  Al presionar se abrirá WhatsApp con el resumen de tu pedido para coordinar el comprobante QR y el número de guía de envío.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modal Zoom QR */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-[#161311]/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#D4A359] shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-3">
              <div className="text-left">
                <h4 className="font-black text-sm uppercase text-[#1A1817]">Código QR Simple</h4>
                <p className="text-[11px] text-[#8C827A]">Hobby Bolivia</p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#E2DCD3] inline-block">
              <img
                src={paymentQrUrl}
                alt="QR Simple Bolivia"
                className="w-64 h-64 object-contain mx-auto"
              />
            </div>

            <div className="text-center space-y-1">
              <span className="text-xs text-[#8C827A] block">Total a pagar:</span>
              <span className="text-2xl font-black text-[#F85606]">
                Bs. {subtotal.toFixed(2)}
              </span>
            </div>

            <div className="text-[11px] text-[#5C5650] whitespace-pre-line text-left bg-slate-50 p-3 rounded-xl border border-slate-200">
              {paymentQrInstructions}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-full bg-[#161311] hover:bg-[#25201C] text-white font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Listo, Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
