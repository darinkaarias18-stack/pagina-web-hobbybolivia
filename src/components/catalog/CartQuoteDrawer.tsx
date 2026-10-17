'use client';

import React, { useState } from 'react';
import { X, Trash2, Send, MapPin, ShoppingBag, Loader2, Plane, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function CartQuoteDrawer() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, isDrawerOpen, closeDrawer, subtotal } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('Santa Cruz de la Sierra');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{ orderCode: string; whatsappUrl: string } | null>(null);

  if (!isDrawerOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setErrorMessage('Por favor completa los datos obligatorios (nombre, celular y ciudad/dirección).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          recipientName: customerName,
          deliveryDate: new Date().toISOString().split('T')[0],
          deliveryTimeSlot: `Envío a ${deliveryCity}`,
          deliveryAddress: `${deliveryCity} - ${deliveryAddress}`,
          cardMessage: customerNotes,
          items: cartItems,
          total: subtotal
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo registrar el pedido');
      }

      setOrderSuccess({
        orderCode: data.orderCode,
        whatsappUrl: data.whatsappUrl
      });

      // Clear cart
      clearCart();

      // Automatically open WhatsApp in new tab
      window.open(data.whatsappUrl, '_blank');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error inesperado al generar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-[#f5f1e8] text-[#10202f] w-full max-w-lg h-full flex flex-col shadow-2xl relative border-l border-[#10202f]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#10202f] flex items-center justify-between bg-[#efe9dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#10202f] text-[#f2b705] flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#10202f]">Carrito de Compras</h2>
              <p className="text-xs text-[#6b7480] font-medium">Hobby Bolivia • Aeromodelismo & RC</p>
            </div>
          </div>

          <button
            onClick={closeDrawer}
            className="w-8 h-8 rounded-full border border-[#10202f] flex items-center justify-center text-[#10202f] hover:bg-[#10202f] hover:text-[#f5f1e8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {orderSuccess ? (
            <div className="bg-white border border-[#10202f] rounded-xl p-6 text-center space-y-4 my-auto">
              <div className="w-16 h-16 rounded-full bg-[#2f6f4e] text-white flex items-center justify-center mx-auto text-2xl shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#10202f]">
                ¡Pedido #{orderSuccess.orderCode} Registrado!
              </h3>
              <p className="text-sm text-[#6b7480] leading-relaxed">
                Tu cotización fue guardada en el backend de Hobby Bolivia. Se abrió la ventana de WhatsApp para coordinar el despacho inmediato a tu ciudad y la forma de pago (QR o transferencia).
              </p>

              <a
                href={orderSuccess.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-bold text-sm shadow-md transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Reabrir WhatsApp Ahora</span>
              </a>

              <button
                onClick={() => {
                  setOrderSuccess(null);
                  closeDrawer();
                }}
                className="text-xs text-[#6b7480] hover:text-[#10202f] font-semibold underline mt-2 block mx-auto"
              >
                Seguir explorando el catálogo
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ebe4d3] text-2xl flex items-center justify-center mx-auto text-[#10202f]">
                <Plane className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#10202f]">Tu carrito está vacío</h3>
              <p className="text-sm text-[#6b7480] max-w-xs mx-auto">
                Selecciona conectores, bellcranks, alambres push rod o repuestos para agregarlos a tu pedido.
              </p>
              <button
                onClick={closeDrawer}
                className="btn-pill btn-primary-hb text-sm font-bold"
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <>
              {/* Selected Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#6b7480] uppercase tracking-wider">
                  <span>Productos en carrito ({cartItems.length})</span>
                  <button onClick={clearCart} className="text-[#b3261e] hover:underline text-xs">
                    Vaciar todo
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cartItems.map((ci, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 p-3 rounded-lg border border-[#dcd5c4] bg-white hover:border-[#10202f] transition-colors"
                    >
                      <div className="w-16 h-16 rounded bg-[#ebe4d3] p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ci.item.images[0] || 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'}
                          alt={ci.item.title}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7480] block">
                          {ci.item.brand || 'Dubro'}
                        </span>
                        <h4 className="font-serif text-sm font-medium text-[#10202f] truncate">
                          {ci.item.title}
                        </h4>
                        <div className="text-xs font-bold text-[#10202f] font-mono">
                          $us {(Number(ci.item.price) * ci.quantity).toFixed(2)}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-[#6b7480] hover:text-[#b3261e] transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center border border-[#10202f] rounded-full overflow-hidden bg-white text-xs">
                          <button
                            onClick={() => updateQuantity(idx, ci.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-[#ebe4d3] font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-bold text-[#10202f]">{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(idx, ci.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-[#ebe4d3] font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="p-3.5 rounded-lg bg-[#efe9dc] border border-[#dcd5c4] flex items-center justify-between">
                  <span className="text-sm font-bold text-[#10202f]">Total Estimado:</span>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-[#10202f] block">
                      $us {subtotal.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-[#6b7480]">
                      Aprox. Bs. {(subtotal * 6.96).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* RC Checkout Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-[#dcd5c4]">
                <div className="font-bold text-xs uppercase tracking-wider text-[#8a6a00] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8a6a00]" />
                  <span>Datos para el Envío y Facturación</span>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-[#b3261e]/10 border border-[#b3261e] text-[#b3261e] text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#10202f] block mb-1">
                      Nombre Completo*
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs text-[#10202f] outline-none focus:ring-2 focus:ring-[#f2b705]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#10202f] block mb-1">
                      Teléfono / WhatsApp*
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 77012345"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs text-[#10202f] outline-none focus:ring-2 focus:ring-[#f2b705]"
                    />
                  </div>
                </div>

                {/* City Selection */}
                <div>
                  <label className="text-xs font-bold text-[#10202f] block mb-1">
                    Ciudad de Destino*
                  </label>
                  <select
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs text-[#10202f] outline-none focus:ring-2 focus:ring-[#f2b705]"
                  >
                    <option value="Santa Cruz de la Sierra">Santa Cruz de la Sierra (Entrega local o recojo)</option>
                    <option value="La Paz / El Alto">La Paz / El Alto (Envío vía Courier o Terminal)</option>
                    <option value="Cochabamba">Cochabamba (Envío vía Flota o Courier)</option>
                    <option value="Sucre">Sucre</option>
                    <option value="Tarija">Tarija</option>
                    <option value="Oruro">Oruro</option>
                    <option value="Potosí">Potosí</option>
                    <option value="Beni / Trinidad">Beni / Trinidad</option>
                    <option value="Pando / Cobija">Pando / Cobija</option>
                  </select>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="text-xs font-bold text-[#10202f] block mb-1">
                    Dirección o Punto de Entrega*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Calle Junín #234 o Envío a Terminal de Buses"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs text-[#10202f] outline-none focus:ring-2 focus:ring-[#f2b705]"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold text-[#10202f] block mb-1">
                    Notas adicionales (Modelo de avión, motor, requerimientos)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Para modelo Trainer .40 o avión acrobático..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs text-[#10202f] outline-none focus:ring-2 focus:ring-[#f2b705]"
                  />
                </div>

                {/* Submit WhatsApp Order */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#f2b705]" />
                        <span>Registrando Pedido...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#f2b705]" />
                        <span>CONFIRMAR Y CONSULTAR POR WHATSAPP</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-[#6b7480] text-center mt-2">
                    El pedido se guarda en la base de datos de Hobby Bolivia y abre WhatsApp con el detalle listo para confirmar.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
