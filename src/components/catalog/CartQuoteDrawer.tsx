'use client';

import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, MapPin, Phone, User, FileText, Send, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig } from '@/lib/types';

interface CartQuoteDrawerProps {
  config?: SiteConfig | null;
}

export function CartQuoteDrawer({ config }: CartQuoteDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity, clearCart, isDrawerOpen, closeDrawer, subtotal, totalCount } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Santa Cruz');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const whatsapp = config?.whatsappNumber || "+591 77293446";
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    try {
      // 1. Save quote/order in database via API
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
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
      message += `*Teléfono:* ${customerPhone}\n`;
      message += `*Ciudad de Envío:* ${deliveryCity}\n`;
      message += `*Dirección / Flota:* ${deliveryAddress}\n`;
      if (customerNotes.trim()) {
        message += `*Notas:* ${customerNotes}\n`;
      }
      message += `------------------------------------\n`;
      message += `*DETALLE DE PIEZAS:*\n`;

      cartItems.forEach((ci, idx) => {
        const itemTotal = ci.item.price * ci.quantity;
        message += `${idx + 1}. ${ci.item.name} (${ci.item.sku})\n`;
        message += `   Cant: ${ci.quantity} x Bs. ${ci.item.price.toFixed(2)} = Bs. ${itemTotal.toFixed(2)}\n`;
      });

      message += `------------------------------------\n`;
      message += `*TOTAL A PAGAR:* Bs. ${subtotal.toFixed(2)}\n`;
      message += `------------------------------------\n`;
      message += `Por favor coordinar pago mediante QR Simple y número de guía de despacho.`;

      // 3. Clear cart and show completion
      setOrderCompleted(orderCode);
      clearCart();

      // 4. Open WhatsApp
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank');

    } catch (err) {
      console.error("Error creating quote order:", err);
      alert("Hubo un problema al procesar el pedido. Intentaremos abrir WhatsApp de todas formas.");
      const waUrl = `https://wa.me/${cleanPhone}?text=Hola%20Hobby%20Bolivia,%20quisiera%20hacer%20un%20pedido%20de%20repuestos.`;
      window.open(waUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-[#161311]/70 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E2DCD3] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#2D2622] bg-[#161311] text-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#F85606] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-[#FAF8F5]">
                  Tu Carrito de Repuestos
                </h3>
                <p className="text-[10px] text-[#D4A359] font-bold">
                  {totalCount} {totalCount === 1 ? 'pieza agregada' : 'piezas agregadas'}
                </p>
              </div>
            </div>

            <button
              onClick={closeDrawer}
              type="button"
              className="p-1.5 rounded-full text-[#A89F91] hover:text-[#FAF8F5] hover:bg-[#211E1C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            
            {orderCompleted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#3E7B44]/10 text-[#3E7B44] flex items-center justify-center mx-auto border border-[#3E7B44]/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-[#1A1817] uppercase tracking-wide">¡Orden Registrada!</h4>
                <p className="text-xs text-[#5C5650] max-w-xs mx-auto">
                  Tu orden con código <strong className="text-[#1A1817] font-mono">{orderCompleted}</strong> fue enviada para coordinación técnica y despacho.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setOrderCompleted(null);
                      closeDrawer();
                    }}
                    type="button"
                    className="px-6 py-2.5 bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer"
                  >
                    Seguir Navegando
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <ShoppingBag className="w-10 h-10 text-[#D4A359] mx-auto opacity-40" />
                <h4 className="font-extrabold text-sm text-[#1A1817]">Tu carrito está vacío</h4>
                <p className="text-xs text-[#5C5650] max-w-xs mx-auto">
                  Agrega conectores, varillajes o componentes mecánicos desde el catálogo.
                </p>
              </div>
            ) : (
              <>
                {/* List of items */}
                <div className="space-y-3">
                  {cartItems.map((ci, index) => {
                    const item = ci.item;
                    const itemImg = item.image_url || (item.images && item.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
                    const itemTotal = item.price * ci.quantity;

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className="p-3 bg-white rounded-2xl border border-[#E2DCD3] flex gap-3 items-center shadow-xs"
                      >
                        {/* Img on white */}
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
                              <span className="text-[10px] font-mono font-bold text-[#D4A359] block">
                                SKU: {item.sku}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(index)}
                              className="text-[#8C827A] hover:text-red-600 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#EFEAE2]">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-[#E2DCD3] rounded-full overflow-hidden bg-[#FAF8F5]">
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, ci.quantity - 1)}
                                className="px-2.5 py-0.5 text-[#5C5650] hover:bg-white text-xs font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-black text-[#1A1817]">
                                {ci.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(index, ci.quantity + 1)}
                                className="px-2.5 py-0.5 text-[#5C5650] hover:bg-white text-xs font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            {/* Item total */}
                            <span className="text-xs font-black text-[#1A1817]">
                              Bs. {itemTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Customer Checkout Form */}
                <form id="checkout-form" onSubmit={handleCheckout} className="pt-4 border-t border-[#E2DCD3] space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>Datos de Envío en Bolivia</span>
                  </h4>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Méndez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">WhatsApp / Celular *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 77012345"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">Ciudad Destino *</label>
                      <select
                        value={deliveryCity}
                        onChange={(e) => setDeliveryCity(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold"
                      >
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="La Paz">La Paz / El Alto</option>
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="Sucre">Sucre</option>
                        <option value="Tarija">Tarija</option>
                        <option value="Oruro">Oruro</option>
                        <option value="Potosí">Potosí</option>
                        <option value="Beni">Beni</option>
                        <option value="Pando">Pando</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">Dirección o Encomienda *</label>
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
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-[#5C5650] mb-1">Notas / Medidas (Opcional)</label>
                    <textarea
                      rows={2}
                      placeholder="Ej. Por favor verificar que las varillas viajen en tubo rígido de PVC."
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
            <div className="p-4 sm:p-5 border-t border-[#E2DCD3] bg-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#5C5650]">Total Pedido:</span>
                <span className="text-xl font-black text-[#1A1817]">
                  Bs. {subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-full bg-[#F85606] hover:bg-[#E04B00] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F85606]/30 cursor-pointer hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <span>Registrando Orden...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Finalizar Pedido por WhatsApp →</span>
                  </>
                )}
              </button>

              <p className="mt-2 text-[10px] text-center text-[#8C827A]">
                Coordinación directa de pago QR y confirmación de número de guía de transporte.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
