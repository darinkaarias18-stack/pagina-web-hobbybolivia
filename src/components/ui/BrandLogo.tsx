'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  logoUrl?: string | null;
  className?: string;
  variant?: 'light' | 'dark';
}

export function BrandLogo({ logoUrl, className = "h-11", variant = 'light' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  // If valid logo image and hasn't errored
  if (logoUrl && !imgError) {
    return (
      <Link href="/" className={`flex items-center gap-2 group ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="Hobby Bolivia Florería"
          onError={() => setImgError(true)}
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
    );
  }

  // Fallback: Modern SVG botanical emblem + elegant serif typography
  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-[#E11D48] to-[#F43F5E] shadow-sm text-white group-hover:shadow-md transition-all duration-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white transform group-hover:rotate-12 transition-transform duration-300"
        >
          {/* Flower petals and stem */}
          <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3" />
          <path d="M7.5 12a4.5 4.5 0 1 0 4.5 4.5M7.5 12H3" />
          <path d="M12 16.5a4.5 4.5 0 1 0 4.5-4.5M12 16.5V21" />
          <path d="M16.5 12a4.5 4.5 0 1 0-4.5-4.5M16.5 12H21" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-serif tracking-tight font-extrabold text-xl sm:text-2xl transition-colors ${
            variant === 'dark' ? 'text-white' : 'text-slate-900 group-hover:text-[#E11D48]'
          }`}
        >
          Hobby<span className="text-[#E11D48]">Bolivia</span>
        </span>
        <span
          className={`text-[10px] tracking-widest uppercase font-semibold mt-0.5 ${
            variant === 'dark' ? 'text-slate-300' : 'text-[#064E3B]'
          }`}
        >
          Florería & Detalles
        </span>
      </div>
    </Link>
  );
}
