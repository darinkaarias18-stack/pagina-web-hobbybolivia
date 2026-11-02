'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative bg-[#161311] text-[#FAF8F5] pt-12 pb-16 border-b border-[#2D2622] overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4A359]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-[#D4A359]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1320px] mx-auto px-4 relative z-10">
        {/* Top Eyebrow Badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] text-xs font-black uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse"></span>
            <span>{t('hero.badge')}</span>
          </div>
        </div>

        {/* Main Headline in Two Tones */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] uppercase">
            <span className="text-white block">
              {t('hero.title_line1')}
            </span>
            <span className="text-[#D4A359] block mt-1">
              {t('hero.title_line2')}
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
}
