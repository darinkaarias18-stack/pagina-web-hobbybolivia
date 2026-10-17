'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  ShoppingBag,
  Layers,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Users,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<'SUPERADMIN' | 'ADMIN'>('ADMIN');
  const [username, setUsername] = useState<string>('superadmin');
  const [displayName, setDisplayName] = useState<string>('Administrador');

  // Verify authentication and role permissions
  useEffect(() => {
    if (pathname === '/admin/login') {
      setCheckingAuth(false);
      return;
    }

    const checkSession = () => {
      const logged =
        localStorage.getItem('hb_admin_logged') === 'true' ||
        document.cookie.includes('hb_admin_auth=authenticated');

      if (!logged) {
        router.replace('/login');
        return;
      }

      const role = (localStorage.getItem('hb_user_role') as 'SUPERADMIN' | 'ADMIN') || 'ADMIN';
      const user = localStorage.getItem('hb_user_username') || 'admin';
      const name = localStorage.getItem('hb_user_name') || 'Administrador';

      setUserRole(role);
      setUsername(user);
      setDisplayName(name);

      // Access control: Only SUPERADMIN can access /admin/users and /admin/settings
      if (role !== 'SUPERADMIN' && (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/settings'))) {
        router.replace('/admin/items');
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

    router.push('/');
    router.refresh();
  };

  // If on login redirect, render clean
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Prevent flicker while verifying authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#10202f] flex flex-col items-center justify-center text-white gap-3">
        <div className="w-8 h-8 border-3 border-[#f2b705] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-[#c9c4b6] font-mono">Verificando sesión...</span>
      </div>
    );
  }

  // Define nav items with role requirements
  const allNavItems = [
    { label: 'Productos & Repuestos', href: '/admin/items', icon: Plane, superadminOnly: false },
    { label: 'Categorías', href: '/admin/categories', icon: Layers, superadminOnly: false },
    { label: 'Pedidos / Cotizaciones', href: '/admin/quotes', icon: ShoppingBag, superadminOnly: false },
    { label: 'Configuración Tienda', href: '/admin/settings', icon: Settings, superadminOnly: true },
    { label: 'Usuarios / Accesos', href: '/admin/users', icon: Users, superadminOnly: true }
  ];

  const visibleNavItems = allNavItems.filter((item) => !item.superadminOnly || userRole === 'SUPERADMIN');

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#10202f] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#10202f] text-white p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-serif italic font-bold text-xl text-[#f5f1e8]">Hobby Bolivia</span>
          <span className="text-[10px] bg-[#f2b705] text-[#10202f] px-2 py-0.5 rounded font-extrabold uppercase">
            {userRole}
          </span>
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
            {visibleNavItems.map((item) => {
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
          {/* Active User Card */}
          <div className="px-3 py-2.5 rounded-xl bg-black/25 text-xs border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider font-semibold">
                Sesión Activa
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold tracking-wide uppercase ${
                  userRole === 'SUPERADMIN'
                    ? 'bg-[#f2b705] text-[#10202f]'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {userRole}
              </span>
            </div>
            <div className="font-bold text-white truncate flex items-center gap-1.5">
              {userRole === 'SUPERADMIN' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-[#f2b705] flex-shrink-0" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              )}
              <span className="truncate">{username}</span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#f2b705] hover:bg-[#1b3248] transition-colors"
          >
            <span>Ver Catálogo Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            id="btn-admin-logout"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-900/30 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
