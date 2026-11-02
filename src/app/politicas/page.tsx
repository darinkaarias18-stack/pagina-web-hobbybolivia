import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, FileText, Lock } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getSiteConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function PoliticasPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1817] flex flex-col">
      {/* Header */}
      <header className="bg-[#161311] border-b border-[#2D2622] py-4 px-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo variant="dark" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#FAF8F5] hover:text-[#D4A359] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4A359]" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-xs space-y-3">
          <span className="text-xs font-black text-[#D4A359] bg-[#211E1C] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
            Hobby Bolivia · Información Legal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817]">
            Políticas de Servicio, Envíos y Privacidad
          </h1>
          <p className="text-xs text-[#8C827A]">
            Última actualización: 25 de octubre de 2026
          </p>
        </div>

        {/* 1. Envíos y Entregas */}
        <section id="envios" className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#1A1817]">1. Política de Envíos y Horarios de Entrega</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C5650] leading-relaxed whitespace-pre-line bg-[#F5F2EB] p-5 rounded-2xl border border-[#E2DCD3]">
            {config.shippingPolicy}
          </div>
        </section>

        {/* 2. Garantía de Productos */}
        <section id="garantia" className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#1A1817]">2. Garantía Técnica y Conformidad</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C5650] leading-relaxed whitespace-pre-line bg-[#F5F2EB] p-5 rounded-2xl border border-[#E2DCD3]">
            {config.returnsPolicy}
          </div>
        </section>

        {/* 3. Términos y Condiciones */}
        <section id="terminos" className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#1A1817]">3. Términos y Condiciones del Servicio</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C5650] leading-relaxed whitespace-pre-line bg-[#F5F2EB] p-5 rounded-2xl border border-[#E2DCD3]">
            {config.termsPolicy}
          </div>
        </section>

        {/* 4. Política de Privacidad */}
        <section id="privacidad" className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E2DCD3] shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#211E1C] border border-[#D4A359]/40 text-[#D4A359] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-[#1A1817]">4. Política de Privacidad de Datos</h2>
          </div>
          <div className="text-xs sm:text-sm text-[#5C5650] leading-relaxed whitespace-pre-line bg-[#F5F2EB] p-5 rounded-2xl border border-[#E2DCD3]">
            {config.privacyPolicy}
          </div>
        </section>
      </main>
    </div>
  );
}
