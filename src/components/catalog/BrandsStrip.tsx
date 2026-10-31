'use client';

import React from 'react';

export function BrandsStrip() {
  const brands = [
    { name: "Dubro Products USA", tag: "Mandos & Varillaje" },
    { name: "Great Planes", tag: "Alambres & Herrajes" },
    { name: "APC Propellers", tag: "Hélices E-Series" },
    { name: "Hobbywing Tech", tag: "Variadores ESC" },
    { name: "TowerPro", tag: "Micro Servos MG" },
    { name: "Tattu Gens Ace", tag: "Baterías LiPo" },
    { name: "E-flite", tag: "Sistemas Eléctricos" },
    { name: "Futaba", tag: "Radio Control" },
    { name: "Sunnysky", tag: "Motores Brushless" },
    { name: "Spektrum RC", tag: "Receptores DSMX" },
  ];

  return (
    <div className="bg-[#1E1916] border-b border-[#2D2622] py-3.5 overflow-hidden select-none relative">
      <div className="w-full max-w-[1320px] mx-auto px-4 flex items-center gap-4 sm:gap-6">
        
        {/* Fixed Title Badge */}
        <div className="shrink-0 flex items-center gap-2 border-r border-[#2D2622] pr-4 sm:pr-6 z-20 bg-[#1E1916]">
          <span className="w-2 h-2 rounded-full bg-[#F85606] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D4A359] flex items-center gap-1.5 whitespace-nowrap">
            Marcas Oficiales
          </span>
        </div>

        {/* Carousel Container with Gradient Masks */}
        <div className="relative flex-1 overflow-hidden">
          
          {/* Gradient Masks (Fade edges) */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-r from-[#1E1916] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 z-10 bg-gradient-to-l from-[#1E1916] to-transparent" />

          {/* Infinite Marquee Carousel Track */}
          <div className="animate-marquee flex items-center gap-8 sm:gap-12">
            {[...brands, ...brands].map((brand, idx) => (
              <a
                key={`${brand.name}-${idx}`}
                href="#catalogo"
                className="flex flex-col items-center group cursor-pointer transition-transform hover:scale-105 shrink-0 px-2"
                title={`Ver productos de ${brand.name}`}
              >
                <span className="text-xs sm:text-sm font-black text-[#FAF8F5] tracking-tight group-hover:text-[#D4A359] transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
                <span className="text-[9.5px] font-bold text-[#A89F91] uppercase tracking-wider group-hover:text-[#F85606] transition-colors">
                  {brand.tag}
                </span>
              </a>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
