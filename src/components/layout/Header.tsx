'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  Heart,
  Plane,
  Menu,
  X,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig } from '@/lib/types';

interface HeaderProps {
  config?: SiteConfig | null;
  onSearch?: (term: string) => void;
  favoritesCount?: number;
}

export function Header({ onSearch, favoritesCount = 0 }: HeaderProps) {
  const { totalCount, subtotal, openDrawer } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: "Inicio", href: "#" },
    { label: "Catálogo de Repuestos", href: "#catalogo" },
    { label: "Categorías", href: "#categorias" },
    { label: "Compatibilidad", href: "#buscador-compatibilidad" },
    { label: "Ofertas", href: "#ofertas" },
    { label: "Políticas", href: "#politicas" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#161311] border-b border-[#2D2622] shadow-lg transition-all">
      <div className="w-full max-w-[1320px] mx-auto px-4 py-3 sm:py-3.5">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Hobby Bolivia (Naranja #F85606) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#F85606] flex items-center justify-center text-white shadow-md shadow-[#F85606]/30 group-hover:scale-105 transition-transform">
              <Plane className="w-5 h-5 transform -rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-[#F85606] leading-none">
                HOBBY <span className="text-[#FAF8F5]">BOLIVIA</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#D4A359] mt-0.5">
                Repuestos & Aeromodelismo a Escala
              </span>
            </div>
          </Link>

          {/* Quick Integrated Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar repuesto, SKU (ej. DUBQ3570), motor o escala..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-10 pr-24 py-2.5 text-xs bg-[#211E1C] hover:bg-[#282421] focus:bg-[#211E1C] text-[#FAF8F5] placeholder-[#8C827A] rounded-xl border border-[#3D352E] focus:border-[#D4A359] focus:ring-1 focus:ring-[#D4A359] transition-all outline-none"
              />
              <Search className="w-4 h-4 text-[#D4A359] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#D4A359] hover:bg-[#C69755] text-[#161311] text-xs font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Favorites Icon */}
            <a
              href="#catalogo"
              className="p-2.5 rounded-xl text-[#A89F91] hover:text-[#F85606] hover:bg-[#211E1C] transition-colors relative"
              title="Mis Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favoritesCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#F85606] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </a>

            {/* Cart Trigger Button */}
            <button
              onClick={openDrawer}
              type="button"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#211E1C] hover:bg-[#2E2A27] text-[#FAF8F5] font-semibold transition-all border border-[#D4A359]/30 relative cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-[#D4A359]" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#F85606] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {totalCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[9px] uppercase font-bold text-[#D4A359]">Mi Carrito</span>
                <span className="text-xs font-black text-[#FAF8F5]">
                  Bs. {subtotal.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </button>

            {/* CTA Button: Comprar Ahora -> */}
            <a
              href="#catalogo"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs tracking-wide transition-all shadow-md hover:scale-[1.02]"
            >
              <span>Comprar Ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#FAF8F5] hover:bg-[#211E1C]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Secondary Navigation Row (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#2D2622] text-xs font-semibold text-[#A89F91]">
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#D4A359] transition-colors py-1 flex items-center gap-1.5"
              >
                {link.label === "Ofertas" && <span className="w-1.5 h-1.5 rounded-full bg-[#F85606] animate-pulse"></span>}
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[#A89F91] text-[11px]">
            <span className="flex items-center gap-1.5 text-[#D4A359] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F85606]" />
              Piezas Genuinas Dubro & Great Planes
            </span>
          </div>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-[#2D2622] flex flex-col gap-2">
            <form onSubmit={handleSearchSubmit} className="relative mb-2">
              <input
                type="text"
                placeholder="Buscar repuesto o SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#211E1C] border border-[#3D352E] rounded-xl text-[#FAF8F5] outline-none"
              />
              <Search className="w-4 h-4 text-[#D4A359] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-[#FAF8F5] hover:bg-[#211E1C] rounded-lg"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-[#2D2622] flex items-center justify-between">
              <Link
                href="/admin"
                className="text-xs font-bold text-[#D4A359] hover:underline py-1"
              >
                Acceder a Panel Administrativo →
              </Link>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
