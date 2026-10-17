'use client';

import React from 'react';

interface BrandsStripProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export function BrandsStrip({ selectedBrand, onSelectBrand }: BrandsStripProps) {
  const brands = [
    {
      name: 'Dubro',
      tagline: 'HARDWARE & ACCESSORIES',
      color: '#dc2626',
      badge: 'DUBRO',
      fontStyle: 'font-black tracking-wider uppercase'
    },
    {
      name: 'Great Planes',
      tagline: 'MODEL MANUFACTURING',
      color: '#1d4ed8',
      badge: 'GREAT PLANES',
      fontStyle: 'font-black tracking-tight italic'
    },
    {
      name: 'Futaba',
      tagline: 'RADIO CONTROL SYSTEMS',
      color: '#e11d48',
      badge: 'Futaba',
      fontStyle: 'font-extrabold tracking-normal'
    },
    {
      name: 'O.S. Engines',
      tagline: 'PRECISION ENGINES',
      color: '#0284c7',
      badge: 'O.S. ENGINES',
      fontStyle: 'font-black tracking-tighter'
    },
    {
      name: 'Tamiya',
      tagline: 'FIRST IN QUALITY AROUND THE WORLD',
      color: '#2563eb',
      badge: 'TAMIYA ★★★',
      fontStyle: 'font-black tracking-widest'
    },
    {
      name: 'Traxxas',
      tagline: 'THE FASTEST NAME IN RADIO CONTROL',
      color: '#ef4444',
      badge: 'TRAXXAS',
      fontStyle: 'font-black italic tracking-tight'
    }
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-8 pb-4" id="marcas">
      {/* Title with blue underline (Galba style) */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#162544] section-heading-galba">
          Marcas
        </h2>
      </div>

      {/* Thin horizontal line */}
      <div className="w-full border-t border-[#e2e8f0] mb-6" />

      {/* Brand Badges / Logos Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 items-center">
        {brands.map((b) => {
          const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
          return (
            <button
              key={b.name}
              type="button"
              onClick={() => onSelectBrand(isSelected ? 'all' : b.name)}
              className={`group h-16 sm:h-20 px-3 py-2 rounded-md border flex flex-col items-center justify-center transition-all bg-white hover:border-[#162544] hover:shadow-md ${
                isSelected
                  ? 'border-[#162544] ring-2 ring-[#162544]/20 shadow-md bg-slate-50'
                  : 'border-[#e2e8f0]'
              }`}
            >
              <span
                className={`text-base sm:text-lg transition-transform group-hover:scale-105 ${b.fontStyle}`}
                style={{ color: b.color }}
              >
                {b.badge}
              </span>
              <span className="text-[9px] text-[#64748b] tracking-wider uppercase font-semibold mt-0.5 truncate max-w-full">
                {b.tagline}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
