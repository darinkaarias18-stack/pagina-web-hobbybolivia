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
    <article className="group flex flex-col bg-white border border-[#e2e8f0] rounded-lg p-3.5 transition-all duration-300 hover:shadow-lg hover:border-[#cbd5e1] relative">
      {/* Discount badge */}
      {item.discountPercent && !isOutOfStock && (
        <span className="absolute left-3 top-3 px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#e04f26] text-white z-10 shadow-sm">
          -{item.discountPercent}%
        </span>
      )}
      {isOutOfStock && (
        <span className="absolute left-3 top-3 px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-500 text-white z-10">
          Agotado
        </span>
      )}

      {/* Top: Product Title in Blue (Galba style) & SKU */}
      <div className="mb-2">
        <h3 className="text-xs sm:text-[13.5px] font-bold text-[#1d4ed8] group-hover:text-[#1e40af] line-clamp-2 min-h-[2.5em] leading-snug cursor-pointer" onClick={handleQuickAdd}>
          {item.title}
        </h3>
        <span className="text-[11px] text-[#94a3b8] font-mono tracking-wide block mt-0.5">
          {item.sku || brandName}
        </span>
      </div>

      {/* Product Image Container */}
      <div className="relative aspect-square w-full my-2 flex items-center justify-center overflow-hidden rounded bg-[#fafafa]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={item.title}
          className={`max-w-[85%] max-h-[85%] object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* Card Bottom: Price & Quick Action */}
      <div className="mt-auto pt-2 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
        <div>
          <div className="text-xs text-[#64748b] leading-none mb-0.5">Precio</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-[#162544] font-mono">
              {currency} {Number(item.price).toFixed(2)}
            </span>
            {item.compareAtPrice && Number(item.compareAtPrice) > Number(item.price) && (
              <span className="text-xs text-[#94a3b8] line-through font-mono">
                {currency} {Number(item.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add Button - only when cardStyle is with_button */}
        {cardStyle !== 'catalog_only' && (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            aria-label={`Añadir ${item.title}`}
            className="h-8 px-3 rounded bg-[#162544] hover:bg-[#e04f26] text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-black">+</span>
            <span className="hidden sm:inline">{hasOptions ? 'Opciones' : 'Añadir'}</span>
          </button>
        )}
      </div>
    </article>
  );
}
