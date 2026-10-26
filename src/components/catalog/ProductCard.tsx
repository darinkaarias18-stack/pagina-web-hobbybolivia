'use client';

import React from 'react';
import { ShoppingCart, Eye, Heart, Star, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product?: Product;
  item?: Product;
  onQuickView?: (product: Product) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export function ProductCard({
  product: productProp,
  item: itemProp,
  onQuickView,
  isFavorite = false,
  onToggleFavorite
}: ProductCardProps) {
  const product = productProp || itemProp;
  if (!product) return null;

  const handleQuickView = (p: Product) => {
    if (onQuickView) onQuickView(p);
  };

  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Badge styling: Warm tech palette
  const getBadgeStyle = (badge?: string | null) => {
    switch (badge) {
      case 'Best Seller':
        return 'bg-[#F85606] text-white';
      case 'Nuevo':
        return 'bg-[#D4A359] text-[#161311]';
      case 'Popular':
        return 'bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/40';
      case 'Pocas Unidades':
        return 'bg-[#C69755] text-white';
      case 'Oferta':
        return 'bg-[#F85606] text-white';
      default:
        return 'bg-[#211E1C] text-[#FAF8F5]';
    }
  };

  const isOutOfStock = (product.stock || product.stockQuantity || 0) <= 0;
  const imageSource = product.image_url || (product.images && product.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
  const name = product.name || product.title || "Repuesto Hobby Bolivia";

  return (
    <div className="group relative rounded-2xl bg-[#FAF8F5] border border-[#E2DCD3] hover:border-[#D4A359] text-center p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      
      {/* Top Header: Badge + Heart Toggle */}
      <div className="flex items-center justify-between w-full mb-2 z-10">
        <div>
          {product.badge ? (
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getBadgeStyle(product.badge)} shadow-xs`}>
              {product.badge}
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-[#8C827A] bg-[#EFEAE2] uppercase tracking-wider">
              {product.scale || 'RC'}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(product.id);
          }}
          type="button"
          aria-label="Agregar a favoritos"
          className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#8C827A] hover:text-[#F85606] transition-colors border border-[#E2DCD3] cursor-pointer"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#F85606] text-[#F85606]' : ''}`} />
        </button>
      </div>

      {/* Product Image (Strict Rule: intact URL, object-contain, h-40, clean bg-white container) */}
      <div
        onClick={() => handleQuickView(product)}
        className="w-full h-40 bg-white rounded-xl p-3 flex items-center justify-center cursor-pointer relative border border-[#EBE5DB] overflow-hidden"
      >
        <img
          src={imageSource}
          alt={name}
          className="max-h-full max-w-full object-contain mx-auto group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Hover Quick View Trigger on image */}
        <div className="absolute inset-0 bg-[#161311]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 bg-[#161311] text-[#FAF8F5] text-[11px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1.5 border border-[#D4A359]/40">
            <Eye className="w-3.5 h-3.5 text-[#D4A359]" />
            Vista Rápida
          </span>
        </div>
      </div>

      {/* Product Information (Centered Format) */}
      <div className="pt-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & SKU */}
          <div className="flex items-center justify-center gap-2 text-[10.5px] font-mono text-[#8C827A] mb-1">
            <span className="font-bold text-[#D4A359] uppercase tracking-wider">
              {product.brand || 'Dubro / GP'}
            </span>
            <span>•</span>
            <span className="text-[#8C827A]">
              SKU: {product.sku}
            </span>
          </div>

          {/* Centered Product Title */}
          <h3
            onClick={() => handleQuickView(product)}
            className="font-extrabold text-sm text-[#1A1817] hover:text-[#F85606] transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={name}
          >
            {name}
          </h3>

          {/* Technical Specs Line in Warm Gray */}
          <p className="mt-1 text-xs text-[#5C5650] line-clamp-1">
            {product.specs_line || `${product.scale || 'RC'} | ${product.material || 'Compuesto'}`}
          </p>

          {/* Rating & Stock */}
          <div className="mt-2 flex items-center justify-center gap-1 text-[11px]">
            <div className="flex items-center text-[#D4A359]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[10px] text-[#8C827A]">•</span>
            <span className={`text-[10.5px] font-bold ${product.stock > 0 ? 'text-[#3E7B44]' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} disp.` : 'Agotado'}
            </span>
          </div>
        </div>

        {/* Pricing & Cart Actions (Centered Format with Black/Charcoal Pill) */}
        <div className="mt-3.5 pt-3 border-t border-[#E8E2D8] flex flex-col items-center">
          
          {/* Price inside Dark Charcoal Pill */}
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 bg-[#211E1C] text-[#FFFFFF] font-black rounded-full px-5 py-1.5 shadow-sm">
              <span className="text-xs uppercase font-extrabold text-[#D4A359]">Precio</span>
              <span className="text-sm font-black text-white">
                Bs. {product.price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {product.old_price && product.old_price > product.price && (
              <div className="text-[10px] text-[#8C827A] line-through mt-0.5">
                Bs. {product.old_price.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {/* Action Buttons: Add to Cart, WhatsApp Direct & Quick View */}
          <div className="w-full space-y-1.5">
            <div className="grid grid-cols-5 gap-1.5">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                type="button"
                className={`col-span-4 py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                  justAdded
                    ? 'bg-[#3E7B44] text-white'
                    : isOutOfStock
                    ? 'bg-[#E0DAD0] text-[#8C827A] cursor-not-allowed'
                    : 'bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] active:scale-[0.98]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Añadido!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Agotado</span>
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 text-[#D4A359] group-hover:text-[#161311]" />
                    <span>Añadir</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleQuickView(product)}
                type="button"
                title="Especificaciones Técnicas"
                className="col-span-1 py-2 px-1 rounded-xl bg-white hover:bg-[#EBE5DB] text-[#1A1817] flex items-center justify-center border border-[#E2DCD3] transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4 text-[#5C5650]" />
              </button>
            </div>

            {/* Direct WhatsApp Action Button (+591 77293446) */}
            <a
              href={`https://wa.me/59177293446?text=${encodeURIComponent(
                `Hola Hobby Bolivia, deseo comprar el repuesto:\n• *${name}*\n• SKU: ${product.sku}\n• Precio: Bs. ${product.price.toFixed(2)}\n\n¿Tienen disponibilidad para despacho?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#128C7E] hover:text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#25D366]/30 transition-all duration-200 active:scale-[0.98]"
              title="Pedir directo por WhatsApp (+591 77293446)"
            >
              <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Pedir por WhatsApp</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
