'use client';

import React, { useState } from 'react';
import { Eye, Check, Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product?: Product;
  item?: Product;
  exchangeRate?: number;
  currencyMode?: 'auto' | 'BOB' | 'USD';
  onQuickView?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function ProductCard({
  product: productProp,
  item: itemProp,
  exchangeRate = 11.84,
  currencyMode = 'auto',
  onQuickView
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const product = productProp || itemProp;

  if (!product) return null;

  const handleQuickView = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 700);
  };

  const rawImage = product.image_url || (product.images && product.images[0]) || product.imageUrl;
  const isInvalidImage = !rawImage || rawImage.trim() === '' || rawImage.includes('d0721149ad-dubq3570tn-t');
  const isPlaceholder = isInvalidImage || imgFailed;
  const imageSource = isPlaceholder ? '/placeholder.webp' : rawImage.trim();
  const name = product.name || product.title || "Producto Hobby Bolivia";
  // Mostrar fielmente el SKU/Código oficial del producto (coincidente con Admin Products)
  const systemSku = product.sku || (product.id ? `HB-${product.id.toString().padStart(4, '0')}` : '');

  // Determinación de precio en USD o Bs. según selección "Mostrar en" o moneda global del catálogo
  const isUsd =
    currencyMode === 'USD'
      ? true
      : currencyMode === 'BOB'
        ? false
        : String(product.currency || '').trim().toUpperCase() === 'USD' ||
        String((product as any).display_currency || '').trim().toUpperCase() === 'USD';
  const rate = exchangeRate > 0 ? exchangeRate : 11.8552;
  const usdPrice = (product.price / rate).toFixed(2);
  const bsPrice = product.price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Badges: Popular o Nuevo
  const showPopular = product.badge === 'Popular' || product.badge === 'Best Seller';
  const showNuevo = product.badge === 'Nuevo';
  const validBadge = showPopular ? 'Popular' : (showNuevo ? 'Nuevo' : null);

  return (
    <div
      onClick={() => handleQuickView()}
      className="group relative rounded-2xl bg-white border-2 border-[#D4A359]/60 hover:border-[#D4A359] shadow-sm hover:shadow-2xl hover:scale-[1.15] hover:z-30 transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer overflow-hidden"
      title="Clic para ver detalles y cotizar"
    >
      {/* 1. Fondo de la Imagen y Contenedor Superior con aspect ratio cuadrado simetrico sin recortes y borde delimitado */}
      <div className={`w-full aspect-square relative overflow-hidden flex items-center justify-center border-b-2 border-[#D4A359]/40 ${isPlaceholder ? 'bg-[#FAF8F5]' : 'bg-white'}`}>
        {/* Distintivo / Badge en esquina superior derecha con diseño pulido */}
        {validBadge && (
          <span
            className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold tracking-wider backdrop-blur-md shadow-xs border select-none pointer-events-none ${validBadge === 'Popular'
              ? 'bg-black/80 text-amber-400 border-amber-400/20'
              : 'bg-[#D4A359]/90 text-neutral-900 border-[#D4A359]'
              }`}
            title={validBadge === 'Popular' ? 'Producto Popular · El más pedido' : 'Nuevo Producto'}
          >
            {validBadge.toUpperCase()}
          </span>
        )}

        <img
          src={imageSource}
          alt={name}
          className={`w-full h-full mx-auto select-none ${isPlaceholder ? 'object-cover' : 'object-contain p-2'}`}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (!imgFailed) {
              setImgFailed(true);
            }
          }}
        />
      </div>

      {/* 2. Tipografía y Jerarquía Visual */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="inline-block text-xs font-medium text-amber-700/90 tracking-wider uppercase font-mono">
            {systemSku}
          </span>

          <h3
            className="mt-1 font-bold text-sm sm:text-base text-neutral-900 group-hover:text-[#D4A359] transition-colors line-clamp-2 leading-tight"
            title={name}
          >
            {name}
          </h3>
        </div>

        {/* 3. Zona Inferior: Precio y Botones de Acción (sin línea divisoria) */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          {/* Bloque de Precio Resaltado */}
          <div className="min-w-0 flex-1 text-left">
            {isUsd ? (
              <span className="text-xl font-extrabold text-neutral-900 block leading-tight">
                ${usdPrice}
                <span className="text-xs font-normal text-neutral-400 ml-1">USD</span>
              </span>
            ) : (
              <span className="text-xl font-extrabold text-neutral-900 block leading-tight">
                Bs. {bsPrice}
              </span>
            )}
          </div>

          {/* Botones Redondeados (rounded-full) con micro-interacciones visuales */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleQuickView}
              type="button"
              title="Vista rápida del producto"
              className="w-8 h-8 rounded-full bg-neutral-50 hover:bg-amber-100 text-neutral-600 hover:text-amber-800 border border-neutral-200/80 hover:border-amber-400 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAddToCart}
              type="button"
              title={justAdded ? "¡Añadido al carrito!" : "Añadir al carrito"}
              className={`w-8 h-8 rounded-full font-bold transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer ${justAdded
                ? 'bg-emerald-600 text-white scale-110 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-neutral-900 hover:bg-amber-600 hover:scale-110 text-white hover:text-white active:scale-90'
                }`}
            >
              {justAdded ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
