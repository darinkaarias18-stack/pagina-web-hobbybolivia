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
    { name: "Futaba", tag: "Radio Control" }
  ];

  return (
    <div className="bg-[#1E1916] border-b border-[#2D2622] py-4 overflow-hidden">
      <div className="w-full max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#D4A359] shrink-0 border-r border-[#2D2622] pr-5 flex items-center gap-1.5">
            <span>✦</span> Marcas Oficiales
          </span>
          <div className="flex items-center gap-8 sm:gap-12 shrink-0">
            {brands.map((brand) => (
              <div key={brand.name} className="flex flex-col items-center group cursor-pointer">
                <span className="text-xs sm:text-sm font-black text-[#FAF8F5] tracking-tight group-hover:text-[#D4A359] transition-colors whitespace-nowrap">
                  {brand.name}
                </span>
                <span className="text-[9.5px] font-bold text-[#A89F91] uppercase tracking-wider group-hover:text-[#F85606] transition-colors">
                  {brand.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
