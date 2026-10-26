'use client';

import React from 'react';
import { ArrowRight, Zap, Shield } from 'lucide-react';

interface PromoBannersProps {
  onSelectCategory?: (categorySlug: string) => void;
}

export function PromoBanners({ onSelectCategory }: PromoBannersProps) {
  const handleClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-14 bg-[#F5F2EB] border-b border-[#E2DCD3]">
      <div className="w-full max-w-[1320px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta Izquierda (Carbón Espresso #161311 con Acentos Dorados) */}
          <div className="relative rounded-3xl bg-[#161311] text-[#FAF8F5] p-7 sm:p-9 border border-[#2D2622] overflow-hidden flex flex-col justify-between shadow-2xl min-h-[270px] group">
            
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D4A359]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4A359]/20 transition-all duration-500"></div>

            <div className="relative z-10 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] text-[11px] font-black uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Propulsión & Potencia</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                Sistemas de Propulsión y Electrónica de Alto Rendimiento
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#A89F91] leading-relaxed">
                Motores outrunner brushless, variadores ESC con BEC de alta corriente y micro servos con engranajes de bronce.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <button
                type="button"
                onClick={() => handleClick('motores-y-propulsion')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md group-hover:translate-x-1 cursor-pointer"
              >
                <span>Explorar Motores & ESC</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#161311]" />
              </button>
            </div>
          </div>

          {/* Tarjeta Derecha (Crema Claro #FAF8F5 con Borde #E2DCD3 y Botón Carbón) */}
          <div className="relative rounded-3xl bg-[#FAF8F5] text-[#1A1817] p-7 sm:p-9 border border-[#E2DCD3] overflow-hidden flex flex-col justify-between shadow-sm min-h-[270px] group">
            
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#F85606]/8 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEAE2] text-[#1A1817] text-[11px] font-black uppercase tracking-wider mb-3">
                <Shield className="w-3.5 h-3.5 text-[#F85606]" />
                <span>Estructura & Control</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-[#1A1817] leading-snug">
                Estructuras Ligeras, Trenes y Accesorios a Escala
              </h3>

              <p className="mt-2 text-xs sm:text-sm text-[#5C5650] leading-relaxed">
                Varillajes de acero templado, conectores E/Z Dubro, palas balanceadas APC y tubos de fibra de carbono.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <button
                type="button"
                onClick={() => handleClick('varillaje-y-alambres')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md group-hover:translate-x-1 cursor-pointer"
              >
                <span>Ver Varillajes & Clevises</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
