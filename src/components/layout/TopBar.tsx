'use client';

import React from 'react';
import Link from 'next/link';
import type { SiteConfig } from '@/lib/types';

interface TopBarProps {
  config?: SiteConfig | null;
}

export function TopBar({ config }: TopBarProps) {
  const whatsapp = config?.whatsappNumber || "+59178000000";
  const email = config?.contactEmail || "contacto@hobbybolivia.com";
  const cleanPhone = whatsapp.replace(/[^0-9]/g, '');

  return (
    <div className="bg-[#f8fafc] text-[#64748b] text-[12px] py-1.5 px-4 border-b border-[#e2e8f0] transition-colors">
      <div className="w-full max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        {/* Left: Social media icons and names */}
        <div className="flex items-center gap-4 text-[11.5px]">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#162544] transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            <span className="hidden sm:inline">Facebook</span>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#162544] transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#162544] transition-colors"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
        </div>

        {/* Right: WhatsApp, Email, Phone, Account */}
        <div className="flex items-center gap-3 sm:gap-5 text-[11.5px] ml-auto">
          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#16a34a] transition-colors"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            <span className="hidden md:inline">Pedidos por Whatsapp</span>
          </a>

          <a
            href={`mailto:${email}`}
            className="hidden lg:flex items-center gap-1.5 hover:text-[#162544] transition-colors"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <span>{email}</span>
          </a>

          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center gap-1.5 hover:text-[#162544] transition-colors font-medium"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{whatsapp.replace('+591', '').trim() || '78000000'}</span>
          </a>

          <span className="text-gray-300">|</span>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 font-semibold text-[#162544] hover:text-[#e04f26] transition-colors"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Mi Cuenta</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
