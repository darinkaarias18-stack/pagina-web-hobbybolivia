'use client';

import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

export function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "Arq. Marcelo Prado",
      city: "Santa Cruz de la Sierra",
      club: "Club Aeromodelismo El Trompillo",
      comment: "Excelente servicio. Los conectores E/Z Dubro y los alambres push rod 4-40 llegaron perfectamente embalados en tubos de PVC. Cero holguras en mi Extra 300.",
      rating: 5,
      date: "Hace 3 días"
    },
    {
      id: 2,
      name: "Ing. Rodrigo Calvimontes",
      city: "Cochabamba",
      club: "Aeromodelistas del Valle",
      comment: "Hobby Bolivia es la única tienda en el país que maneja stock real de repuestos y roscas métricas/imperiales. Pagué por QR y al día siguiente recogí la encomienda en flota.",
      rating: 5,
      date: "Hace 1 semana"
    },
    {
      id: 3,
      name: "Fernando Siles",
      city: "La Paz",
      club: "Aeromodelismo Altura RC",
      comment: "La atención por WhatsApp es impecable; me asesoraron con el paso de hélice APC y el ESC adecuado para volar a más de 3.600 metros sin sobrecalentar el motor.",
      rating: 5,
      date: "Hace 2 semanas"
    }
  ];

  return (
    <section className="py-16 bg-[#F5F2EB] border-b border-[#E2DCD3]">
      <div className="w-full max-w-[1320px] mx-auto px-4">

        {/* Section Header with Horizontal Lines */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px bg-gradient-to-r from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-20"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A1817] uppercase tracking-wider">
              PILOTOS Y CONSTRUCTORES EN BOLIVIA
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
            <span className="h-px bg-gradient-to-l from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-20"></span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5650] font-medium">
            Testimonios reales de aficionados y expertos de pistas en Santa Cruz, Cochabamba y La Paz.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-[#FAF8F5] rounded-3xl p-7 border border-[#E2DCD3] shadow-sm hover:shadow-xl hover:border-[#D4A359] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-[#D4A359]">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] font-mono text-[#8C827A]">{r.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-[#5C5650] italic leading-relaxed mb-6">
                  &ldquo;{r.comment}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-black text-xs text-[#1A1817]">{r.name}</h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3E7B44]" />
                  </div>
                  <p className="text-[10.5px] text-[#8C827A]">{r.city} • <span className="text-[#D4A359] font-semibold">{r.club}</span></p>
                </div>
                <Quote className="w-6 h-6 text-[#D4A359]/30" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
