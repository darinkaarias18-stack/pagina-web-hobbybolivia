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
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Carousel / pagination state for products store
  const [carouselPage, setCarouselPage] = useState<number>(0);
  const itemsPerPage = 16;

  // Compute available brands and item counts from initialItems
  const availableBrands = useMemo(() => {
    const brandsMap: Record<string, number> = {};
    initialItems.forEach((i) => {
      const b = i.brand || (i.title.toLowerCase().includes('great planes') ? 'Great Planes' : 'Dubro');
      brandsMap[b] = (brandsMap[b] || 0) + 1;
    });
    return Object.entries(brandsMap).map(([name, count]) => ({ name, count }));
  }, [initialItems]);

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
      result = result.filter((i) => {
        const itemBrand = (i.brand || (i.title.toLowerCase().includes('great planes') ? 'Great Planes' : 'Dubro')).toLowerCase().trim();
        return itemBrand === bLower;
      });
    }

    // Offers only
    if (showOffersOnly) {
      result = result.filter((i) => i.discountPercent && i.discountPercent > 0);
    }

    // In stock only
    if (inStockOnly) {
      result = result.filter((i) => i.availability !== 'OUT_OF_STOCK');
    }

    // Min price
    if (minPrice !== '' && !isNaN(Number(minPrice))) {
      result = result.filter((i) => i.price >= Number(minPrice));
    }

    // Max price
    if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
      result = result.filter((i) => i.price <= Number(maxPrice));
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((i) => {
        const inTitle = i.title.toLowerCase().includes(q);
        const inSku = i.sku.toLowerCase().includes(q);
        const inDesc = i.description.toLowerCase().includes(q);
        const inBrand = (i.brand || '').toLowerCase().includes(q);
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
    inStockOnly,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy
  ]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  // Items to display on current page
  const displayedItems = useMemo(() => {
    const start = carouselPage * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, carouselPage, itemsPerPage]);

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
    setInStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('relevance');
    setCarouselPage(0);
  };

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    if (category) setSelectedCategory(category);
    setCarouselPage(0);
    const el = document.getElementById('tienda-productos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    searchQuery.length > 0 ||
    showOffersOnly ||
    inStockOnly ||
    minPrice !== '' ||
    maxPrice !== '';

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

      {/* 2. Site Header (Logo + Wide Search Bar + Iniciar sesión + Cart) */}
      <Header
        config={initialConfig}
        categories={initialCategories}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearch={handleSearch}
        onFilterOferta={() => {
          setShowOffersOnly(!showOffersOnly);
          const el = document.getElementById('tienda-productos') || document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onFilterNuevo={() => {
          setShowNewOnly(!showNewOnly);
          const el = document.getElementById('tienda-productos') || document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          const el = document.getElementById('tienda-productos') || document.getElementById('agregados-recientemente');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <main id="contenido" className="flex-1 bg-[#f8fafc]">
        {/* Breadcrumb strip */}
        <div className="w-full bg-white border-b border-[#e2e8f0] py-2.5 px-4 sm:px-6">
          <div className="w-full max-w-[1400px] mx-auto flex items-center gap-2 text-xs text-[#64748b]">
            <a href="/" className="hover:text-[#162544] transition-colors">Inicio</a>
            <span>/</span>
            <span className="text-[#162544] font-semibold">Tienda &amp; Repuestos</span>
            {selectedCategory !== 'all' && (
              <>
                <span>/</span>
                <span className="text-[#e04f26] font-bold">
                  {initialCategories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              </>
            )}
          </div>
        </div>

        {/* 1. SECCIÓN PRINCIPAL: Tienda con Sidebar de Filtros + Grid de 4 Columnas matching reference image */}
        <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6" id="tienda-productos">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* LEFT SIDEBAR: FILTROS DE BÚSQUEDA matching reference image */}
            <aside className="w-full lg:w-72 shrink-0 bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#162544]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
                  </svg>
                  <h2 className="font-extrabold text-sm uppercase tracking-wider text-[#162544]">
                    Filtros
                  </h2>
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#e04f26] hover:underline cursor-pointer"
                  >
                    Limpiar todo ✕
                  </button>
                )}
              </div>

              {/* 1. Categorías Filter with counts */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a] mb-2.5 flex items-center justify-between">
                  <span>Categorías</span>
                  <span className="text-[10px] text-slate-400 font-bold">{initialCategories.length}</span>
                </h3>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setCarouselPage(0);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-[#162544] text-white font-bold'
                        : 'text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    <span>Todas las categorías</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {initialItems.length}
                    </span>
                  </button>

                  {initialCategories.map((c) => {
                    const count = initialItems.filter((i) => i.categoryId === c.id).length;
                    const isSelected = selectedCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(isSelected ? 'all' : c.slug);
                          setCarouselPage(0);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#162544] text-white font-bold'
                            : 'text-[#475569] hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Marcas Filter with counts */}
              <div className="border-t border-[#f1f5f9] pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a] mb-2.5 flex items-center justify-between">
                  <span>Marcas</span>
                  <span className="text-[10px] text-slate-400 font-bold">{availableBrands.length}</span>
                </h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand('all');
                      setCarouselPage(0);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedBrand === 'all'
                        ? 'bg-[#162544] text-white font-bold'
                        : 'text-[#475569] hover:bg-slate-50'
                    }`}
                  >
                    <span>Todas las marcas</span>
                  </button>
                  {availableBrands.map((b) => {
                    const isSelected = selectedBrand.toLowerCase() === b.name.toLowerCase();
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(isSelected ? 'all' : b.name);
                          setCarouselPage(0);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#162544] text-white font-bold'
                            : 'text-[#475569] hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span>{b.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {b.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Rango de Precio Filter matching reference image */}
              <div className="border-t border-[#f1f5f9] pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a] mb-2.5">
                  Rango de Precio ({initialConfig?.currency || '$us'})
                </h3>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Mín</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value);
                        setCarouselPage(0);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-lg bg-slate-50 text-[#0f172a] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#162544]"
                    />
                  </div>
                  <span className="text-slate-400 mt-3">-</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Máx</span>
                    <input
                      type="number"
                      placeholder="50"
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value);
                        setCarouselPage(0);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-[#cbd5e1] rounded-lg bg-slate-50 text-[#0f172a] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#162544]"
                    />
                  </div>
                </div>
                {/* Quick Price Buttons */}
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => { setMinPrice('0'); setMaxPrice('5'); setCarouselPage(0); }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#475569] cursor-pointer"
                  >
                    &lt; $us 5
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice('5'); setMaxPrice('15'); setCarouselPage(0); }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#475569] cursor-pointer"
                  >
                    $us 5 - 15
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMinPrice('15'); setMaxPrice(''); setCarouselPage(0); }}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[#475569] cursor-pointer"
                  >
                    &gt; $us 15
                  </button>
                </div>
              </div>

              {/* 4. Checkbox toggles: Disponibilidad y Ofertas */}
              <div className="border-t border-[#f1f5f9] pt-4 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#0f172a]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setCarouselPage(0);
                    }}
                    className="w-4 h-4 rounded text-[#162544] focus:ring-[#162544] cursor-pointer"
                  />
                  <span>Solo artículos en stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#0f172a]">
                  <input
                    type="checkbox"
                    checked={showOffersOnly}
                    onChange={(e) => {
                      setShowOffersOnly(e.target.checked);
                      setCarouselPage(0);
                    }}
                    className="w-4 h-4 rounded text-[#e04f26] focus:ring-[#e04f26] cursor-pointer"
                  />
                  <span>🔥 Solo en oferta</span>
                </label>
              </div>
            </aside>

            {/* RIGHT MAIN AREA: 4-COLUMN PRODUCT GRID matching reference image */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              
              {/* Toolbar: Heading, Item Counter, Sort Selector */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
                    Catálogo de Productos y Repuestos
                  </h1>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Mostrando <strong className="text-[#0f172a]">{filteredItems.length}</strong> {filteredItems.length === 1 ? 'producto' : 'productos'} disponibles
                  </p>
                </div>

                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <span className="text-xs text-[#64748b] font-medium hidden sm:inline">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs font-bold py-2 px-3 bg-slate-50 border border-[#cbd5e1] rounded-lg text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#162544] cursor-pointer"
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="price_asc">Precio: Menor a Mayor</option>
                    <option value="price_desc">Precio: Mayor a Menor</option>
                    <option value="name">Nombre: A - Z</option>
                    <option value="new">Más recientes</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Chips */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2.5 rounded-lg border border-[#e2e8f0]">
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
                  {(minPrice !== '' || maxPrice !== '') && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#162544] text-white text-xs font-semibold rounded-full">
                      Precio: {minPrice || '0'} - {maxPrice || '∞'} {initialConfig?.currency || '$us'}
                      <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="hover:text-[#e04f26]">✕</button>
                    </span>
                  )}
                  {inStockOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded-full">
                      En stock
                      <button onClick={() => setInStockOnly(false)}>✕</button>
                    </span>
                  )}
                  {showOffersOnly && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#be185d] text-white text-xs font-semibold rounded-full">
                      En Oferta
                      <button onClick={() => setShowOffersOnly(false)}>✕</button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="ml-auto text-xs font-bold text-[#e04f26] hover:underline cursor-pointer"
                  >
                    Limpiar todo ✕
                  </button>
                </div>
              )}

              {/* 4-COLUMN PRODUCTS GRID (Exact 4 columns matching user reference image) */}
              {filteredItems.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-white rounded-xl border border-[#e2e8f0] p-8 shadow-xs">
                  <h3 className="text-xl font-bold text-[#162544]">
                    No encontramos productos con estos filtros
                  </h3>
                  <p className="text-sm text-[#64748b]">
                    Intenta ajustar los filtros de precio, marcas o búsqueda.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-full bg-[#162544] text-white text-xs font-bold hover:bg-[#1d2b53] transition-colors shadow-sm cursor-pointer"
                  >
                    Ver todos los productos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
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

              {/* Numbered Pagination matching reference image */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    aria-label="Página anterior"
                    className="px-3.5 py-2 rounded-lg border border-[#cbd5e1] bg-white hover:border-[#162544] text-xs font-bold text-[#162544] shadow-2xs cursor-pointer"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselPage(idx)}
                      aria-label={`Ir a la página ${idx + 1}`}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        carouselPage === idx
                          ? 'bg-[#162544] text-white'
                          : 'bg-white hover:bg-slate-100 border border-[#cbd5e1] text-[#475569]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleNextPage}
                    aria-label="Página siguiente"
                    className="px-3.5 py-2 rounded-lg border border-[#cbd5e1] bg-white hover:border-[#162544] text-xs font-bold text-[#162544] shadow-2xs cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Sección: Value Propositions Ribbon (Envíos y garantía) */}
        <ValuePropsRibbon />

        {/* 3. Sección: Categorías */}
        <CategoryTilesGrid
          categories={initialCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => {
            setSelectedCategory(slug);
            const el = document.getElementById('tienda-productos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4. Sección: Marcas */}
        <BrandsStrip
          selectedBrand={selectedBrand}
          onSelectBrand={(brand) => {
            setSelectedBrand(brand);
            const el = document.getElementById('tienda-productos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 5. Banner promocional secundario (si existe heroBannerUrl configurado) */}
        {initialConfig?.heroBannerUrl && (
          <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-4">
            <div className="relative w-full h-36 sm:h-48 md:h-56 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center group">
              <img
                src={initialConfig.heroBannerUrl}
                alt={initialConfig.companyName || 'Banner'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-bold tracking-wider uppercase text-[#f2b705] mb-1">
                  {initialConfig.subtitle || 'Catálogo Oficial'}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  {initialConfig.companyName || 'Hobby Bolivia'}
                </h2>
              </div>
            </div>
          </div>
        )}

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
