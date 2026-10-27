'use client';

import React, { useState } from 'react';
import { ShoppingCart, Eye, Check } from 'lucide-react';
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
  const product = productProp || itemProp;
  if (!product) return null;

  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

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
  const name = product.name || product.title || "Repuesto Hobby Bolivia";
  const systemSku = (product.sku && product.sku.startsWith('HB-')) ? product.sku : `HB-${product.id.toString().padStart(4, '0')}`;

  // Determinación de si se muestra en USD o en Bs.
  const isUsd = currencyMode === 'USD' || (currencyMode !== 'BOB' && product.currency === 'USD');
  const rate = exchangeRate > 0 ? exchangeRate : 11.84;
  const usdPrice = (product.price / rate).toFixed(2);
  const bsPrice = product.price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Solo se permite mostrar badge si es "Popular" (o el más pedido) o "Nuevo", nada más
  const showPopular = product.badge === 'Popular' || product.badge === 'Best Seller';
  const showNuevo = product.badge === 'Nuevo';
  const validBadge = showPopular ? 'Popular' : (showNuevo ? 'Nuevo' : null);

  return (
    <div
      onClick={() => handleQuickView()}
      className="group relative rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] text-center p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
      title="Clic para ver detalles y cotizar"
    >
      {/* Solo mostrar badge si es Popular o Nuevo, nada más */}
      {validBadge && (
        <span
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border select-none ${
            validBadge === 'Popular'
              ? 'bg-[#211E1C] text-[#D4A359] border-[#D4A359]/60 shadow-xs'
              : 'bg-[#D4A359] text-[#161311] border-[#D4A359]'
          }`}
          title={validBadge === 'Popular' ? 'Repuesto Popular · El más pedido' : 'Nuevo Repuesto'}
        >
          {validBadge}
        </span>
      )}

      {/* 1. Imagen del Producto */}
      <div className="w-full h-44 bg-white rounded-2xl p-3 flex items-center justify-center relative border border-[#EBE5DB] overflow-hidden">
        <img
          src={imageSource}
          alt={name}
          className="max-h-full max-w-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />
      </div>

      {/* 2. Código asignado por el sistema, 3. Nombre del Repuesto, 4. Precio */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Código asignado por el sistema */}
          <span className="inline-block text-[11px] font-mono font-black text-[#D4A359] tracking-wider uppercase">
            {systemSku}
          </span>

          {/* Nombre del Repuesto */}
          <h3
            className="mt-1 font-extrabold text-sm sm:text-base text-[#1A1817] group-hover:text-[#D4A359] transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </h3>
        </div>

        {/* Precio (en Bs. o en USD según la opción elegida) */}
        <div className="mt-3 pt-2.5 border-t border-[#E8E2D8]">
          {isUsd ? (
            <div>
              <span className="text-base sm:text-lg font-black text-[#1A1817]">
                ${usdPrice} <span className="text-xs font-bold text-[#8C827A]">USD</span>
              </span>
              <span className="block text-[11px] text-[#8C827A] font-semibold mt-0.5">
                ≈ Bs. {bsPrice}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-base sm:text-lg font-black text-[#1A1817]">
                Bs. {bsPrice}
              </span>
              <span className="block text-[11px] text-[#8C827A] font-semibold mt-0.5">
                ≈ ${usdPrice} USD
              </span>
            </div>
          )}
        </div>

        {/* Acciones: Carrito y Ojovisor */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAddToCart}
              type="button"
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                justAdded
                  ? 'bg-[#3E7B44] text-white'
                  : 'bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] active:scale-[0.98]'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>¡Añadido!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Añadir</span>
                </>
              )}
            </button>

            <button
              onClick={handleQuickView}
              type="button"
              title="Ver más detalles sobre el producto"
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#EBE5DB] text-[#1A1817] flex items-center justify-center border border-[#E2DCD3] transition-colors cursor-pointer shrink-0"
            >
              <Eye className="w-4 h-4 text-[#5C5650] hover:text-[#1A1817]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
