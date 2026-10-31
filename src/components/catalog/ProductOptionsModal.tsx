'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export function ProductOptionsModal() {
  const { selectedItemForOptions, closeOptionsModal, addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (!selectedItemForOptions) return null;

  const item = selectedItemForOptions;
  const variants = item.variants || [];

  const handleSelectOption = (variantName: string, optionValue: string) => {
    setSelectedOptions((prev) => ({ ...prev, [variantName]: optionValue }));
  };

  const handleAddToCart = () => {
    const finalOptions: Record<string, string> = { ...selectedOptions };
    variants.forEach((v: any) => {
      if (!finalOptions[v.name] && v.options && v.options.length > 0) {
        finalOptions[v.name] = v.options[0];
      }
    });

    addToCart(item, quantity, finalOptions);
    closeOptionsModal();
  };

  const rawImage = (item.images && item.images[0]) || item.image_url || item.imageUrl;
  const isInvalid = !rawImage || rawImage.trim() === '' || rawImage.includes('d0721149ad-dubq3570tn-t');
  const imageSrc = isInvalid ? '/placeholder.webp' : rawImage.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f5f1e8] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#10202f] flex flex-col relative text-[#10202f]">
        {/* Close Button */}
        <button
          onClick={closeOptionsModal}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border border-[#10202f] flex items-center justify-center bg-white hover:bg-[#10202f] hover:text-[#f5f1e8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-5">
          {/* Item Header */}
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-[#ebe4d3] p-2 flex-shrink-0 border border-[#dcd5c4] flex items-center justify-center">
              <img
                src={imageSrc}
                alt={item.title || item.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('placeholder.webp')) {
                    target.src = '/placeholder.webp';
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#8a6a00] uppercase tracking-wider">
                {item.brand || item.category?.name || 'Hobby Bolivia'}
              </span>
              <h3 className="font-serif font-bold text-lg text-[#10202f] leading-snug">
                {item.title || item.name}
              </h3>
              <div className="text-sm font-bold text-[#10202f]">
                {formatPrice(item.price)}
              </div>
            </div>
          </div>

          <p className="text-xs text-[#6b7480] leading-relaxed bg-[#efe9dc] p-3 rounded-lg border border-[#dcd5c4]">
            {item.description}
          </p>

          {/* Variants Selector */}
          {variants.length > 0 && (
            <div className="space-y-4">
              {variants.map((v: any, vIdx: number) => (
                <div key={vIdx} className="space-y-2">
                  <label className="text-xs font-bold text-[#10202f] uppercase tracking-wider block">
                    {v.name}:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt: string) => {
                      const isSelected = selectedOptions[v.name] === opt || (!selectedOptions[v.name] && opt === v.options[0]);
                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectOption(v.name, opt)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all ${isSelected
                              ? 'border-[#10202f] bg-[#10202f] text-[#f5f1e8] shadow-xs'
                              : 'border-[#10202f] hover:bg-[#ebe4d3] bg-white text-[#10202f]'
                            }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#f2b705]" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity Selector & Action */}
          <div className="pt-4 border-t border-[#dcd5c4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#10202f]">Cantidad:</span>
              <div className="flex items-center border border-[#10202f] rounded-lg overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 font-bold text-[#10202f] hover:bg-[#ebe4d3]"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 font-bold text-[#10202f] hover:bg-[#ebe4d3]"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-2.5 rounded-full bg-[#10202f] text-white hover:bg-blue-600 font-bold text-xs"
            >
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
