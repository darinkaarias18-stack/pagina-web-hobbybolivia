'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteConfig } from '@/lib/types';

interface FooterProps {
  config?: SiteConfig | null;
}

export function Footer({ config }: FooterProps) {
  const whatsapp = config?.whatsappNumber || "+59178000000";
  const email = config?.contactEmail || "contacto@hobbybolivia.com";
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-white text-[#64748b] pt-12 pb-6 border-t border-[#e2e8f0]">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10">
          {/* Column 1: Brand & Contacts */}
          <div className="md:col-span-5 space-y-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              {config?.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.companyName || 'Logo'}
                  className="h-10 w-auto max-w-[130px] object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-lg p-0.5 flex items-center justify-center text-white"
                  style={{ backgroundColor: config?.secondaryColor || '#162544' }}
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: config?.primaryColor || '#e04f26' }}
                  >
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-extrabold text-[22px] tracking-tight leading-none text-[#162544]">
                  {config?.companyName || 'Hobby Bolivia'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#94a3b8]">
                  {config?.subtitle || 'Aeromodelismo & R/C'}
                </span>
              </div>
            </Link>

            {/* Phone */}
            <div className="flex items-center gap-2 text-sm text-[#334155] font-medium pt-1">
              <svg className="w-4 h-4 text-[#64748b] stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{whatsapp.replace('+591', '').trim() || '78000000'}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-sm text-[#334155]">
              <svg className="w-4 h-4 text-[#64748b] stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{email}</span>
            </div>

            {/* Social Icons row (Galba colors) */}
            <div className="flex items-center gap-2.5 pt-2">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Servicio al cliente */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-[#162544] tracking-tight">
              Servicio al cliente
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#catalogo" className="hover:text-[#162544] hover:underline transition-colors">
                  Condiciones generales
                </a>
              </li>
              <li>
                <a href="#como-comprar" className="hover:text-[#162544] hover:underline transition-colors">
                  Cómo comprar
                </a>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#162544] hover:underline transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-[#162544] hover:underline transition-colors">
                  Reclamos y sugerencias
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Mi cuenta */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-[#162544] tracking-tight">
              Mi cuenta
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/admin" className="hover:text-[#162544] hover:underline transition-colors">
                  Mi cuenta
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#162544] hover:underline transition-colors">
                  Actualizar datos
                </Link>
              </li>
              <li>
                <a href="#catalogo" className="hover:text-[#162544] hover:underline transition-colors">
                  Mis pedidos
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-[#e04f26] font-bold hover:underline transition-colors">
                  Panel de Administración →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright on left, Payment icons on right */}
        <div className="pt-6 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94a3b8]">
          <div>
            © Hobby Bolivia - Todos los derechos reservados
          </div>

          {/* Payment Badges (VISA, Mastercard, QR Simple, Transferencia) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 rounded bg-[#f1f5f9] text-[10px] font-black text-[#1e293b] tracking-wider border border-[#e2e8f0]">
              VISA
            </span>
            <span className="px-2 py-1 rounded bg-[#f1f5f9] text-[10px] font-black text-[#1e293b] tracking-wider border border-[#e2e8f0]">
              MASTERCARD
            </span>
            <span className="px-2 py-1 rounded bg-[#f1f5f9] text-[10px] font-black text-[#2563eb] tracking-wider border border-[#e2e8f0]">
              QR SIMPLE
            </span>
            <span className="px-2 py-1 rounded bg-[#f1f5f9] text-[10px] font-bold text-[#1e293b] tracking-tight border border-[#e2e8f0]">
              Transferencia
            </span>
            <span className="px-2 py-1 rounded bg-[#f1f5f9] text-[10px] font-bold text-[#16a34a] tracking-tight border border-[#e2e8f0]">
              Efectivo
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
