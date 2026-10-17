'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plane,
  ShoppingBag,
  Layers,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render clean full screen
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Productos & Repuestos', href: '/admin/items', icon: Plane },
    { label: 'Categorías', href: '/admin/categories', icon: Layers },
    { label: 'Pedidos / Cotizaciones', href: '/admin/quotes', icon: ShoppingBag },
    { label: 'Configuración Tienda', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#10202f] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#10202f] text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-bold text-xl text-[#f5f1e8]">Hobby Bolivia</span>
          <span className="text-[10px] bg-[#f2b705] text-[#10202f] px-2 py-0.5 rounded font-extrabold">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[#10202f] text-[#c9c4b6] flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          <div className="px-2 pt-2">
            <Link href="/" className="font-serif italic font-bold text-2xl text-[#f5f1e8] block">
              Hobby Bolivia
            </Link>
            <div className="flex items-center gap-2 mt-1.5 px-0.5">
              <span className="w-2 h-2 rounded-full bg-[#f2b705] animate-pulse" />
              <span className="text-[10px] font-extrabold text-[#f2b705] uppercase tracking-wider">
                Panel de Administración
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#f2b705] text-[#10202f] shadow-md font-bold'
                      : 'hover:bg-[#1b3248] text-[#d8d3c4] hover:text-[#f5f1e8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom store link & user info */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="px-3 py-2 rounded-lg bg-black/20 text-xs">
            <div className="text-[10px] text-[#6b7480] uppercase tracking-wider">Sesión Activa</div>
            <div className="font-bold text-white truncate">dariasdigital_hobbybolivia</div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#f2b705] hover:bg-[#1b3248] transition-colors"
          >
            <span>Ver Catálogo Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/admin/login"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#b3261e] hover:bg-[#1b3248] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
