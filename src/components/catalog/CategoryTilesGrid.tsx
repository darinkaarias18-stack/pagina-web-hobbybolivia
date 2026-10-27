'use client';

import React from 'react';
import { ArrowRight, Plane } from 'lucide-react';
import type { Category } from '@/lib/types';

interface CategoryTilesGridProps {
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  activeCategory?: string;
}

export function CategoryTilesGrid({
  categories,
  onSelectCategory,
  activeCategory
}: CategoryTilesGridProps) {
  
  const handleCategoryClick = (slug: string) => {
    onSelectCategory(slug);
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Visual Showcase Banner - Full Width Edge-to-Edge Widescreen Cover */}
      <section className="w-full relative bg-[#161311] border-b border-[#2D2622] overflow-hidden">
        {/* Main Visual Banner Graphic - Full Bleed 16:9 Cinema */}
        <div className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] overflow-hidden">
          <img
            src="/images/banners/banner_panoramic_aero.jpg"
            alt="Hobby Bolivia · Taller de Precisión y Ensamblaje de Aviones a Escala"
            className="w-full h-full object-cover object-center transform hover:scale-[1.01] transition-transform duration-700 ease-out"
            loading="eager"
          />

          {/* Cinematic Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#161311]/95 via-[#161311]/70 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#161311] to-transparent pointer-events-none" />

          {/* Floating High-Conversion Branding & Taglines */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full max-w-[1320px] mx-auto px-4 sm:px-8">
              <div className="max-w-xl space-y-4">
                
                {/* Micro Brand Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161311]/80 backdrop-blur-md border border-[#D4A359]/40 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#F85606] animate-pulse"></span>
                  <span className="text-[#D4A359] text-[11px] font-black uppercase tracking-wider">
                    PLANEA · CONSTRUYE · VUELA
                  </span>
                </div>

                {/* Main Headline Overlay */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[#F85606] font-black text-xs sm:text-sm tracking-wider uppercase">
                      Hobby Bolivia
                    </span>
                    <span className="text-[#A89F91] text-xs">·</span>
                    <span className="text-[#FAF8F5]/80 text-xs font-semibold">Descubre. Arma. Vuela.</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-xl">
                    REPUESTOS <span className="text-white">A ESCALA</span>
                    <span className="block text-[#D4A359] mt-1">PRECISIÓN EN VUELO</span>
                  </h2>
                </div>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-[#FAF8F5]/90 font-medium leading-relaxed drop-shadow max-w-lg">
                  La mayor variedad de repuestos mecánicos, varillajes templados, hélices balanceadas y componentes electrónicos para aeronaves a radio control en Bolivia.
                </p>

                {/* Call to action buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCategoryClick('all')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F85606] hover:bg-[#E04B00] text-white font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#F85606]/30 hover:scale-105 cursor-pointer"
                  >
                    <span>VER CATÁLOGO COMPLETO</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior "Mantén tu flota en el aire" a ancho completo */}
        <div className="w-full bg-[#1B1714] border-t border-[#2D2622] py-3.5 sm:py-4 px-4 sm:px-6">
          <div className="w-full max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-9 h-9 rounded-full bg-[#F85606] text-white flex items-center justify-center shrink-0 shadow-md">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 justify-center sm:justify-start">
                  <span>MANTÉN TU FLOTA EN EL AIRE</span>
                  <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
                  <span className="hidden sm:inline-block text-[#D4A359] text-xs">Precios en Bolivianos (Bs.)</span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#E2DCD3]/80">
                  Envíos blindados con entrega rápida a toda Bolivia (La Paz, Santa Cruz, Cochabamba y el resto del país).
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCategoryClick('all')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
