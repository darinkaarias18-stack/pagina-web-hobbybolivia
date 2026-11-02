'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  Heart,
  Plane,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import type { SiteConfig } from '@/lib/types';

interface HeaderProps {
  config?: SiteConfig | null;
  favoritesCount?: number;
}

export function Header({ config, favoritesCount = 0 }: HeaderProps) {
  const { totalCount, subtotal, subtotalUsd, openDrawer } = useCart();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t('header.home'), href: "#" },
    { label: t('header.catalog'), href: "#catalogo" },
    { label: t('header.categories'), href: "#categorias" },
    { label: t('header.deals'), href: "#ofertas" },
    { label: t('header.contact'), href: "#contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161311] border-b border-[#2D2622] shadow-lg transition-all w-full max-w-full overflow-hidden">
      <div className="w-full max-w-[1320px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">

          {/* Logo Hobby Bolivia (Avioncito con paleta oficial) */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 shrink">
            {config?.logoUrl && config.logoUrl !== 'https://hobbybolivia.com/icon.svg' && config.logoUrl !== '/icon.svg' ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#211E1C] p-0.5 flex items-center justify-center shadow-md border border-[#D4A359]/50 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.logoUrl}
                  alt={config?.companyName || 'Hobby Bolivia'}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359] shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Plane className="w-4 h-4 sm:w-5 sm:h-5 transform -rotate-45 text-[#D4A359]" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-black text-base sm:text-xl md:text-2xl tracking-tight text-[#D4A359] leading-none truncate">
                HOBBY <span className="text-[#FAF8F5]">BOLIVIA</span>
              </span>
              <span className="text-[8.5px] sm:text-[10px] font-bold tracking-wider uppercase text-[#A89F91] mt-0.5 truncate">
                Productos & Aeromodelismo a Escala
              </span>
            </div>
          </Link>

          {/* Menú de Navegación Unificado (Escritorio) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-bold text-[#A89F91]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#D4A359] transition-colors py-1.5 flex items-center gap-1.5 tracking-wide"
              >
                {link.label === "Ofertas" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359] animate-pulse"></span>
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">

            {/* Favorites Icon */}
            <a
              href="#catalogo"
              className="p-2 sm:p-2.5 rounded-xl text-[#A89F91] hover:text-[#D4A359] hover:bg-[#211E1C] transition-colors relative"
              title={t('header.favorites')}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D4A359] text-[#161311] text-[10px] font-black rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </a>

            {/* Cart Trigger Button */}
            <button
              onClick={openDrawer}
              type="button"
              className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#211E1C] hover:bg-[#2E2A27] text-[#FAF8F5] font-semibold transition-all border border-[#D4A359]/30 relative cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A359]" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D4A359] text-[#161311] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#D4A359]">{t('header.my_cart')}</span>
                <span className="text-[10px] sm:text-xs font-black text-[#FAF8F5] whitespace-nowrap">
                  {subtotalUsd > 0
                    ? `$${subtotalUsd.toFixed(2)} USD`
                    : `Bs. ${subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>
            </button>

            {/* CTA Button: Comprar Ahora -> #catalogo */}
            <a
              href="#catalogo"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs tracking-wide transition-all shadow-md hover:scale-[1.02] cursor-pointer"
            >
              <span>{t('header.shop_now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-[#FAF8F5] hover:bg-[#211E1C] border border-[#2D2622]"
              aria-label={t('header.open_menu')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

          </div>

        </div>

        {/* Barra de Navegación Móvil Siempre Visible (Acceso directo como en PC) */}
        <div className="lg:hidden mt-2.5 pt-2 border-t border-[#2D2622] flex items-center justify-between gap-2">
          <nav className="flex items-center gap-3.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 text-[11px] font-bold text-[#A89F91] flex-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#D4A359] text-[#FAF8F5]/90 transition-colors whitespace-nowrap flex items-center gap-1 shrink-0"
              >
                {link.label === "Ofertas" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359] animate-pulse"></span>
                )}
                <span>{link.label}</span>
              </a>
            ))}
          </nav>

          <a
            href="#catalogo"
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-[10px] tracking-wide transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <span>{t('header.shop_now')}</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#2D2622] flex flex-col gap-2.5">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-[#FAF8F5] hover:bg-[#211E1C] rounded-lg flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    {link.label === t('header.deals') && (
                      <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse"></span>
                    )}
                    {link.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A359]" />
                </a>
              ))}
            </div>

            <div className="pt-2 border-t border-[#2D2622] flex flex-col gap-2">
              <a
                href="#catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>{t('header.shop_now')}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
