'use client';

import React, { useState, useEffect } from 'react';
import { Truck, RefreshCw, ShieldCheck, FileText } from 'lucide-react';
import type { Policy } from '@/lib/types';

interface DynamicPoliciesModuleProps {
  initialPolicies?: Policy[];
}

export function DynamicPoliciesModule({ initialPolicies }: DynamicPoliciesModuleProps) {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies || []);
  const [activeSlug, setActiveSlug] = useState<string>('envios');

  useEffect(() => {
    async function loadPolicies() {
      try {
        const res = await fetch('/api/policies');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPolicies(data.data);
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
      }
    }

    if (!initialPolicies || initialPolicies.length === 0) {
      loadPolicies();
    }
  }, [initialPolicies]);

  const activePolicy = policies.find(p => p.slug === activeSlug) || policies[0];

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'envios':
        return Truck;
      case 'devoluciones':
        return RefreshCw;
      case 'garantias':
        return ShieldCheck;
      default:
        return FileText;
    }
  };

  return (
    <section id="politicas" className="py-16 bg-[#F5F2EB] border-b border-[#E2DCD3]">
      <div className="w-full max-w-5xl mx-auto px-4">
        
        {/* Section Header with Horizontal Lines */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="h-px bg-gradient-to-r from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-20"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A1817] uppercase tracking-wider">
              POLÍTICAS Y GARANTÍA TÉCNICA
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359]"></span>
            <span className="h-px bg-gradient-to-l from-transparent via-[#D4A359] to-[#D4A359] w-12 sm:w-20"></span>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5650] font-medium">
            Toda la información operativa sincronizada en tiempo real para tu tranquilidad.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {policies.map((p) => {
            const Icon = getIcon(p.slug);
            const isActive = (activePolicy && activePolicy.slug === p.slug) || activeSlug === p.slug;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveSlug(p.slug)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#211E1C] text-[#FAF8F5] shadow-lg border border-[#D4A359]/50 scale-[1.02]'
                    : 'bg-[#FAF8F5] hover:bg-white text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A359]' : 'text-[#8C827A]'}`} />
                <span>{p.title.split('-')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Content Card */}
        {activePolicy && (
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#E2DCD3] shadow-md animate-fade-in">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2DCD3]">
              <h3 className="text-base sm:text-xl font-black text-[#1A1817] uppercase tracking-wide">
                {activePolicy.title}
              </h3>
              <span className="text-[11px] font-mono text-[#D4A359] bg-[#211E1C] px-3 py-1 rounded-full font-bold">
                Actualizado 2026
              </span>
            </div>

            <div className="prose prose-sm max-w-none text-[#5C5650] leading-relaxed whitespace-pre-line text-xs sm:text-sm">
              {activePolicy.content}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
