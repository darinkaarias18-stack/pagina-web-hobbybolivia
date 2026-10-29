'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plane } from 'lucide-react';

interface BrandLogoProps {
  logoUrl?: string | null;
  className?: string;
  variant?: 'light' | 'dark';
}

export function BrandLogo({ logoUrl, className = "h-11", variant = 'light' }: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (logoUrl && logoUrl !== 'https://hobbybolivia.com/icon.svg' && logoUrl !== '/icon.svg' && !imgError) {
    return (
      <Link href="/" className={`flex items-center gap-2 group ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt="Hobby Bolivia"
          onError={() => setImgError(true)}
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 shadow-md text-[#D4A359] group-hover:scale-105 transition-all duration-300 shrink-0">
        <Plane className="w-5 h-5 text-[#D4A359] transform -rotate-45" />
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`tracking-tight font-black text-xl sm:text-2xl transition-colors ${
            variant === 'dark' ? 'text-[#FAF8F5]' : 'text-[#161311]'
          }`}
        >
          <span className="text-[#D4A359]">HOBBY</span>{' '}
          <span>BOLIVIA</span>
        </span>
        <span
          className={`text-[9.5px] tracking-wider uppercase font-bold mt-0.5 ${
            variant === 'dark' ? 'text-[#A89F91]' : 'text-[#5C5650]'
          }`}
        >
          Repuestos & Aeromodelismo a Escala
        </span>
      </div>
    </Link>
  );
}
