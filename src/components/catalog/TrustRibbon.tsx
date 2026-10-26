'use client';

import React from 'react';
import { Truck, QrCode, RefreshCw, Award } from 'lucide-react';

export function TrustRibbon() {
  const items = [
    {
      icon: Truck,
      title: "Envíos a Toda Bolivia",
      desc: "Despachos protegidos en tubos de PVC por encomienda y courier"
    },
    {
      icon: QrCode,
      title: "Pagos QR Inmediatos",
      desc: "Transferencia bancaria directa en Bolivianos (Bs.) sin comisiones"
    },
    {
      icon: RefreshCw,
      title: "Garantía de Compatibilidad",
      desc: "Soporte preventa y reemplazo directo si el paso de rosca no calza"
    },
    {
      icon: Award,
      title: "Piezas 100% Genuinas",
      desc: "Componentes importados oficiales Dubro, Great Planes y APC"
    }
  ];

  return (
    <section className="py-8 bg-[#1A1715] border-y border-[#2D2622] text-[#FAF8F5]">
      <div className="w-full max-w-[1320px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D4A359]/25">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-4 sm:px-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-6 h-6 text-[#D4A359]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-[#FAF8F5] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#A89F91] mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
