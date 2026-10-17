'use client';

import React from 'react';

export function ValuePropsRibbon() {
  const props = [
    {
      icon: (
        <svg className="w-8 h-8 text-white stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M1 3h15v13H1z" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
      title: 'Envíos a todo el país',
      subtitle: 'La Paz, Cbba, SCZ y más'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
      title: 'Atención Inmediata',
      subtitle: 'Asesoría y WhatsApp'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      title: 'Entrega rápida',
      subtitle: '1 a 2 días hábiles'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      title: 'Pagos Seguros',
      subtitle: 'QR Simple y Bancos'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white stroke-current fill-none" strokeWidth="1.6" viewBox="0 0 24 24">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      title: 'Variedad de Marcas',
      subtitle: 'Dubro, Great Planes, etc.'
    }
  ];

  return (
    <section className="w-full bg-[#162544] text-white py-6 my-10 border-y border-[#1d2b53]" aria-label="Beneficios de compra">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-4 items-center">
          {props.map((p, idx) => (
            <div
              key={p.title}
              className={`flex items-center gap-3.5 ${
                idx === 4 ? 'col-span-2 md:col-span-1 justify-center md:justify-start' : ''
              }`}
            >
              <div className="flex-shrink-0 opacity-95">
                {p.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-[13px] font-bold text-white leading-tight">
                  {p.title}
                </span>
                <span className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  {p.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
