'use client';

import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp, Check, DollarSign } from 'lucide-react';
import type { Category, Occasion } from '@/lib/types';

interface SidebarFiltersProps {
  categories: Category[];
  occasions: Occasion[];
  selectedCategory: string;
  selectedOccasion: string;
  selectedFlowerType: string;
  minPrice?: number;
  maxPrice?: number;
  availability: string;
  onFilterChange: (filters: {
    category?: string;
    occasion?: string;
    flowerType?: string;
    minPrice?: number;
    maxPrice?: number;
    availability?: string;
  }) => void;
  onResetFilters: () => void;
}

export function SidebarFilters({
  categories,
  occasions,
  selectedCategory,
  selectedOccasion,
  selectedFlowerType,
  minPrice,
  maxPrice,
  availability,
  onFilterChange,
  onResetFilters
}: SidebarFiltersProps) {
  const [minInput, setMinInput] = useState(minPrice ? minPrice.toString() : '');
  const [maxInput, setMaxInput] = useState(maxPrice ? maxPrice.toString() : '');

  // Collapsible sections
  const [openSections, setOpenSections] = useState({
    categories: true,
    occasions: true,
    flowerType: true,
    price: true,
    availability: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const flowerOptions = [
    { label: "Todas las Flores", value: "" },
    { label: "Rosas", value: "Rosas" },
    { label: "Girasoles", value: "Girasoles" },
    { label: "Tulipanes", value: "Tulipanes" },
    { label: "Liliums", value: "Liliums" },
    { label: "Orquídeas", value: "Orquídeas" },
    { label: "Mix Floral", value: "Mix" }
  ];

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      minPrice: minInput ? parseFloat(minInput) : undefined,
      maxPrice: maxInput ? parseFloat(maxInput) : undefined
    });
  };

  const hasActiveFilters =
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedOccasion && selectedOccasion !== 'all') ||
    Boolean(selectedFlowerType) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    (availability && availability !== 'all');

  return (
    <aside className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Filter className="w-4 h-4 text-[#E11D48]" />
          <span>Filtros del Catálogo</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setMinInput('');
              setMaxInput('');
              onResetFilters();
            }}
            className="flex items-center gap-1 text-[11px] text-[#E11D48] hover:text-[#BE123C] font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Categorías */}
      <div className="space-y-2">
        <button
          onClick={() => toggleSection('categories')}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-[#E11D48] transition-colors"
        >
          <span>Categorías</span>
          {openSections.categories ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.categories && (
          <div className="space-y-1 pt-1 text-xs">
            <button
              onClick={() => onFilterChange({ category: 'all' })}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                !selectedCategory || selectedCategory === 'all'
                  ? 'bg-rose-50 text-[#E11D48] font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Todas las Categorías</span>
              {(!selectedCategory || selectedCategory === 'all') && <Check className="w-3.5 h-3.5 text-[#E11D48]" />}
            </button>

            {categories.map((c) => {
              const active = selectedCategory === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => onFilterChange({ category: c.slug })}
                  className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                    active ? 'bg-rose-50 text-[#E11D48] font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="line-clamp-1">{c.name}</span>
                  {c.itemCount !== undefined && (
                    <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.5 rounded-full bg-slate-100">
                      {c.itemCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Ocasión Especial */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button
          onClick={() => toggleSection('occasions')}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-[#E11D48] transition-colors"
        >
          <span>Ocasión Especial</span>
          {openSections.occasions ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.occasions && (
          <div className="space-y-1.5 pt-1 text-xs">
            {occasions.map((occ) => {
              const active = selectedOccasion === occ.slug;
              return (
                <label
                  key={occ.id}
                  onClick={() => onFilterChange({ occasion: active ? 'all' : occ.slug })}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    active ? 'bg-rose-50 text-[#E11D48] font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-[#E11D48] focus:ring-[#E11D48] pointer-events-none"
                    />
                    <span>{occ.name}</span>
                  </div>
                  {occ.itemCount !== undefined && occ.itemCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-semibold">{occ.itemCount}</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Tipo de Flor */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button
          onClick={() => toggleSection('flowerType')}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-[#E11D48] transition-colors"
        >
          <span>Tipo de Flor</span>
          {openSections.flowerType ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.flowerType && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {flowerOptions.map((opt) => {
              const active = (selectedFlowerType || '') === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange({ flowerType: active && opt.value ? '' : opt.value })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'border-[#E11D48] bg-[#E11D48] text-white font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Rango de Precio en Bs. */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-[#E11D48] transition-colors"
        >
          <span>Precio (en Bolivianos)</span>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.price && (
          <form onSubmit={handleApplyPrice} className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Mínimo (Bs.)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#E11D48]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Máximo (Bs.)</label>
                <input
                  type="number"
                  placeholder="2000"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#E11D48]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Aplicar Rango
            </button>
          </form>
        )}
      </div>

      {/* 5. Disponibilidad */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-[#E11D48] transition-colors"
        >
          <span>Disponibilidad</span>
          {openSections.availability ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.availability && (
          <div className="space-y-1.5 pt-1 text-xs">
            {[
              { id: 'all', label: 'Todos los arreglos' },
              { id: 'IN_STOCK', label: '🌸 Entrega hoy mismo' },
              { id: 'OUT_OF_STOCK', label: 'Agotados temporalmente' }
            ].map((st) => (
              <label
                key={st.id}
                onClick={() => onFilterChange({ availability: st.id })}
                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer ${
                  (availability || 'all') === st.id ? 'text-[#064E3B] font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <input
                  type="radio"
                  name="availability_filter"
                  checked={(availability || 'all') === st.id}
                  onChange={() => {}}
                  className="text-[#064E3B] focus:ring-[#064E3B]"
                />
                <span>{st.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
