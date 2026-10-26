'use client';

import React, { useState } from 'react';
import { X, ShoppingCart, Check, ShieldCheck, Truck, Scale, Box, Tag, MessageCircle } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface QuickSpecsModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

export function QuickSpecsModal({ product, onClose }: QuickSpecsModalProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

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
              {product.badge && (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#F85606] px-2.5 py-0.5 rounded-full">
                  {product.badge}
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
                Bs. {product.price.toFixed(2)}
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

            {/* Direct WhatsApp Order Button */}
            <a
              href={`https://wa.me/59177293446?text=${encodeURIComponent(
                `Hola Hobby Bolivia, deseo pedir este repuesto:\n• *${name}*\n• SKU: ${product.sku}\n• Cantidad: ${qty}\n• Precio: Bs. ${product.price.toFixed(2)}\n• Total: Bs. ${(product.price * qty).toFixed(2)}\n\n¿Tienen disponibilidad y cómo coordino el envío?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <span>Pedir directo por WhatsApp</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
