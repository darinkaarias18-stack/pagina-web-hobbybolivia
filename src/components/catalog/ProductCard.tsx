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
    setTimeout(() => setJustAdded(false), 1500);
  };

  const imageSource = product.image_url || (product.images && product.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
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
      className="group relative hover:z-50 rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] p-3 hover:scale-135 hover:shadow-2xl transition-all duration-300 ease-out flex flex-col justify-between cursor-pointer"
      title="Clic para ver detalles y cotizar"
    >
      {/* 1. Caja de Imagen (crece junto con toda la tarjeta como un solo bloque) */}
      <div className="w-full h-36 bg-white rounded-xl p-2 flex items-center justify-center relative border border-[#EBE5DB] group-hover:border-[#D4A359]/60 overflow-hidden transition-colors duration-300">
        {/* Etiqueta / Badge en esquina superior derecha */}
        {validBadge && (
          <span
            className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-xs border select-none pointer-events-none ${validBadge === 'Popular'
              ? 'bg-[#211E1C] text-[#D4A359] border-[#D4A359]/60'
              : 'bg-[#D4A359] text-[#161311] border-[#D4A359]'
              }`}
            title={validBadge === 'Popular' ? 'Producto Popular · El más pedido' : 'Nuevo Producto'}
          >
            {validBadge}
          </span>
        )}

        <img
          src={imageSource}
          alt={name}
          className="max-h-full max-w-full w-full h-full object-contain mx-auto"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 2. Textos: SKU y Nombre */}
      <div className="pt-2 flex-1 flex flex-col justify-between">
        <div>
          <span className="inline-block text-[10px] font-mono font-bold text-[#D4A359] tracking-wider uppercase">
            {systemSku}
          </span>

          <h3
            className="mt-0.5 font-semibold text-xs text-[#1A1817] group-hover:text-[#D4A359] transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </h3>
        </div>

        {/* 3. Fila Horizontal de Precio y Acción */}
        <div className="mt-2.5 pt-2 border-t border-[#E8E2D8] flex items-center justify-between gap-1.5">
          {/* Bloque de Precio: Muestra exactamente Bs. o USD según columna "Mostrar en" */}
          <div className="min-w-0 flex-1 text-left">
            {isUsd ? (
              <span className="text-sm font-black text-[#1A1817] block leading-tight">
                ${usdPrice} <span className="text-[10px] font-bold text-[#8C827A]">USD</span>
              </span>
            ) : (
              <span className="text-sm font-black text-[#1A1817] block leading-tight">
                Bs. {bsPrice}
              </span>
            )}
          </div>

          {/* Botones de Acción Compactos */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleQuickView}
              type="button"
              title="Vista rápida del producto"
              className="p-1.5 rounded-lg bg-white hover:bg-[#EBE5DB] text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleAddToCart}
              type="button"
              title={justAdded ? "¡Añadido al carrito!" : "Añadir al carrito"}
              className={`p-2 rounded-xl font-bold transition-all shadow-xs flex items-center justify-center cursor-pointer ${justAdded
                ? 'bg-[#3E7B44] text-white'
                : 'bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] active:scale-95'
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
