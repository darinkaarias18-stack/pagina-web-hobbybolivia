'use client';

import React from 'react';
import type { Category } from '@/lib/types';

interface CategoryTilesGridProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryTilesGrid({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryTilesGridProps) {
  // 12 visual categories matching the exact 2x6 grid from the reference screenshot
  const displayCategories = [
    {
      name: 'Conectores E/Z',
      count: 12,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'
    },
    {
      name: 'Bellcranks 90º',
      count: 8,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/d315fa511a-dubq2000tn-t.webp'
    },
    {
      name: 'Varillaje Push Rod',
      count: 15,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp'
    },
    {
      name: 'Clevises de Mando',
      count: 10,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/7fcaad4571-dubq9306-large-t.webp'
    },
    {
      name: 'Mini E/Z Conectores',
      count: 9,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/19df1961af-dubq8450-t.webp'
    },
    {
      name: 'Alambres Acerados',
      count: 14,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/ac56aa1747-dubq9108-large-t.webp'
    },
    {
      name: 'Alambres Rosca 2mm',
      count: 11,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/434eae12fc-aib62993-large-t.webp'
    },
    {
      name: 'Micro Bellcranks',
      count: 7,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/c5452292f7-dubq2005-t.webp'
    },
    {
      name: 'Varillas 4-40 HD',
      count: 13,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1474-large-t.webp'
    },
    {
      name: 'Varillas 2-56 12"',
      count: 16,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/7f5b761d4f-dubq1464-large-t.webp'
    },
    {
      name: 'Hélices y Spinners',
      count: 18,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/c2253e5048-gpmq3741-t.webp'
    },
    {
      name: 'Bocinas y Bisagras',
      count: 22,
      slug: 'conectores-y-linea-de-control',
      imageUrl: 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'
    }
  ];

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-10 pb-6" id="categorias">
      {/* Title with blue underline (Galba style) */}
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#162544] section-heading-galba">
          Categorías
        </h2>
      </div>

      {/* Thin horizontal line */}
      <div className="w-full border-t border-[#e2e8f0] mb-8" />

      {/* 2 rows of 6 categories grid (Exact Galba format) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-8">
        {displayCategories.map((cat, idx) => (
          <button
            key={`${cat.name}-${idx}`}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1 focus:outline-none"
          >
            {/* Image Circle/Container on clean white */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg bg-white border border-[#f1f5f9] group-hover:border-[#cbd5e1] group-hover:shadow-md transition-all flex items-center justify-center p-3 mb-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                loading="lazy"
              />
            </div>

            {/* Label and Count Badge in Galba style: Herramientas (387) */}
            <div className="text-xs sm:text-[13px] font-medium text-[#1e293b] leading-tight">
              <span className="group-hover:text-[#2563eb] transition-colors">{cat.name}</span>{' '}
              <span className="font-bold text-[#b45309] font-mono">({cat.count})</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
