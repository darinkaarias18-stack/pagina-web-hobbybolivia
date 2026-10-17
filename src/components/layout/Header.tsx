'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig, Category } from '@/lib/types';
import Link from 'next/link';
import { ShieldCheck, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  config?: SiteConfig | null;
  categories?: Category[];
  searchQuery?: string;
  selectedCategory?: string;
  onSearch?: (query: string, category: string) => void;
  onFilterOferta?: () => void;
  onFilterNuevo?: () => void;
  onSelectCategory?: (slug: string) => void;
}

export function Header({
  config,
  categories = [],
  searchQuery = '',
  selectedCategory = 'all',
  onSearch,
  onFilterOferta,
  onFilterNuevo,
  onSelectCategory
}: HeaderProps) {
  const { totalCount, subtotal, openDrawer } = useCart();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const logged =
        localStorage.getItem('hb_admin_logged') === 'true' ||
        document.cookie.includes('hb_admin_auth=authenticated');
      setIsLoggedIn(logged);
    };
    checkAuth();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, selectedCategory);
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-md transition-all">
      {/* 1. Main Golden Yellow Bar matching reference image */}
      <div className="w-full bg-[#f59e0b] text-[#0f172a] border-b border-[#d97706]/40">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              {config?.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.companyName || 'Logo'}
                  className="h-10 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg p-0.5 shadow-md flex items-center justify-center bg-[#0f172a]">
                  <div className="w-full h-full rounded-[7px] flex items-center justify-center bg-[#0f172a]">
                    <svg
                      className="w-6 h-6 group-hover:scale-110 transition-transform text-[#f59e0b]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                <span className="font-extrabold text-[22px] tracking-tight leading-none text-[#0f172a]">
                  {config?.companyName ? (
                    config.companyName
                  ) : (
                    <>Hobby<span className="text-[#0f172a]">Bolivia</span></>
                  )}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#0f172a]/75 leading-tight">
                  {config?.subtitle || 'Aeromodelismo & R/C'}
                </span>
              </div>
            </Link>

            {/* Central Wide Search Bar (White background matching reference image) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex items-center flex-1 max-w-2xl mx-4 relative"
              role="search"
            >
              <div className="w-full relative flex items-center">
                <input
                  type="search"
                  placeholder="Buscar repuestos, marcas, códigos SKU..."
                  aria-label="Buscar productos"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (onSearch) onSearch(e.target.value, selectedCategory);
                  }}
                  className="w-full h-11 pl-5 pr-14 text-sm bg-white border border-[#d97706]/30 rounded-full text-[#0f172a] placeholder-[#64748b] outline-none transition-all focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/20 shadow-inner"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  <svg
                    className="w-4 h-4 stroke-current fill-none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right: Cart Widget & Iniciar sesión / Panel Admin button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isLoggedIn ? (
                <Link
                  href="/admin"
                  id="header-admin-link"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-[#facc15] font-bold text-xs transition-all shadow-sm shrink-0 border border-black/15"
                  title="Ir al Panel de Administración"
                >
                  <ShieldCheck className="w-4 h-4 text-[#facc15] shrink-0" />
                  <span className="font-bold text-[#facc15] whitespace-nowrap">Panel Admin</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  id="header-login-link"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#0f172a] text-[#0f172a] hover:text-white font-bold text-xs transition-all shadow-xs shrink-0 border border-black/15 group"
                  title="Iniciar sesión en la tienda"
                >
                  <UserIcon className="w-4 h-4 text-[#e04f26] group-hover:text-white transition-colors shrink-0" />
                  <span className="font-bold whitespace-nowrap">Iniciar sesión</span>
                </Link>
              )}

              <button
                type="button"
                onClick={openDrawer}
                aria-label="Carrito de compras"
                id="btn-cart-toggle"
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white hover:bg-slate-50 transition-all text-[#0f172a] border border-black/10 shadow-xs"
              >
                <div className="relative">
                  <svg
                    className="w-6 h-6 text-[#0f172a]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 7h13l-1.5 9.5a2 2 0 0 1-2 1.5H9.6a2 2 0 0 1-2-1.6L5.2 4.6A1 1 0 0 0 4.2 4H3" />
                    <circle cx="10" cy="21" r="1.2" />
                    <circle cx="17" cy="21" r="1.2" />
                  </svg>
                  {/* Count Badge */}
                  <span className="absolute -top-1 -right-2 min-w-[19px] h-[19px] px-1 bg-[#0f172a] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                    {totalCount}
                  </span>
                </div>
                <div className="text-left font-bold text-xs hidden sm:block">
                  <span className="text-[10px] text-[#475569] block font-semibold leading-tight">Carrito</span>
                  <span className="text-[#0f172a] leading-tight font-extrabold">
                    {config?.currency || '$us'} {subtotal.toFixed(2)}
                  </span>
                </div>
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#0f172a] hover:bg-black/10 rounded-lg"
                aria-label="Menú móvil"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mt-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="search"
                placeholder="Buscar repuestos, marcas..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onSearch) onSearch(e.target.value, selectedCategory);
                }}
                className="w-full h-10 pl-4 pr-12 text-sm bg-white border border-[#d97706]/40 rounded-full text-[#0f172a] outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 rounded-full text-white bg-[#0f172a] flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Navy Blue Navigation Ribbon matching reference image */}
      <nav
        className="bg-[#162544] text-white border-b border-[#0f172a] transition-colors"
        aria-label="Menú Principal"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Main Links */}
          <div className="hidden md:flex items-center gap-1">
            {/* Green Categories Button matching reference image */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold text-xs uppercase px-4 py-3 flex items-center gap-2 tracking-wide transition-colors rounded-l-md"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                <span>TODAS LAS CATEGORÍAS</span>
                <span className="text-[10px]">▼</span>
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-white text-[#162544] border border-[#e2e8f0] rounded-b-md shadow-2xl py-2 z-50 animate-fade-in"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('all');
                      setCategoriesOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-100 text-[#162544] flex items-center justify-between"
                  >
                    <span>Todos los productos</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">Ver todo</span>
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(c.slug);
                        setCategoriesOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs hover:bg-slate-100 text-[#334155] flex justify-between items-center"
                    >
                      <span>{c.name}</span>
                      {c.itemCount !== undefined && (
                        <span className="text-[11px] font-bold text-[#e04f26]">({c.itemCount})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Menu Navigation Links */}
            <Link
              href="/"
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
              }}
              className="px-4 py-3 text-[13px] font-bold text-white hover:bg-white/10 transition-colors"
            >
              Inicio
            </Link>

            <a
              href="#tienda-productos"
              className="px-4 py-3 text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              Productos
            </a>

            <a
              href="#marcas"
              className="px-4 py-3 text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              Marcas
            </a>

            <a
              href="#como-comprar"
              className="px-4 py-3 text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              Cómo comprar
            </a>

            <button
              type="button"
              onClick={() => onFilterOferta && onFilterOferta()}
              className="px-4 py-3 text-[13px] font-bold text-amber-300 hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <span>🔥</span>
              <span>Ofertas</span>
            </button>

            <a
              href="#contacto"
              className="px-4 py-3 text-[13px] font-bold text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>

          {/* Right Side: Quick WhatsApp & Admin / Login Link */}
          <div className="hidden md:flex items-center gap-2 py-1.5">
            <a
              href={`https://wa.me/${(config?.whatsappNumber || '59178000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>WhatsApp Directo</span>
            </a>

            {isLoggedIn ? (
              <Link
                href="/admin"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#facc15]" />
                <span>Panel Admin</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-white" />
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#162544] px-4 py-3 border-t border-[#1d2b53] space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#e04f26]"
            >
              Inicio
            </Link>
            <div className="space-y-1 pl-2 border-l border-white/10">
              <span className="text-[11px] uppercase font-bold text-white/50">Categorías</span>
              <button
                onClick={() => {
                  if (onSelectCategory) onSelectCategory('all');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-1 text-sm text-white/80 hover:text-white"
              >
                Todas las categorías
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(c.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-1 text-sm text-white/80 hover:text-white flex justify-between"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-[#e04f26]">({c.itemCount || 10})</span>
                </button>
              ))}
            </div>
            <a
              href="#marcas"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-white/90"
            >
              Marcas
            </a>
            <a
              href="#como-comprar"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-white/90"
            >
              Cómo comprar
            </a>
            <button
              onClick={() => {
                if (onFilterOferta) onFilterOferta();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm text-white/90"
            >
              Ofertas
            </button>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-white/90"
            >
              Contacto
            </a>
            {isLoggedIn ? (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-bold text-[#f2b705]"
              >
                <ShieldCheck className="w-4 h-4 text-[#f2b705]" />
                <span>Panel Admin</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-bold text-[#e04f26]"
              >
                <UserIcon className="w-4 h-4 text-[#e04f26]" />
                <span>Iniciar sesión</span>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
