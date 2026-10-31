'use client';

import React from 'react';
import Link from 'next/link';
import { Database, ChevronRight, Package, ShieldCheck } from 'lucide-react';
import { CatalogBackupExportModule } from '@/components/admin/CatalogBackupExportModule';

export default function AdminBackupPage() {
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

