'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Check, ShieldCheck, Truck, Scale, Box, Tag, MessageCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface QuickSpecsModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  exchangeRate?: number;
}

export function QuickSpecsModal({ product, onClose, exchangeRate = 6.96 }: QuickSpecsModalProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isUsd = product.currency === 'USD' || (product as any).display_currency === 'USD';
  const rate = exchangeRate > 0 ? exchangeRate : 6.96;
  const usdPrice = (product.price / rate).toFixed(2);
  const bsPrice = product.price.toFixed(2);

  const handleAdd = () => {
    addToCart(product, qty);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const imgSrc = product.image_url || (product.images && product.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
  const name = product.name || product.title || "Repuesto";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E2DCD3] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white hover:bg-[#EBE5DB] text-[#1A1817] border border-[#E2DCD3] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image on Pure White */}
        <div className="w-full md:w-1/2 bg-white p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E2DCD3]">
          <div className="w-full h-56 sm:h-64 flex items-center justify-center">
            <img
              src={imgSrc}
              alt={name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="mt-3 text-center">
            <span className="text-xs font-mono font-bold text-[#D4A359] bg-[#211E1C] px-3 py-1 rounded-full">
              SKU: {product.sku}
            </span>
          </div>
        </div>

        {/* Right: Technical Specs & Add to Cart */}
        <div className="w-full md:w-1/2 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A359] bg-[#211E1C] px-2.5 py-0.5 rounded-full">
                {product.brand || 'Dubro / GP'}
              </span>
              {/* Solo mostrar badge si es Popular o Nuevo */}
              {(product.badge === 'Popular' || product.badge === 'Nuevo' || product.badge === 'Best Seller') && (
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  product.badge === 'Nuevo' ? 'text-[#161311] bg-[#D4A359]' : 'text-[#D4A359] bg-[#211E1C] border border-[#D4A359]/40'
                }`}>
                  {product.badge === 'Nuevo' ? 'Nuevo' : 'Popular'}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-black text-[#1A1817] leading-snug">
              {name}
            </h2>

            {/* Price Pill */}
            <div className="mt-3 inline-flex items-center gap-2 bg-[#211E1C] text-white px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-xs uppercase font-extrabold text-[#D4A359]">Precio:</span>
              <span className="text-base font-black text-white">
                {isUsd ? `$ ${usdPrice} USD` : `Bs. ${bsPrice}`}
              </span>
            </div>

            {/* Technical Specifications Grid */}
            <div className="mt-4 pt-4 border-t border-[#E8E2D8] space-y-2.5 text-xs text-[#5C5650]">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span><strong>Escala:</strong> {product.scale || 'RC Estándar'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span><strong>Material:</strong> {product.material || 'Compuesto'}</span>
              </div>
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-[#D4A359] shrink-0 mt-0.5" />
                <span><strong>Especificaciones:</strong> {product.specs_line}</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F85606] shrink-0 mt-0.5" />
                <span><strong>Compatibilidad:</strong> {product.compatible_models || 'Modelos RC generales'}</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-3 text-xs text-[#5C5650] bg-white p-3 rounded-xl border border-[#E2DCD3] leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-5 pt-4 border-t border-[#E8E2D8] space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E2DCD3] rounded-full bg-white px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2 text-sm font-bold text-[#5C5650] hover:text-[#1A1817] cursor-pointer"
                >
                  -
                </button>
                <span className="px-2 text-xs font-bold text-[#1A1817]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="px-2 text-sm font-bold text-[#5C5650] hover:text-[#1A1817] cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                type="button"
                className={`flex-1 py-3 px-4 rounded-full font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                  justAdded
                    ? 'bg-[#3E7B44] text-white'
                    : 'bg-[#D4A359] hover:bg-[#C69755] text-[#161311]'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Añadido al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Añadir a mi Pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
