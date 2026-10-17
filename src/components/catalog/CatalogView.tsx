'use client';

import React, { useState, useMemo } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { BrandsStrip } from '@/components/catalog/BrandsStrip';
import { CategoryTilesGrid } from '@/components/catalog/CategoryTilesGrid';
import { ValuePropsRibbon } from '@/components/catalog/ValuePropsRibbon';
import { ProductCard } from '@/components/catalog/ProductCard';
import { NewsletterStrip } from '@/components/catalog/NewsletterStrip';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsApp } from '@/components/layout/FloatingWhatsApp';
import type { SiteConfig, Category, Occasion, CatalogItem, Banner } from '@/lib/types';

interface CatalogViewProps {
  initialConfig: SiteConfig;
  initialCategories: Category[];
  initialOccasions: Occasion[];
  initialItems: CatalogItem[];
  initialBanners: Banner[];
}

export function CatalogView({
  initialConfig,
  initialCategories,
  initialOccasions,
  initialItems,
  initialBanners
}: CatalogViewProps) {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOffersOnly, setShowOffersOnly] = useState<boolean>(false);
  const [showNewOnly, setShowNewOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Carousel page state for "Agregados recientemente"
  const [carouselPage, setCarouselPage] = useState<number>(0);
  const itemsPerPage = 6;

  // Filter items dynamically
  const filteredItems = useMemo(() => {
    let result = [...initialItems];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = initialCategories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((i) => i.categoryId === cat.id);
      }
    }

    // Brand filter
    if (selectedBrand && selectedBrand !== 'all') {
      const bLower = selectedBrand.toLowerCase().trim();
      result = result.filter((i) => i.brand?.toLowerCase().trim() === bLower);
    }

    // Offers only
    if (showOffersOnly) {
      result = result.filter((i) => i.discountPercent && i.discountPercent > 0);
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((i) => {
        const inTitle = i.title.toLowerCase().includes(q);
        const inSku = i.sku.toLowerCase().includes(q);
        const inDesc = i.description.toLowerCase().includes(q);
        const inBrand = i.brand?.toLowerCase().includes(q);
        return inTitle || inSku || inDesc || inBrand;
      });
    }

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'new') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [
    initialItems,
    initialCategories,
    selectedCategory,
    selectedBrand,
    showOffersOnly,
    showNewOnly,
    searchQuery,
    sortBy
  ]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  // Items to display on current carousel page
  const displayedItems = useMemo(() => {
    // If active filter is set, show all filtered items
    if (selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.length > 0 || showOffersOnly) {
      return filteredItems;
    }
    const start = carouselPage * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, carouselPage, itemsPerPage, selectedCategory, selectedBrand, searchQuery, showOffersOnly]);

  const handleNextPage = () => {
    setCarouselPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevPage = () => {
    setCarouselPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setShowOffersOnly(false);
    setShowNewOnly(false);
    setSortBy('relevance');
    setCarouselPage(0);
  };

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    if (category) setSelectedCategory(category);
    setCarouselPage(0);
    const el = document.getElementById('agregados-recientemente');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery.length > 0 || showOffersOnly;

  const gridColsClass =
    initialConfig?.desktopColumns === 3
      ? 'lg:grid-cols-3'
      : initialConfig?.desktopColumns === 4
      ? 'lg:grid-cols-4'
      : 'lg:grid-cols-6';

  return (
    <div
      className="flex flex-col min-h-screen bg-white text-[#1e293b]"
      style={{
        ['--navy-dark' as any]: initialConfig?.secondaryColor || '#162544',
        ['--navy-mid' as any]: initialConfig?.secondaryColor || '#1d2b53',
        ['--orange-accent' as any]: initialConfig?.primaryColor || '#e04f26',
        ['--primary' as any]: initialConfig?.primaryColor || '#e04f26',
        ['--secondary' as any]: initialConfig?.secondaryColor || '#162544',
        ['--blue-accent' as any]: initialConfig?.accentColor || '#2563eb'
      }}
    >
      {/* 1. Top Utility Bar (Conditionally rendered) */}
      {initialConfig?.showTopBar !== false && <TopBar config={initialConfig} />}

      {/* 2. Site Header (Galba style: Logo + Wide Search + Cart, plus Navy Navigation Ribbon) */}
      <Header
        config={initialConfig}
        categories={initialCategories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearch={handleSearch}
        onFilterOferta={() => {
          setShowOffersOnly(!showOffersOnly);
          const el = document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onFilterNuevo={() => {
          setShowNewOnly(!showNewOnly);
          const el = document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          const el = document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main id="contenido" className="flex-1">
        {/* Dynamic Hero Banner (if heroBannerUrl is configured) */}
        {initialConfig?.heroBannerUrl && (
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 pb-2">
            <div className="relative w-full h-44 sm:h-64 md:h-72 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center group">
              <img
                src={initialConfig.heroBannerUrl}
                alt={initialConfig.companyName || 'Banner'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <span className="text-xs font-bold tracking-wider uppercase text-[#f2b705] mb-1">
                  {initialConfig.subtitle || 'Catálogo Oficial'}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  {initialConfig.companyName || 'Hobby Bolivia'}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* 3. Section: Marcas (Galba style: Title with blue underline, thin line, brand logos) */}
        <BrandsStrip
          selectedBrand={selectedBrand}
          onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            const el = document.getElementById('agregados-recientemente');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Section: Categorías (Galba style: 2 rows of 6 categories with isolated images and item counts) */}
        <CategoryTilesGrid
          categories={initialCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            const el = document.getElementById('agregados-recientemente');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. Section: Value Propositions Ribbon (Galba style: Navy blue 5-column trust bar) */}
        <ValuePropsRibbon />

        {/* 6. Section: Agregados recientemente (Galba style: Title with blue underline, < > arrows, clean product cards, dots) */}
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 pt-4 pb-12" id="agregados-recientemente">
          {/* Header Row: Title with blue underline & Carousel Controls */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#162544] section-heading-galba">
              {hasActiveFilters ? 'Productos seleccionados' : 'Agregados recientemente'}
            </h2>

            {/* Carousel navigation arrows < > */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                aria-label="Página anterior"
                className="w-8 h-8 rounded border border-[#cbd5e1] hover:border-[#162544] hover:bg-slate-50 flex items-center justify-center text-[#64748b] hover:text-[#162544] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                aria-label="Página siguiente"
                className="w-8 h-8 rounded border border-[#cbd5e1] hover:border-[#162544] hover:bg-slate-50 flex items-center justify-center text-[#64748b] hover:text-[#162544] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Thin horizontal line */}
          <div className="w-full border-t border-[#e2e8f0] mb-6" />

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50 p-3 rounded-lg border border-[#e2e8f0]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#64748b]">Filtros activos:</span>
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162544] text-white text-xs font-semibold rounded-full">
                    Categoría: {initialCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                    <button onClick={() => setSelectedCategory('all')} className="hover:text-[#e04f26]">✕</button>
                  </span>
                )}
                {selectedBrand !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162544] text-white text-xs font-semibold rounded-full">
                    Marca: {selectedBrand}
                    <button onClick={() => setSelectedBrand('all')} className="hover:text-[#e04f26]">✕</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162544] text-white text-xs font-semibold rounded-full">
                    Búsqueda: &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')} className="hover:text-[#e04f26]">✕</button>
                  </span>
                )}
                {showOffersOnly && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e04f26] text-white text-xs font-semibold rounded-full">
                    En Oferta
                    <button onClick={() => setShowOffersOnly(false)}>✕</button>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#e04f26] hover:underline"
              >
                Limpiar filtros ✕
              </button>
            </div>
          )}

          {/* Products Grid (6 columns on desktop, matching Galba carousel display) */}
          {filteredItems.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50 rounded-lg border border-[#e2e8f0]">
              <h3 className="text-xl font-bold text-[#162544]">
                No encontramos productos con estos filtros
              </h3>
              <p className="text-sm text-[#64748b]">
                Intenta buscar por otro término o limpia los filtros activos.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full bg-[#162544] text-white text-xs font-bold hover:bg-[#1d2b53] transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${gridColsClass} gap-3 sm:gap-4`}>
              {displayedItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  cardStyle={initialConfig?.cardStyle || 'with_button'}
                  currency={initialConfig?.currency || '$us'}
                />
              ))}
            </div>
          )}

          {/* Carousel Pagination Dots (Exact Galba style: • • •) */}
          {totalPages > 1 && !hasActiveFilters && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCarouselPage(idx)}
                  aria-label={`Ir a la página ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    carouselPage === idx
                      ? 'w-7 bg-[#162544]'
                      : 'w-2.5 bg-[#cbd5e1] hover:bg-[#94a3b8]'
                  }`}
                />
              ))}
            </div>
          )}
        </section>

        {/* 7. Section: Cómo comprar info anchor */}
        <section className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 border-t border-[#e2e8f0]" id="como-comprar">
          <div className="bg-slate-50 border border-[#e2e8f0] rounded-xl p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-[#162544] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#e04f26] text-white text-xs flex items-center justify-center font-black">?</span>
              ¿Cómo comprar en Hobby Bolivia?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[#475569]">
              <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
                <strong className="block text-[#162544] font-bold mb-1">1. Elige tus repuestos</strong>
                <p className="text-xs text-[#64748b]">
                  Navega por marcas o categorías, añade al carrito las piezas y accesorios que necesites para tu modelo.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
                <strong className="block text-[#162544] font-bold mb-1">2. Envía tu pedido por WhatsApp</strong>
                <p className="text-xs text-[#64748b]">
                  Desde el carrito, genera el pedido directo a nuestro WhatsApp para coordinar pago en Bs. ($us) por QR o transferencia.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-[#e2e8f0] shadow-sm">
                <strong className="block text-[#162544] font-bold mb-1">3. Despacho inmediato</strong>
                <p className="text-xs text-[#64748b]">
                  Empacamos con protección y te enviamos el número de guía para entrega en Santa Cruz, La Paz, Cochabamba y todo el país.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Newsletter Subscription Ribbon (Galba style: Navy bar with paper airplane & email input) */}
        <NewsletterStrip />
      </main>

      {/* 9. Site Footer (Galba style: Clean white 3 columns + payment methods row) */}
      <Footer config={initialConfig} />

      {/* 10. Floating WhatsApp Button (Galba style: Green circular button in bottom-right) */}
      <FloatingWhatsApp phone={initialConfig.whatsappNumber} />
    </div>
  );
}
