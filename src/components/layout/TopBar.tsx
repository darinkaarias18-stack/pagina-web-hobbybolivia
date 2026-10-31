'use client';

import React from 'react';
import { MapPin, ShieldAlert, HelpCircle } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

interface TopBarProps {
  config?: SiteConfig | null;
  exchangeRate?: number;
}

export function TopBar({ config }: TopBarProps) {
  const whatsapp = config?.whatsappNumber || "+591 77293446";

  return (
    <div className="bg-[#161311] text-[#A89F91] text-[12px] py-2 px-4 border-b border-[#2D2622] transition-colors">
      <div className="w-full max-w-[1320px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">

        {/* Main Message */}
        <div className="flex items-center gap-2 text-center md:text-left font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4A359] animate-pulse"></span>
          {config?.topBarText ? (
            <span className="text-[#FAF8F5]">{config.topBarText}</span>
          ) : (
            <span className="text-[#FAF8F5]">
              <strong className="text-[#D4A359]">Hobby Bolivia:</strong> Productos y componentes de precisión para aviones a escala | Envíos seguros a toda Bolivia
            </span>
          )}
        </div>

        {/* Quick links & Direct Admin Button */}
        <div className="flex items-center flex-wrap gap-4 text-[#A89F91] text-[11.5px]">
          <span className="flex items-center gap-1 hover:text-[#D4A359] transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>La Paz, Bolivia</span>
          </span>

          <a
            href="/politicas"
            className="flex items-center gap-1 hover:text-[#D4A359] transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#A89F91]" />
            <span>Políticas</span>
          </a>

          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=Hola%20Hobby%20Bolivia,%20necesito%20ayuda%20técnica%20con%20un%20producto.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-[#D4A359] transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#A89F91]" />
            <span>Ayuda</span>
          </a>
        </div>

      </div>
    </div>
  );
}
