import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, FileText, Lock, Clock } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getSiteConfig } from '@/lib/db';

export default async function PoliticasPage() {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <BrandLogo />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#E11D48] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Hobby Bolivia • Información Legal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Políticas de Servicio, Envíos y Privacidad
          </h1>
          <p className="text-xs text-slate-500">
            Última actualización: {new Date().toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* 1. Envíos y Entregas */}
        <section id="envios" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#064E3B] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">1. Política de Envíos y Horarios de Entrega</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {config.shippingPolicy}
          </div>
        </section>

        {/* 2. Garantía de Frescura */}
        <section id="garantia" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">2. Garantía de Frescura y Satisfacción</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {config.returnsPolicy}
          </div>
        </section>

        {/* 3. Términos y Condiciones */}
        <section id="terminos" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">3. Términos y Condiciones del Servicio</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {config.termsPolicy}
          </div>
        </section>

        {/* 4. Política de Privacidad */}
        <section id="privacidad" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4 scroll-mt-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">4. Política de Privacidad de Datos</h2>
          </div>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {config.privacyPolicy}
          </div>
        </section>
      </main>
    </div>
  );
}
