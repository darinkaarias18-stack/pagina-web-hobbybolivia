'use client';

import React from 'react';
import type { Category } from '@/lib/types';

interface SubcategoryCarouselProps {
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory: (slug: string) => void;
}

export function SubcategoryCarousel({
  categories,
  selectedCategorySlug,
  onSelectCategory
}: SubcategoryCarouselProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-slate-100 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Explorar por Colección
          </span>
          {selectedCategorySlug && selectedCategorySlug !== 'all' && (
            <button
              onClick={() => onSelectCategory('all')}
              className="text-xs text-[#E11D48] hover:underline font-semibold"
            >
              Ver todas las categorías
            </button>
          )}
        </div>

        {/* Horizontal scroll list */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
          {/* "Ver Todo" Card */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all flex-shrink-0 text-left ${
              !selectedCategorySlug || selectedCategorySlug === 'all'
                ? 'border-[#E11D48] bg-rose-50/70 shadow-xs'
                : 'border-slate-200 hover:border-rose-300 bg-white hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-rose-500 to-rose-400 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              🌸
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">Todo el Catálogo</div>
              <div className="text-[11px] text-slate-500 font-medium">Ver todos los arreglos</div>
            </div>
          </button>

          {/* Category Cards */}
          {categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-3 p-2 pr-4 rounded-xl border transition-all flex-shrink-0 text-left group ${
                  isSelected
                    ? 'border-[#E11D48] bg-rose-50/80 shadow-xs ring-1 ring-[#E11D48]'
                    : 'border-slate-200 hover:border-rose-300 bg-white hover:bg-slate-50'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=200"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div>
                  <div
                    className={`font-bold text-xs leading-tight line-clamp-1 transition-colors ${
                      isSelected ? 'text-[#E11D48]' : 'text-slate-800 group-hover:text-[#E11D48]'
                    }`}
                  >
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {cat.itemCount !== undefined ? `${cat.itemCount} productos` : 'Ver variedad'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
