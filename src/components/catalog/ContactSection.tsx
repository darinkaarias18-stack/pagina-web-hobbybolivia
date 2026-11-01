'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, Plane, Sparkles } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

interface ContactSectionProps {
  config?: SiteConfig | null;
}

export function ContactSection({ config }: ContactSectionProps) {
  const whatsappNumber = config?.whatsappNumber || '+591 77293446';
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '') || '59177293446';
  const email = config?.contactEmail || 'contacto@hobbybolivia.com';

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    reason: 'Consulta general de producto',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleWhatsAppSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      alert('Por favor, ingresa tu nombre y mensaje.');
      return;
    }

    const text = `Hola Hobby Bolivia,\n\nMi nombre es: ${formData.name.trim()}\nContacto/Teléfono: ${formData.contact.trim() || 'No especificado'}\nMotivo: ${formData.reason}\n\nMensaje:\n${formData.message.trim()}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <section id="contacto" className="scroll-mt-20 py-16 bg-[#FAF8F5] border-t border-[#E2DCD3]">
      <div className="w-full max-w-[1320px] mx-auto px-4">

        {/* Encabezado de Sección */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#211E1C] text-[#D4A359] text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
            <Plane className="w-3.5 h-3.5 -rotate-45" />
            <span>Atención Directa · Canales Oficiales</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            Contáctate con Nosotros
          </h2>
          <p className="mt-2 text-sm text-[#5C5650] leading-relaxed">
            Escríbenos directamente o envíanos un mensaje desde este formulario.
          </p>
        </div>

        {/* Cuadrícula Principal: Tarjeta de Información + Tarjeta de Mensaje */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Columna Izquierda: Tarjetas Rápidas de WhatsApp y Correo (5 cols) */}
          <div className="lg:col-span-5 space-y-4">

            {/* Tarjeta WhatsApp Oficial */}
            <div className="bg-white rounded-2xl p-6 border-2 border-emerald-600/40 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Canal Más Rápido
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      En línea
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 mt-1.5">
                    WhatsApp Oficial
                  </h3>
                  <p className="text-xs text-[#5C5650] mt-0.5">
                    Consultas inmediatas, fotos de producto y confirmación de pedidos.
                  </p>
                  <p className="font-mono font-bold text-sm text-neutral-900 mt-2">
                    {whatsappNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Tarjeta Correo Oficial */}
            <div className="bg-white rounded-2xl p-6 border-2 border-amber-700/50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                  <Mail className="w-6 h-6 text-[#D4A359]" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Soporte Formal
                  </span>
                  <h3 className="font-bold text-base text-neutral-900 mt-1.5">
                    Correo Electrónico
                  </h3>
                  <p className="text-xs text-[#5C5650] mt-0.5">
                    Cotizaciones corporativas, solicitudes de importación y facturación.
                  </p>
                  <p className="font-mono font-bold text-xs sm:text-sm text-neutral-900 mt-2 break-all">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Información Operativa & Despacho */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3 text-xs text-[#5C5650]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span><strong>Ubicación:</strong> La Paz, Bolivia (Envíos a los 9 departamentos).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span><strong>Horario de Atención:</strong> Lunes a Sábado de 09:00 a 19:00.</span>
              </div>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta para Enviar un Mensaje (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-700/60 shadow-md relative overflow-hidden">

              <div className="mb-6 pb-4 border-b border-[#E2DCD3] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900">
                    Enviar un Mensaje Directo
                  </h3>
                  <p className="text-xs text-[#5C5650] mt-0.5">
                    Completa tus datos y envíanos tu requerimiento al instante por WhatsApp.
                  </p>
                </div>
                <div className="hidden sm:flex w-10 h-10 rounded-2xl bg-amber-50 text-[#D4A359] items-center justify-center border border-[#D4A359]/30">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">¡Mensaje preparado con éxito!</strong>
                    <span>Tu consulta ha sido canalizada. Te responderemos a la brevedad.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleWhatsAppSend} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo Nombre */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
                      Tu Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                    />
                  </div>

                  {/* Campo Contacto */}
                  <div>
                    <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
                      Teléfono o Correo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. +591 7XXXXXXX o email@ejemplo.com"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="w-full text-xs px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                {/* Motivo de la Consulta */}
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
                    Motivo de la Consulta
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full text-xs px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-neutral-900 outline-none transition-all font-medium cursor-pointer"
                  >
                    <option value="Consulta general de producto">Consulta general sobre repuesto / producto</option>
                    <option value="Compatibilidad técnica de roscas/motores">Asesoría sobre compatibilidad de roscas o motores</option>
                    <option value="Cotización por volumen o club">Cotización por mayor o pedidos especiales</option>
                    <option value="Consulta sobre envíos a departamentos">Consulta de envíos a departamentos (Flotas / Courier)</option>
                    <option value="Otro requerimiento">Otro requerimiento</option>
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-xs font-semibold text-amber-800 mb-1.5 uppercase tracking-wide">
                    Tu Mensaje o Consulta *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Escribe aquí los detalles del producto que buscas, modelo de tu avión o tu consulta técnica..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-neutral-900 outline-none transition-all leading-relaxed resize-none placeholder:text-neutral-400"
                  ></textarea>
                </div>

                {/* Botón de Envío */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>Enviar por WhatsApp</span>
                  </button>
                </div>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

