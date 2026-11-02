'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'minimal';
}

export function LanguageToggle({ className = '', variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 p-1 shadow-sm ${className}`}
        role="group"
        aria-label="Selector de idioma / Language selector"
      >
        <Globe className="w-3.5 h-3.5 text-[#D4A359] ml-1 shrink-0" />
        <button
          type="button"
          onClick={() => setLanguage('es')}
          className={`px-1.5 py-0.5 text-[11px] font-black rounded-md transition-all cursor-pointer ${
            language === 'es'
              ? 'bg-[#D4A359] text-[#161311] shadow-xs'
              : 'text-[#A89F91] hover:text-[#FAF8F5]'
          }`}
          title="Español"
        >
          ES
        </button>
        <span className="text-[#3E3834] text-[10px] select-none">/</span>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-1.5 py-0.5 text-[11px] font-black rounded-md transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-[#D4A359] text-[#161311] shadow-xs'
              : 'text-[#A89F91] hover:text-[#FAF8F5]'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-[#211E1C] border border-[#D4A359]/40 p-1 shadow-sm transition-all hover:border-[#D4A359] ${className}`}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <div className="w-5 h-5 rounded-full bg-[#161311] flex items-center justify-center text-[#D4A359] ml-0.5 shrink-0">
        <Globe className="w-3 h-3" />
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setLanguage('es')}
          className={`px-2 py-0.5 text-[10.5px] sm:text-xs font-black rounded-full transition-all cursor-pointer ${
            language === 'es'
              ? 'bg-[#D4A359] text-[#161311] shadow-xs scale-105'
              : 'text-[#A89F91] hover:text-[#FAF8F5]'
          }`}
          title="Cambiar a Español"
        >
          ES
        </button>

        <span className="text-[#3E3834] text-[10px] font-bold select-none">|</span>

        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2 py-0.5 text-[10.5px] sm:text-xs font-black rounded-full transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-[#D4A359] text-[#161311] shadow-xs scale-105'
              : 'text-[#A89F91] hover:text-[#FAF8F5]'
          }`}
          title="Switch to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}

