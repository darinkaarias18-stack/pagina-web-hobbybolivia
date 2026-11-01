'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, ChevronRight, Package, ShieldCheck, Lock } from 'lucide-react';
import { CatalogBackupExportModule } from '@/components/admin/CatalogBackupExportModule';

export default function AdminBackupPage() {
  const router = useRouter();
  const [isSuperadmin, setIsSuperadmin] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Verificación rápida de rol en almacenamiento local
    const cachedRole = typeof window !== 'undefined' ? localStorage.getItem('hb_user_role') : null;
    if (cachedRole) {
      if (cachedRole !== 'SUPERADMIN') {
        setIsSuperadmin(false);
        router.replace('/admin');
        return;
      }
      setIsSuperadmin(true);
    }

    // 2. Verificación autoritativa de sesión con el backend
    const verifyRole = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          setIsSuperadmin(false);
          router.replace('/admin');
          return;
        }
        const data = await res.json();
        if (!data.authenticated || data.user?.role !== 'SUPERADMIN') {
          setIsSuperadmin(false);
          router.replace('/admin');
          return;
        }
        setIsSuperadmin(true);
      } catch (err) {
        console.error('Error verificando rol en respaldo:', err);
        if (cachedRole !== 'SUPERADMIN') {
          setIsSuperadmin(false);
          router.replace('/admin');
        }
      }
    };

    verifyRole();
  }, [router]);

  if (isSuperadmin === null) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#D4A359] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-[#8C827A]">Verificando privilegios de Superadmin...</p>
      </div>
    );
  }

  if (!isSuperadmin) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#D4A359] flex items-center justify-center mb-4 border border-[#D4A359]/30">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-black text-[#1A1817] mb-1.5">Módulo Exclusivo de Superadmin</h2>
        <p className="text-xs text-[#5C5650] leading-relaxed mb-6">
          El módulo de Respaldo y Exportación del Catálogo contiene descargas completas de inventario, base de datos y archivos multimedia. Solo usuarios con rol SUPERADMIN tienen autorización de acceso.
        </p>
        <Link
          href="/admin"
          className="px-5 py-2.5 rounded-xl bg-[#161311] hover:bg-[#211E1C] text-[#D4A359] font-bold text-xs uppercase tracking-wider transition-all"
        >
          Volver al Panel Principal
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs & Navigation helper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DCD3]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8C827A]">
          <Link href="/admin" className="hover:text-[#D4A359] transition-colors">
            Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1A1817] font-bold">Respaldo y Exportación</span>
          <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#211E1C] text-[#D4A359] text-[10px] font-black uppercase tracking-wider border border-[#D4A359]/40">
            <ShieldCheck className="w-3 h-3 text-[#D4A359]" />
            Exclusivo Superadmin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#E2DCD3] hover:border-[#D4A359] text-[#5C5650] hover:text-[#1A1817] text-xs font-bold transition-all shadow-2xs"
          >
            <Package className="w-3.5 h-3.5 text-[#D4A359]" />
            <span>Ver Inventario</span>
          </Link>
        </div>
      </div>

      {/* Main Module */}
      <CatalogBackupExportModule />
    </div>
  );
}
