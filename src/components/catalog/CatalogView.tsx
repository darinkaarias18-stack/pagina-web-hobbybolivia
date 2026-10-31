'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  SlidersHorizontal,
  Search,
  Filter,
  RotateCcw,
  Check,
  ChevronDown,
  LayoutGrid,
  ShoppingCart,
  Plane,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { TopBar } from '@/components/layout/TopBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from './HeroSection';
import { BrandsStrip } from './BrandsStrip';
import { CategoryTilesGrid } from './CategoryTilesGrid';
import { ProductCard } from './ProductCard';
import { QuickSpecsModal } from './QuickSpecsModal';
import { TrustRibbon } from './TrustRibbon';
import { Testimonials } from './Testimonials';

import type {
  SiteConfig,
  Category,
  Product,
  Banner,
  Occasion,
  Policy
} from '@/lib/types';

interface CatalogViewProps {
  initialConfig?: SiteConfig | null;
  initialCategories?: Category[];
  initialOccasions?: Occasion[];
  initialItems?: Product[];
  initialBanners?: Banner[];
  initialPolicies?: Policy[];
  initialExchangeRate?: number;
}

export function CatalogView({
  initialConfig,
  initialCategories = [],
  initialItems = [],
  initialPolicies = [],
  initialExchangeRate = 6.96
}: CatalogViewProps) {
  const [products, setProducts] = useState<Product[]>(initialItems);
  const [categories] = useState<Category[]>(initialCategories);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null | undefined>(initialConfig);

  // Sync state if initialItems prop updates
  useEffect(() => {
    setProducts(initialItems);
  }, [initialItems]);

  useEffect(() => {
    setSiteConfig(initialConfig);
  }, [initialConfig]);

  // Real-time synchronization across browser tabs (Admin <-> Public Catalog)
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // 1. BroadcastChannel for instant inter-tab communication
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('hb_catalog_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'CONFIG_UPDATED' && event.data?.config) {
          setSiteConfig(event.data.config);
        }
        if (event.data?.type === 'PRODUCT_UPDATED') {
          const { id, field, value } = event.data;
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === id) {
                return {
                  ...p,
                  [field]: value,
                  ...(field === 'currency' ? { currency: value, display_currency: value } : {}),
                  ...(field === 'is_active' ? { is_active: Boolean(value), isActive: Boolean(value) } : {})
                };
              }
              return p;
            })
          );
          refreshProducts();
        }
      };
    } catch {
      // BroadcastChannel fallback
    }

    // 2. Storage event (fires when another tab updates localStorage)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hb_catalog_sync') {
        try {
          const data = JSON.parse(e.newValue || '{}');
          if (data?.id) {
            setProducts((prev) =>
              prev.map((p) => {
                if (p.id === data.id) {
                  return {
                    ...p,
                    [data.field]: data.value,
                    ...(data.field === 'currency' ? { currency: data.value, display_currency: data.value } : {})
                  };
                }
                return p;
              })
            );
          }
        } catch {
          // ignore
        }
        refreshProducts();
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Window focus (when user switches back to catalog tab, auto-refresh)
    const handleFocus = () => {
      refreshProducts();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshProducts]);

  // Filters State
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScale, setSelectedScale] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minPriceUsd, setMinPriceUsd] = useState<string>('');
  const [maxPriceUsd, setMaxPriceUsd] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popular');

  // Modal & Favorites State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { totalCount, openDrawer } = useCart();

  // Category Pills Carousel Controls
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkCategoryScroll();
    window.addEventListener('resize', checkCategoryScroll);
    return () => window.removeEventListener('resize', checkCategoryScroll);
  }, [categories]);

  useEffect(() => {
    if (categoryScrollRef.current) {
      const activeEl = categoryScrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
    checkCategoryScroll();
  }, [activeCategorySlug]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = 260;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkCategoryScroll, 320);
    }
  };

  const activeFiltersCount = useMemo(() => {
    return [
      activeCategorySlug !== 'all',
      searchQuery.trim().length > 0,
      selectedScale !== 'all',
      selectedMaterial !== 'all',
      onlyInStock,
      minPrice !== '',
      maxPrice !== '',
      minPriceUsd !== '',
      maxPriceUsd !== ''
    ].filter(Boolean).length;
  }, [activeCategorySlug, searchQuery, selectedScale, selectedMaterial, onlyInStock, minPrice, maxPrice, minPriceUsd, maxPriceUsd]);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hb_favorites');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('hb_favorites', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };


  const resetFilters = () => {
    setActiveCategorySlug('all');
    setSearchQuery('');
    setSelectedScale('all');
    setSelectedMaterial('all');
    setOnlyInStock(false);
    setMinPrice('');
    setMaxPrice('');
    setMinPriceUsd('');
    setMaxPriceUsd('');
    setSortBy('popular');
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.is_active === false || p.isActive === false) return false;

      // Category filter
      if (activeCategorySlug !== 'all') {
        const cat = categories.find((c) => c.slug === activeCategorySlug);
        const catId = p.category_id || p.categoryId;
        if (cat && catId !== cat.id) return false;
      }

      // Keyword / SKU / Brand search
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim();
        const matchesName = (p.name || p.title || '').toLowerCase().includes(term);
        const matchesSku = (p.sku || '').toLowerCase().includes(term);
        const matchesBrand = (p.brand || '').toLowerCase().includes(term);
        const matchesSpecs = (p.specs_line || '').toLowerCase().includes(term);
        const matchesModels = (p.compatible_models || '').toLowerCase().includes(term);
        if (!matchesName && !matchesSku && !matchesBrand && !matchesSpecs && !matchesModels) return false;
      }

      // Scale filter
      if (selectedScale !== 'all') {
        if (!p.scale || !p.scale.toLowerCase().includes(selectedScale.toLowerCase())) {
          return false;
        }
      }

      // Material filter
      if (selectedMaterial !== 'all') {
        if (!p.material || !p.material.toLowerCase().includes(selectedMaterial.toLowerCase())) {
          return false;
        }
      }

      // In Stock filter
      if (onlyInStock) {
        const stockCount = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
        if (stockCount <= 0) return false;
      }

      // Rate for USD price conversion
      const rate = initialExchangeRate > 0 ? initialExchangeRate : 6.96;
      const productUsd = p.price / rate;

      // Price range in Bs.
      if (minPrice && !isNaN(Number(minPrice))) {
        if (p.price < Number(minPrice)) return false;
      }
      if (maxPrice && !isNaN(Number(maxPrice))) {
        if (p.price > Number(maxPrice)) return false;
      }

      // Price range in USD
      if (minPriceUsd && !isNaN(Number(minPriceUsd))) {
        if (productUsd < Number(minPriceUsd)) return false;
      }
      if (maxPriceUsd && !isNaN(Number(maxPriceUsd))) {
        if (productUsd > Number(maxPriceUsd)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return (a.name || a.title || '').localeCompare(b.name || b.title || '');
      if (sortBy === 'popular') {
        const aVal = a.badge === 'Popular' ? 2 : 0;
        const bVal = b.badge === 'Popular' ? 2 : 0;
        return bVal - aVal;
      }
      return 0;
    });
  }, [
    products,
    categories,
    activeCategorySlug,
    searchQuery,
    selectedScale,
    selectedMaterial,
    onlyInStock,
    minPrice,
    maxPrice,
    minPriceUsd,
    maxPriceUsd,
    initialExchangeRate,
    sortBy
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F2EB] text-[#1A1817] overflow-x-hidden">

      {/* 1. Top Utility Bar (Carbón #161311 & Dorado #D4A359) */}
      {siteConfig?.showTopBar !== false && (
        <TopBar config={siteConfig} exchangeRate={initialExchangeRate} />
      )}

      {/* 2. Sticky Main Header with Logo & Cart */}
      <Header
        config={siteConfig}
        favoritesCount={favorites.length}
      />

      {/* 3. Hero Section (Carbón Espresso #161311 + Two Tone Headline + Badges) */}
      <HeroSection />

      {/* 4. Brands / Systems Ribbon */}
      <BrandsStrip />

      {/* 5. "Encuentra el Producto Perfecto" Category Cards */}
      <CategoryTilesGrid
        categories={categories}
        onSelectCategory={(slug) => setActiveCategorySlug(slug)}
        activeCategory={activeCategorySlug}
      />

      {/* 6. Main Interactive Catalog Section */}
      <section id="catalogo" className="py-14 bg-[#F5F2EB]">
        <div id="categorias" className="scroll-mt-24"></div>
        <div id="ofertas" className="scroll-mt-24"></div>
        <div className="w-full max-w-[1320px] mx-auto px-4">

          {/* Section Header with Centered Line */}
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px bg-gradient-to-r from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-24"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
              <h2 className="text-xl sm:text-3xl font-black text-[#1A1817] uppercase tracking-wider">
                CATÁLOGO DE PRODUCTOS DE AVIONES A ESCALA
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
              <span className="h-px bg-gradient-to-l from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-24"></span>
            </div>
            <p className="text-xs sm:text-sm text-[#5C5650] max-w-none whitespace-normal md:whitespace-nowrap">
              Filtra por sistema, material o escala y arma tu cotización directa con precios en Bolivianos (Bs.).
            </p>
          </div>

          {/* Buscador Simple con Lupa */}
          <div id="buscador-catalogo" className="mb-8 max-w-2xl mx-auto px-4">
            <div className="relative flex items-center">
              <div className="absolute left-4.5 flex items-center pointer-events-none text-[#D4A359]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Buscar por producto, SKU, marca (Dubro, Great Planes)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white text-[#1A1817] placeholder-[#8C827A] text-xs sm:text-sm font-medium rounded-full border border-[#E2DCD3] shadow-xs hover:border-[#D4A359] focus:border-[#D4A359] focus:ring-4 focus:ring-[#D4A359]/15 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1.5 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills Carousel */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 flex items-center gap-1.5 overflow-hidden">

              {/* Left Carousel Navigation Arrow */}
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-[#FAF8F5] text-[#1A1817] hover:text-[#D4A359] border border-[#E2DCD3] shadow-md transition-all shrink-0 z-20 cursor-pointer"
                  title="Desplazar a la izquierda"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Pills Scroll Track Container */}
              <div className="relative flex-1 overflow-hidden">
                {/* Left/Right Gradient Masks */}
                {canScrollLeft && (
                  <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#F5F2EB] to-transparent" />
                )}
                {canScrollRight && (
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#F5F2EB] to-transparent" />
                )}

                <div
                  ref={categoryScrollRef}
                  onScroll={checkCategoryScroll}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 px-0.5 no-scrollbar"
                >
                  <button
                    type="button"
                    onClick={() => setActiveCategorySlug('all')}
                    data-active={activeCategorySlug === 'all' ? 'true' : undefined}
                    className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all shrink-0 cursor-pointer ${activeCategorySlug === 'all'
                      ? 'bg-[#211E1C] text-[#FAF8F5] shadow-md border border-[#D4A359]/40'
                      : 'bg-[#FAF8F5] hover:bg-white text-[#1A1817] border border-[#E2DCD3]'
                      }`}
                  >
                    Todos ({products.length})
                  </button>

                  {categories.map((cat) => {
                    const isActive = activeCategorySlug === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategorySlug(cat.slug)}
                        data-active={isActive ? 'true' : undefined}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${isActive
                          ? 'bg-[#211E1C] text-[#FAF8F5] shadow-md border border-[#D4A359]/40'
                          : 'bg-[#FAF8F5] hover:bg-white text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3]'
                          }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Carousel Navigation Arrow */}
              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-[#FAF8F5] text-[#1A1817] hover:text-[#D4A359] border border-[#E2DCD3] shadow-md transition-all shrink-0 z-20 cursor-pointer"
                  title="Desplazar a la derecha"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

            </div>

            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-[#FAF8F5] border border-[#E2DCD3] rounded-full text-xs font-bold text-[#1A1817] shrink-0 relative cursor-pointer ml-1"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 bg-[#D4A359] text-[#161311] text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Catalog Layout: Sidebar + Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* Advanced Filters Sidebar */}
            <aside
              className={`lg:block ${mobileFiltersOpen ? 'block' : 'hidden'
                } bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-[#E2DCD3] space-y-6 lg:sticky lg:top-24 shadow-sm`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#1A1817]">
                  <Filter className="w-4 h-4 text-[#D4A359]" />
                  <span>Filtros Técnicos</span>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[11px] font-bold text-[#D4A359] hover:text-[#C69755] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              </div>

              {/* Live Search by Name or SKU */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Buscar por Nombre o SKU
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ej. DUBQ3570, APC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Escala */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Escala de Modelo
                </label>
                <select
                  value={selectedScale}
                  onChange={(e) => setSelectedScale(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold"
                >
                  <option value="all">Todas las Escalas</option>
                  <option value="RC Estándar">RC Estándar</option>
                  <option value="Micro">Micro / 1:32</option>
                  <option value="1:10">1:10 / Escala Grande</option>
                  <option value="1:48">1:48</option>
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Material
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold"
                >
                  <option value="all">Todos los Materiales</option>
                  <option value="Acero">Acero Templado</option>
                  <option value="Aluminio">Aluminio CNC / Latón</option>
                  <option value="Fibra de Carbono">Fibra de Carbono</option>
                  <option value="Nylon">Nylon Compuesto</option>
                  <option value="Compuesto">Compuesto Poliamida</option>
                </select>
              </div>

              {/* Rango de Precios en Bs. */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Rango de Precios (Bs.)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Mín"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 text-xs py-2 px-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                  <span className="text-[#8C827A] text-xs">-</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Máx"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 text-xs py-2 px-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                </div>
              </div>

              {/* Rango de Precios en USD */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Rango de Precios (USD)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Mín"
                    value={minPriceUsd}
                    onChange={(e) => setMinPriceUsd(e.target.value)}
                    className="w-1/2 text-xs py-2 px-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                  <span className="text-[#8C827A] text-xs">-</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="Máx"
                    value={maxPriceUsd}
                    onChange={(e) => setMaxPriceUsd(e.target.value)}
                    className="w-1/2 text-xs py-2 px-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                </div>
              </div>

              {/* Ordenar Por */}
              <div className="pt-3 border-t border-[#E2DCD3]">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5C5650] mb-1.5">
                  Ordenar Catálogo
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold"
                >
                  <option value="popular">Más Populares / Destacados</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="name_asc">Nombre Alfabético</option>
                </select>
              </div>

              {/* Botón Aplicar en móvil */}
              <div className="lg:hidden pt-3 border-t border-[#E2DCD3]">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 px-4 rounded-xl bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4 text-[#D4A359]" />
                  <span>Ver {filteredProducts.length} Productos</span>
                </button>
              </div>

            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">

              {/* Results status bar */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E2DCD3] text-xs text-[#5C5650]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    Mostrando <strong className="text-[#1A1817]">{filteredProducts.length}</strong> de {products.length} productos disponibles
                  </span>
                  {activeCategorySlug !== 'all' && (
                    <span className="bg-[#FAF8F5] border border-[#D4A359]/40 text-[#1A1817] px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
                      {categories.find(c => c.slug === activeCategorySlug)?.name}
                    </span>
                  )}
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D4A359]/40 p-8 space-y-3">
                  <SlidersHorizontal className="w-8 h-8 text-[#D4A359] mx-auto" />
                  <h4 className="font-extrabold text-base text-[#1A1817]">No se encontraron productos</h4>
                  <p className="text-xs text-[#5C5650] max-w-sm mx-auto">
                    Intenta cambiar o limpiar los filtros seleccionados para ver más componentes de aeromodelismo.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-2 px-5 py-2.5 bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-bold text-xs rounded-full transition-colors cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              ) : (
                <div
                  className={
                    siteConfig?.desktopColumns === 8
                      ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5'
                      : siteConfig?.desktopColumns === 6
                        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3'
                        : siteConfig?.desktopColumns === 3
                          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4'
                          : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5'
                  }
                >
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      exchangeRate={initialExchangeRate}
                      currencyMode={
                        siteConfig?.currency === 'USD' || siteConfig?.currency === '$us'
                          ? 'USD'
                          : siteConfig?.currency === 'Bs.'
                            ? 'BOB'
                            : 'auto'
                      }
                      onQuickView={(p) => setQuickViewProduct(p)}
                      isFavorite={favorites.includes(prod.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>


      {/* 8. Trust Ribbon (4 Guarantees in Dark Block with Gold Icons) */}
      <TrustRibbon />

      {/* 10. Customer Testimonials */}
      <Testimonials />

      {/* 12. Footer with CTA, Popular Products & Brands */}
      <Footer
        config={siteConfig}
        products={products}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onSelectBrand={(brand) => {
          setActiveCategorySlug('all');
          setSearchQuery(brand);
        }}
      />

      {/* Quick Specs Technical Modal */}
      {quickViewProduct && (
        <QuickSpecsModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          exchangeRate={initialExchangeRate}
        />
      )}

      {/* 13. Mobile Bottom Sticky Navigation Bar (100% Mobile Ready) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#161311]/95 backdrop-blur-md border-t border-[#2D2622] py-2 px-4 shadow-2xl flex items-center justify-between">
        <a
          href="#catalogo"
          className="flex flex-col items-center justify-center text-[#FAF8F5] hover:text-[#D4A359] px-2 py-1 transition-colors"
        >
          <LayoutGrid className="w-5 h-5 text-[#D4A359]" />
          <span className="text-[10px] font-bold mt-0.5">Catálogo</span>
        </a>

        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={`flex flex-col items-center justify-center px-2 py-1 transition-colors relative cursor-pointer ${mobileFiltersOpen || activeFiltersCount > 0 ? 'text-[#D4A359]' : 'text-[#FAF8F5] hover:text-[#D4A359]'
            }`}
        >
          <div className="relative">
            <SlidersHorizontal className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D4A359] text-[#161311] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Filtros</span>
        </button>

        <a
          href="https://wa.me/59177293446?text=Hola%20Hobby%20Bolivia,%20deseo%20consultar%20sobre%20productos%20de%20aviones%20a%20escala."
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3.5 py-1.5 rounded-full font-black text-xs shadow-md transition-all active:scale-95"
          title="WhatsApp Oficial Hobby Bolivia"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={openDrawer}
          className="flex flex-col items-center justify-center text-[#FAF8F5] hover:text-[#D4A359] px-2 py-1 transition-colors relative cursor-pointer"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5 text-[#D4A359]" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D4A359] text-[#161311] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5">Pedido</span>
        </button>
      </div>

    </div>
  );
}
