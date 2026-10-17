'use client';

import React from 'react';
import { Tag, Sparkles, Heart, Sun, Flame, Building2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavigationSubHeaderProps {
  onSelectCategory?: (slug: string) => void;
  onSelectOccasion?: (slug: string) => void;
  onSelectDeals?: () => void;
  activeFilter?: string;
}

export function NavigationSubHeader({
  onSelectCategory,
  onSelectOccasion,
  onSelectDeals,
  activeFilter
}: NavigationSubHeaderProps) {
  const { openCustomModal } = useCart();

  const links = [
    {
      label: "Ofertas del Día",
      icon: Flame,
      badge: "-20%",
      badgeColor: "bg-[#FACC15] text-[#111827]",
      action: () => onSelectDeals && onSelectDeals(),
      active: activeFilter === 'deals'
    },
    {
      label: "Ocasiones Especiales",
      icon: Heart,
      action: () => onSelectOccasion && onSelectOccasion('amor-y-aniversario'),
      active: activeFilter === 'amor-y-aniversario'
    },
    {
      label: "Cajas de Rosas",
      icon: Tag,
      action: () => onSelectCategory && onSelectCategory('cajas-de-rosas'),
      active: activeFilter === 'cajas-de-rosas'
    },
    {
      label: "Flores Amarillas",
      icon: Sun,
      badge: "Popular",
      badgeColor: "bg-amber-100 text-amber-800",
      action: () => onSelectOccasion && onSelectOccasion('flores-amarillas'),
      active: activeFilter === 'flores-amarillas'
    },
    {
      label: "Eventos y Bodas",
      icon: Building2,
      action: () => onSelectCategory && onSelectCategory('decoracion-eventos'),
      active: activeFilter === 'decoracion-eventos'
    },
    {
      label: "Armar mi Arreglo",
      icon: Sparkles,
      action: openCustomModal,
      highlight: true
    }
  ];

  return (
    <nav className="bg-slate-50 border-b border-slate-200 text-xs font-semibold overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-1 sm:gap-4 py-2 min-w-max">
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <button
                key={idx}
                onClick={link.action}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  link.active
                    ? 'bg-[#E11D48] text-white shadow-xs font-bold'
                    : link.highlight
                    ? 'bg-[#FFF1F2] text-[#E11D48] border border-rose-200 hover:bg-rose-100 font-bold'
                    : 'text-slate-700 hover:text-[#E11D48] hover:bg-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${link.active ? 'text-white' : link.highlight ? 'text-[#E11D48]' : 'text-slate-500'}`} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold uppercase ${link.badgeColor}`}>
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-[#064E3B] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-ping" />
          <span>Atención en vivo para entregas hoy</span>
        </div>
      </div>
    </nav>
  );
}
