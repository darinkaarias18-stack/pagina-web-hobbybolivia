'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  LayoutDashboard,
  Layers,
  FileText,
  ShoppingBag,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Database
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verify authentication
  useEffect(() => {
    if (pathname === '/admin/login' || pathname === '/login') {
      setCheckingAuth(false);
      return;
    }

    const checkSession = () => {
      const logged =
        localStorage.getItem('hb_admin_logged') === 'true' ||
        document.cookie.includes('hb_admin_auth=authenticated');

      if (!logged) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
        return;
      }

      setCheckingAuth(false);
    };

    checkSession();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    localStorage.removeItem('hb_admin_logged');
    localStorage.removeItem('hb_user_role');
    localStorage.removeItem('hb_user_username');
    localStorage.removeItem('hb_user_name');

    router.push('/login');
    router.refresh();
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#161311] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-8 h-8 border-3 border-[#D4A359] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#D4A359] font-mono">Cargando Panel Administrativo Hobby Bolivia...</span>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard & Productos', href: '/admin', icon: LayoutDashboard },
    { label: 'Gestor de Políticas', href: '/admin/policies', icon: FileText },
    { label: 'Categorías', href: '/admin/categories', icon: Layers },
    { label: 'Pedidos & Cotizaciones', href: '/admin/quotes', icon: ShoppingBag },
    { label: 'Configuración de Tienda', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1817] flex flex-col md:flex-row">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#161311] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#2D2622]">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-[#F85606] -rotate-45" />
          <span className="font-extrabold text-base tracking-tight text-white">Hobby Bolivia Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-[#A89F91] hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 w-64 h-screen bg-[#161311] text-[#A89F91] flex flex-col justify-between p-4 border-r border-[#2D2622] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          
          {/* Brand Logo Header */}
          <div className="px-2 pt-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#F85606] flex items-center justify-center text-white shadow-md shadow-[#F85606]/30">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <span className="font-black text-lg tracking-tight text-[#F85606]">
                HOBBY <span className="text-[#FAF8F5]">BOLIVIA</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 mt-2 px-0.5">
              <span className="w-2 h-2 rounded-full bg-[#D4A359] animate-pulse" />
              <span className="text-[10px] font-black text-[#D4A359] uppercase tracking-wider">
                Panel Warm Tech Activo
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin/items');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/40 shadow-sm font-black'
                      : 'text-[#A89F91] hover:bg-[#1E1916] hover:text-[#FAF8F5]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A359]' : 'text-[#8C827A]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-[#2D2622] space-y-2">
          
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-[#A89F91] hover:bg-[#1E1916] hover:text-[#FAF8F5] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Ver Tienda Pública</span>
            </span>
            <span className="text-[10px] bg-[#211E1C] text-[#D4A359] px-2 py-0.5 rounded-full font-mono font-bold">
              Live
            </span>
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#F5F2EB]">
        {children}
      </main>

    </div>
  );
}
