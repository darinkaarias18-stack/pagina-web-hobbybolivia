'use client';

import React, { useState } from 'react';
import { X, Send, Wrench, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CustomArrangementModal() {
  const { isCustomModalOpen, closeCustomModal } = useCart();

  const [partCategory, setPartCategory] = useState('Conectores y Mandos');
  const [modelType, setModelType] = useState('Avión Nitro / Glow');
  const [notes, setNotes] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  if (!isCustomModalOpen) return null;

  const handleSendCustomQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `✈️ *CONSULTA TÉCNICA / PEDIDO ESPECIAL HOBBY BOLIVIA* ✈️
Hola Hobby Bolivia, deseo cotizar repuestos o asesoría para mi modelo:

👤 *Nombre:* ${clientName || 'Cliente'}
📱 *Teléfono:* ${clientPhone || 'No especificado'}
⚙️ *Categoría del repuesto:* ${partCategory}
🛫 *Tipo de modelo RC:* ${modelType}
📝 *Descripción del repuesto o consulta:* ${notes || 'Quisiera saber disponibilidad'}

¿Podrían indicarme si tienen stock o fecha de llegada? Muchas gracias.`;

    const whatsappUrl = `https://wa.me/59177293446?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
    closeCustomModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f5f1e8] text-[#10202f] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#10202f] flex flex-col relative">
        <button
          onClick={closeCustomModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-[#10202f] flex items-center justify-center bg-white hover:bg-[#10202f] hover:text-[#f5f1e8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSendCustomQuote} className="p-6 space-y-5">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8a6a00] uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5" />
              Asesoría Técnica y Repuestos a Pedido
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#10202f]">
              ¿Buscas un repuesto específico?
            </h3>
            <p className="text-xs text-[#6b7480]">
              Indícanos la parte, medida o modelo de avión que necesitas y te ayudamos a encontrarla de inmediato.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-[#10202f] block mb-1">
                Tu Nombre*
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Andrés Morales"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs outline-none focus:ring-2 focus:ring-[#f2b705]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#10202f] block mb-1">
                WhatsApp / Teléfono*
              </label>
              <input
                type="tel"
                required
                placeholder="Ej. 78901234"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs outline-none focus:ring-2 focus:ring-[#f2b705]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#10202f] block mb-1">
                  Categoría
                </label>
                <select
                  value={partCategory}
                  onChange={(e) => setPartCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs outline-none focus:ring-2 focus:ring-[#f2b705]"
                >
                  <option value="Conectores y Mandos">Conectores y Mandos</option>
                  <option value="Hélices y Conos">Hélices y Conos</option>
                  <option value="Servos y Electrónica">Servos y Electrónica</option>
                  <option value="Motores y Combustible">Motores y Combustible</option>
                  <option value="Tren de Aterrizaje">Tren de Aterrizaje</option>
                  <option value="Herramientas y Pegamentos">Herramientas y Pegamentos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#10202f] block mb-1">
                  Tipo de Modelo
                </label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs outline-none focus:ring-2 focus:ring-[#f2b705]"
                >
                  <option value="Avión Glow / Nitro">Avión Glow / Nitro</option>
                  <option value="Avión Eléctrico / Foam">Avión Eléctrico / Foam</option>
                  <option value="Avión Gasolina Gran Escala">Avión Gasolina Gran Escala</option>
                  <option value="Helicóptero RC">Helicóptero RC</option>
                  <option value="Drone / Multirrotor">Drone / Multirrotor</option>
                  <option value="Auto / Camión RC">Auto / Camión RC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#10202f] block mb-1">
                Detalles del Repuesto o Medida
              </label>
              <textarea
                rows={3}
                placeholder="Ej. Varilla con rosca 2-56 de 24 pulgadas o bocinas de mando para alerones..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#10202f] rounded bg-white text-xs outline-none focus:ring-2 focus:ring-[#f2b705]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Send className="w-4 h-4 text-[#f2b705]" />
            <span>Consultar Disponibilidad por WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
