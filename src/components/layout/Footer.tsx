'use client';

import React from 'react';
import Link from 'next/link';
import { Plane, Phone, Mail, MapPin, ArrowRight, ArrowUp } from 'lucide-react';
import type { SiteConfig } from '@/lib/types';

interface FooterProps {
  config?: SiteConfig | null;
}

export function Footer({ config }: FooterProps) {
  const whatsapp = config?.whatsappNumber || "+591 77293446";
  const email = config?.contactEmail || "contacto@hobbybolivia.com";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contacto" className="bg-[#161311] text-[#A89F91] text-xs border-t border-[#2D2622]">

      {/* 1. Barra CTA Superior (Carbón #1E1916 con Botón Dorado Arena) */}
      <div className="bg-[#1E1916] py-6 border-b border-[#2D2622]">
        <div className="w-full max-w-[1320px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#211E1C] border border-[#D4A359]/30 text-[#D4A359] flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#FAF8F5] uppercase tracking-wide">
                ¿Necesitas asesoría técnica sobre roscas o compatibilidad?
              </h4>
              <p className="text-[#A89F91] text-xs mt-0.5">
                Te asistimos de inmediato con diagramas de paso, diámetros de varilla y brazos de servo.
              </p>
            </div>
          </div>

          <Link
            href="/#catalogo"
            onClick={(e) => {
              const el = document.getElementById('catalogo');
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-6 py-3 rounded-full bg-[#D4A359] hover:bg-[#C69755] !text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#D4A359]/20 flex items-center gap-2 hover:scale-[1.02] cursor-pointer shrink-0"
            style={{ color: '#161311' }}
          >
            <span className="font-black !text-[#161311]" style={{ color: '#161311' }}>
              Explorar Catálogo de Repuestos
            </span>
            <ArrowRight className="w-4 h-4 !text-[#161311]" style={{ color: '#161311' }} />
          </Link>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="w-full max-w-[1320px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {config?.logoUrl && config.logoUrl !== 'https://hobbybolivia.com/icon.svg' && config.logoUrl !== '/icon.svg' ? (
                <div className="w-8 h-8 rounded-lg bg-[#211E1C] p-0.5 flex items-center justify-center overflow-hidden border border-[#D4A359]/50 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={config.logoUrl}
                    alt={config.companyName || 'Hobby Bolivia'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359] shadow-md shrink-0">
                  <Plane className="w-4 h-4 -rotate-45 text-[#D4A359]" />
                </div>
              )}
              <span className="font-black text-xl tracking-tight text-[#D4A359]">
                HOBBY <span className="text-[#FAF8F5]">BOLIVIA</span>
              </span>
            </div>

            <p className="text-[#A89F91] text-xs leading-relaxed max-w-sm">
              Plataforma especializada en la distribución de repuestos, componentes mecánicos, electrónica y accesorios para aviones a escala y aeromodelismo en toda Bolivia.
            </p>

            <div className="space-y-2 text-[#A89F91] text-xs pt-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span>La Paz, Bolivia (Despachos a los 9 Departamentos)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span>{whatsapp} (Atención y Cotizaciones)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A89F91] shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Categorías Principales */}
          <div>
            <h5 className="font-black text-[#D4A359] text-xs uppercase tracking-wider mb-4 border-l-2 border-[#D4A359] pl-2">
              Sistemas
            </h5>
            <ul className="space-y-2.5 text-[#A89F91]">
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Conectores E/Z & Mandos</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Varillaje Push-Rod & Clevises</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Motores Brushless & ESC</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Hélices APC & Spinners CNC</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Micro Servos MG90S</a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#D4A359] transition-colors">Trenes en Fibra de Carbono</a>
              </li>
            </ul>
          </div>

          {/* Políticas & Soporte */}
          <div>
            <h5 className="font-black text-[#D4A359] text-xs uppercase tracking-wider mb-4 border-l-2 border-[#D4A359] pl-2">
              Garantía & Ayuda
            </h5>
            <ul className="space-y-2.5 text-[#A89F91]">
              <li>
                <Link href="/politicas" className="hover:text-[#D4A359] transition-colors">Envíos y Embalaje Frágil</Link>
              </li>
              <li>
                <Link href="/politicas" className="hover:text-[#D4A359] transition-colors">Garantía de Repuestos</Link>
              </li>
              <li>
                <Link href="/politicas" className="hover:text-[#D4A359] transition-colors">Cambios por Compatibilidad</Link>
              </li>
              <li>
                <Link href="/politicas" className="hover:text-[#D4A359] transition-colors">Privacidad de Clientes</Link>
              </li>
              <li>
                <Link href="/libro-de-reclamaciones" className="hover:text-[#D4A359] transition-colors">Libro de Reclamaciones</Link>
              </li>
            </ul>
          </div>

          {/* Medios de Pago & Enlace Admin */}
          <div>
            <h5 className="font-black text-[#D4A359] text-xs uppercase tracking-wider mb-4 border-l-2 border-[#D4A359] pl-2">
              Pagos en Bolivia
            </h5>
            <p className="text-[#A89F91] text-xs mb-3">
              Transferencias seguras y pagos digitales autorizados:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-[#211E1C] border border-[#2D2622] text-[#FAF8F5] rounded-full font-bold text-[10px]">
                QR Simple
              </span>
              <span className="px-2.5 py-1 bg-[#211E1C] border border-[#2D2622] text-[#FAF8F5] rounded-full font-bold text-[10px]">
                BCP / BNB / Mercantil
              </span>
              <span className="px-2.5 py-1 bg-[#211E1C] border border-[#2D2622] text-[#FAF8F5] rounded-full font-bold text-[10px]">
                Tigo Money
              </span>
              <span className="px-2.5 py-1 bg-[#211E1C] border border-[#2D2622] text-[#FAF8F5] rounded-full font-bold text-[10px]">
                Efectivo Contraentrega
              </span>
            </div>

            <div className="mt-5 pt-3 border-t border-[#2D2622]">
              <Link
                href="/login?reauth=1"
                className="text-[11px] font-bold text-[#D4A359] hover:text-[#C69755] transition-colors flex items-center gap-1"
              >
                <span>Acceso al Panel Administrativo</span>
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>



      {/* 4. Bottom Copyright Strip */}
      <div className="bg-[#100D0B] py-3 px-4 border-t border-[#241F1C]">
        <div className="w-full max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[#8C827A] text-[11px]">
          <div>
            © 2026 <strong className="text-[#FAF8F5]">Hobby Bolivia</strong>. Todos los derechos reservados. Repuestos de precisión para aeromodelismo.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              type="button"
              className="p-1.5 rounded-lg bg-[#211E1C] hover:bg-[#D4A359] text-[#FAF8F5] hover:text-[#161311] transition-colors cursor-pointer"
              title="Volver arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
}
