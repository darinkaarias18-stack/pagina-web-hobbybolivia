'use client';

import React, { useState } from 'react';
import { LayoutGrid, Grid, ArrowUpDown, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { CatalogItem } from '@/lib/types';

interface ProductGridProps {
  items: CatalogItem[];
  selectedSort?: string;
  onSortChange: (sort: string) => void;
  onResetFilters: () => void;
}

export function ProductGrid({
  items,
  selectedSort = 'featured',
  onSortChange,
  onResetFilters
}: ProductGridProps) {
  const [columns, setColumns] = useState<3 | 4>(4);

  return (
    <div className="space-y-4">
      {/* Top Bar for Results & Layout Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs">
        <div className="text-xs text-slate-600 font-medium">
          Mostrando <span className="font-bold text-slate-900">{items.length}</span> arreglos florales y detalles
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#E11D48]"
            >
              <option value="featured">Destacados & Ofertas</option>
              <option value="price_asc">Menor Precio</option>
              <option value="price_desc">Mayor Precio</option>
              <option value="newest">Más Nuevos</option>
            </select>
          </div>

          {/* Grid View Toggle */}
          <div className="hidden md:flex items-center gap-1 border-l border-slate-200 pl-3">
            <button
              onClick={() => setColumns(3)}
              className={`p-1.5 rounded-lg transition-colors ${
                columns === 3 ? 'bg-rose-50 text-[#E11D48]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista de 3 columnas"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setColumns(4)}
              className={`p-1.5 rounded-lg transition-colors ${
                columns === 4 ? 'bg-rose-50 text-[#E11D48]' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista de 4 columnas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Products */}
      {items.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-2xl text-[#E11D48]">
            🌸
          </div>
          <h3 className="font-bold text-slate-800 text-base">No encontramos arreglos con estos filtros</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Intenta cambiar el rango de precio, deseleccionar ocasiones o buscar con otros términos.
          </p>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold text-xs hover:bg-[#BE123C] transition-colors"
          >
            Ver todos los arreglos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
