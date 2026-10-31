'use client';

import React from 'react';
import type { Category } from '@/lib/types';

interface CategoryHeroBannerProps {
  totalProductsCount: number;
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory?: (slug: string) => void;
}

export function CategoryHeroBanner({
  totalProductsCount,
  categories,
  selectedCategory = 'all',
  onSelectCategory
}: CategoryHeroBannerProps) {
  const brandsCount = 2; // Dubro and Great Planes

  return (
    <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-7 pt-10 sm:pt-16 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-end">
        {/* Left Side: Brand Eyebrow, Main Heading, Subtitle & Stats */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold tracking-[0.14em] uppercase text-[#8a6a00] block">
            Aeromodelismo y radio control
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium text-[#10202f] tracking-tight leading-[0.98]">
            <span>El hangar de quienes </span>
            <em className="italic text-[#8a6a00]">construyen</em>
            <span> y vuelan</span>
          </h1>

          <p className="text-base sm:text-lg text-[#6b7480] max-w-xl">
            Productos, hélices, servos, combustibles y todo lo que necesitas para armar, reparar y volar.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#catalogo"
              className="btn-pill btn-primary-hb text-sm sm:text-base font-bold shadow-md hover:shadow-lg"
            >
              Explorar el catálogo →
            </a>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-8 sm:gap-12 pt-6 mt-6 border-t border-[#dcd5c4]">
            <div>
              <b className="block font-serif text-3xl font-medium text-[#10202f] leading-none mb-1">
                {totalProductsCount}
              </b>
              <span className="text-xs text-[#6b7480]">productos</span>
            </div>
            <div>
              <b className="block font-serif text-3xl font-medium text-[#10202f] leading-none mb-1">
                {categories.length}
              </b>
              <span className="text-xs text-[#6b7480]">categorías</span>
            </div>
            <div>
              <b className="block font-serif text-3xl font-medium text-[#10202f] leading-none mb-1">
                {brandsCount}
              </b>
              <span className="text-xs text-[#6b7480]">marcas</span>
            </div>
          </div>
        </div>

        {/* Right Side: Index list with numbered items */}
        <div className="lg:col-span-5">
          <ol className="border-t border-[#10202f] divide-y divide-[#dcd5c4]">
            {categories.map((c, idx) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory(c.slug)}
                  className={`w-full py-4 text-left flex items-baseline gap-4 group transition-all ${selectedCategory === c.slug ? 'text-[#8a6a00] pl-3' : 'text-[#10202f] hover:text-[#8a6a00] hover:pl-3'
                    }`}
                >
                  <span className="font-mono text-xs font-bold tracking-widest text-[#6b7480]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-serif text-xl sm:text-2xl font-medium">
                    {c.name}
                  </span>
                  <span className="ml-auto text-xs font-medium text-[#6b7480] whitespace-nowrap">
                    {c.itemCount ?? 10} productos
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
