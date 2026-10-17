'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import type { SiteConfig, Category } from '@/lib/types';
import Link from 'next/link';

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, selectedCategory);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f0] shadow-sm transition-all">
      {/* 1. Main White Header: Logo, Central Search, Cart Widget */}
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-3.5">
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
              /* Stylized Aero Mark fallback */
              <div
                className="w-10 h-10 rounded-lg p-0.5 shadow-md flex items-center justify-center"
                style={{ backgroundColor: config?.secondaryColor || '#162544' }}
              >
                <div className="w-full h-full rounded-[7px] flex items-center justify-center text-white" style={{ backgroundColor: config?.secondaryColor || '#162544' }}>
                  <svg
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: config?.primaryColor || '#e04f26' }}
                  >
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <span className="font-extrabold text-[22px] tracking-tight leading-none text-[#162544]">
                {config?.companyName ? (
                  config.companyName
                ) : (
                  <>Hobby<span className="text-[#e04f26]">Bolivia</span></>
                )}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748b] leading-tight">
                {config?.subtitle || 'Aeromodelismo & R/C'}
              </span>
            </div>
          </Link>

          {/* Central Wide Search Bar (Galba pill style) */}
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
                className="w-full h-11 pl-5 pr-14 text-sm bg-white border border-[#cbd5e1] rounded-full text-[#162544] placeholder-[#94a3b8] outline-none transition-all focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#162544] hover:bg-[#1d2b53] text-white flex items-center justify-center transition-colors shadow-sm"
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

          {/* Right: Cart Widget (Galba style) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Carrito de compras"
              id="btn-cart-toggle"
              className="flex items-center gap-2.5 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition-colors text-[#162544]"
            >
              <div className="relative">
                <svg
                  className="w-7 h-7 text-[#162544]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 7h13l-1.5 9.5a2 2 0 0 1-2 1.5H9.6a2 2 0 0 1-2-1.6L5.2 4.6A1 1 0 0 0 4.2 4H3" />
                  <circle cx="10" cy="21" r="1.2" />
                  <circle cx="17" cy="21" r="1.2" />
                </svg>
                {/* Count Badge */}
                <span className="absolute -top-1 -right-2 min-w-[19px] h-[19px] px-1 bg-[#162544] text-white text-[11px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {totalCount}
                </span>
              </div>
              <div className="text-left font-bold text-sm hidden sm:block">
                <span className="text-xs text-[#64748b] block font-normal leading-tight">Carrito</span>
                <span className="text-[#162544] leading-tight font-extrabold">
                  {config?.currency || '$us'} {subtotal.toFixed(2)}
                </span>
              </div>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#162544] hover:bg-slate-100 rounded-lg"
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
              className="w-full h-10 pl-4 pr-12 text-sm bg-slate-50 border border-[#cbd5e1] rounded-full text-[#162544] outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 rounded-full text-white flex items-center justify-center"
              style={{ backgroundColor: config?.secondaryColor || '#162544' }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* 2. Navy Blue Navigation Ribbon (Exact Galba style) */}
      <nav
        className="text-white border-t transition-colors"
        style={{
          backgroundColor: config?.secondaryColor || '#162544',
          borderColor: config?.secondaryColor || '#1d2b53'
        }}
        aria-label="Menú Principal"
      >
        <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Main Links */}
          <div className="hidden md:flex items-center">
            {/* Inicio (Active Tab) */}
            <Link
              href="/"
              onClick={() => {
                if (onSelectCategory) onSelectCategory('all');
              }}
              className="px-5 py-3 text-[13.5px] font-bold text-white transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: config?.primaryColor || '#e04f26' }}
            >
              <span>Inicio</span>
            </Link>

            {/* Productos Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="px-4 py-3 text-[13.5px] font-semibold text-white/90 hover:bg-[#1d2b53] hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Productos</span>
                <span className="text-[10px]">▼</span>
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-white text-[#162544] border border-[#e2e8f0] rounded-b-md shadow-xl py-2 z-50"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  <button
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory('all');
                      setCategoriesOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-100 text-[#162544]"
                  >
                    Todos los productos
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

            {/* Marcas */}
            <a
              href="#marcas"
              className="px-4 py-3 text-[13.5px] font-semibold text-white/90 hover:bg-[#1d2b53] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Marcas</span>
              <span className="text-[10px]">▼</span>
            </a>

            {/* Cómo comprar */}
            <a
              href="#como-comprar"
              className="px-4 py-3 text-[13.5px] font-semibold text-white/90 hover:bg-[#1d2b53] hover:text-white transition-colors"
            >
              Cómo comprar
            </a>

            {/* Ofertas */}
            <button
              type="button"
              onClick={() => onFilterOferta && onFilterOferta()}
              className="px-4 py-3 text-[13.5px] font-semibold text-white/90 hover:bg-[#1d2b53] hover:text-white transition-colors"
            >
              Ofertas
            </button>

            {/* Contacto */}
            <a
              href="#contacto"
              className="px-4 py-3 text-[13.5px] font-semibold text-white/90 hover:bg-[#1d2b53] hover:text-white transition-colors"
            >
              Contacto
            </a>
          </div>

          {/* Right Side: Admin Link */}
          <div className="hidden md:flex items-center py-2">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1 rounded bg-[#1d2b53] text-[#f8fafc] hover:bg-[#e04f26] transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
              <span>Panel Admin</span>
            </Link>
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
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-[#e04f26]"
            >
              Acceso Administrativo →
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
