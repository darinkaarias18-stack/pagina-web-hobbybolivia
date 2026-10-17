'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import type { CatalogItem } from '@/lib/types';

interface ProductCardProps {
  item: CatalogItem;
  cardStyle?: 'with_button' | 'catalog_only';
  currency?: string;
}

export function ProductCard({ item, cardStyle = 'with_button', currency = '$us' }: ProductCardProps) {
  const { addToCart, openOptionsModal } = useCart();

  const isOutOfStock = item.availability === 'OUT_OF_STOCK';
  const hasOptions = item.actionType === 'SELECT_OPTIONS' && item.variants && item.variants.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (hasOptions) {
      openOptionsModal(item);
    } else {
      addToCart(item, 1);
    }
  };

  const mainImage = item.images && item.images.length > 0
    ? item.images[0]
    : 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';

  const brandName = item.brand || (item.title.toLowerCase().includes('great planes') ? 'Great Planes' : 'Dubro');

  return (
    <article className="group flex flex-col bg-white border border-[#e2e8f0] rounded-xl p-3.5 transition-all duration-300 hover:shadow-xl hover:border-[#cbd5e1] hover:-translate-y-0.5 relative">
      {/* Top badges (Oferta / Agotado) matching reference image */}
      {item.discountPercent && !isOutOfStock && (
        <span className="absolute left-3 top-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-[#be185d] text-white z-10 shadow-sm">
          Oferta -{item.discountPercent}%
        </span>
      )}
      {isOutOfStock && (
        <span className="absolute left-3 top-3 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-500 text-white z-10">
          Agotado
        </span>
      )}

      {/* 1. Product Image at Top */}
      <div
        className="relative aspect-square w-full mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-[#f8fafc] cursor-pointer group-hover:bg-white transition-colors"
        onClick={handleQuickAdd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={item.title}
          className={`max-w-[88%] max-h-[88%] object-contain transition-transform duration-500 group-hover:scale-108 drop-shadow-xs ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* 2. Brand & SKU Code */}
      <div className="flex items-center justify-between text-[11px] text-[#64748b] font-medium mb-1">
        <span className="uppercase tracking-wider font-semibold text-[#0f172a]/70 truncate">{brandName}</span>
        {item.sku && <span className="font-mono text-[#94a3b8] text-[10px]">{item.sku}</span>}
      </div>

      {/* 3. Product Title */}
      <h3
        className="text-[13px] sm:text-[14px] font-bold text-[#0f172a] group-hover:text-[#2563eb] line-clamp-2 min-h-[2.6em] leading-snug cursor-pointer transition-colors mb-2"
        onClick={handleQuickAdd}
        title={item.title}
      >
        {item.title}
      </h3>

      {/* 4. Stock status & Price */}
      <div className="mt-auto pt-2 border-t border-[#f1f5f9] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-[#0f172a]">
              {currency} {Number(item.price).toFixed(2)}
            </span>
            {item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price) && (
              <span className="text-xs text-[#94a3b8] line-through font-mono">
                {currency} {Number(item.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
          <span className={`text-[11px] font-bold flex items-center gap-1 ${isOutOfStock ? 'text-slate-400' : 'text-emerald-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-slate-400' : 'bg-emerald-500'}`} />
            {isOutOfStock ? 'Agotado' : 'En stock'}
          </span>
        </div>

        {/* 5. Full width dark action button matching reference image */}
        {cardStyle !== 'catalog_only' && (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Añadir ${item.title}`}
            className="w-full mt-2 py-2 px-3 rounded-full bg-[#162544] hover:bg-[#e04f26] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>{hasOptions ? 'Ver Opciones' : 'Añadir al carrito'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
