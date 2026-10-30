'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plane,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  Menu,
  X,
  LogOut,
  Coins,
  Users,
  Clock,
  BarChart3,
  Package,
  Layers
} from 'lucide-react';

// Tiempo máximo de inactividad antes de cerrar la sesión automáticamente (15 minutos)
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<'SUPERADMIN' | 'ADMIN' | null>(null);
  const [userName, setUserName] = useState<string>('Administrador');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(INACTIVITY_TIMEOUT_MS / 1000);
  const lastActivityRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data?.data?.logoUrl) {
          setLogoUrl(data.data.logoUrl);
        }
      })
      .catch(() => { });

    const handleConfigUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail) {
        setLogoUrl(custom.detail.logoUrl || '');
      }
    };
    window.addEventListener('hb_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('hb_config_updated', handleConfigUpdate);
  }, []);

  // Verify authentication strictly against server & MySQL database
  useEffect(() => {
    if (pathname === '/admin/login' || pathname === '/login') {
      setCheckingAuth(false);
      return;
    }

    let isMounted = true;

    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Unauthorized');
        }
        const data = await res.json();
        if (!data.authenticated || !data.user) {
          throw new Error('Unauthenticated');
        }

        if (isMounted) {
          const detectedRole = data.user.role;
          setUserRole(detectedRole);
          setUserName(data.user.name || data.user.username || 'Administrador');
          localStorage.setItem('hb_admin_logged', 'true');
          localStorage.setItem('hb_user_role', detectedRole);
          localStorage.setItem('hb_user_username', data.user.username);
          localStorage.setItem('hb_user_name', data.user.name);

          // Regla estricta: el módulo Gestión de Usuarios (/admin/users) es exclusivo del SUPERADMIN
          if (pathname.startsWith('/admin/users') && detectedRole !== 'SUPERADMIN') {
            router.replace('/admin');
            return;
          }

          setCheckingAuth(false);
        }
      } catch {
        localStorage.removeItem('hb_admin_logged');
        localStorage.removeItem('hb_user_role');
        localStorage.removeItem('hb_user_username');
        localStorage.removeItem('hb_user_name');
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleLogout = useCallback(async (reason?: 'inactivity' | 'manual') => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    localStorage.removeItem('hb_admin_logged');
    localStorage.removeItem('hb_user_role');
    localStorage.removeItem('hb_user_username');
    localStorage.removeItem('hb_user_name');

    if (reason === 'inactivity') {
      router.replace('/login?reason=inactivity&redirect=' + encodeURIComponent(pathname));
    } else {
      router.push('/login');
    }
    router.refresh();
  }, [pathname, router]);

  // Control automático de cierre de sesión por inactividad
  useEffect(() => {
    if (checkingAuth || pathname === '/admin/login' || pathname === '/login') {
      return;
    }

    isLoggingOutRef.current = false;
    lastActivityRef.current = Date.now();
    setRemainingSeconds(Math.floor(INACTIVITY_TIMEOUT_MS / 1000));

    const resetInactivityTimer = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, resetInactivityTimer, { passive: true });
    });

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - lastActivityRef.current;
      const leftSec = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsedMs) / 1000));
      setRemainingSeconds(leftSec);

      if (leftSec <= 0) {
        clearInterval(interval);
        handleLogout('inactivity');
      }
    }, 1000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, resetInactivityTimer);
      });
      clearInterval(interval);
    };
  }, [checkingAuth, pathname, handleLogout]);

  const formatRemainingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const allNavItems = [
    { label: 'Dashboard & Métricas', href: '/admin', icon: BarChart3, superadminOnly: false },
    { label: 'Productos y Stock', href: '/admin/products', icon: Package, superadminOnly: false },
    { label: 'Categorías', href: '/admin/categories', icon: Layers, superadminOnly: false },
    { label: 'Gestión de Pedidos', href: '/admin/quotes', icon: ShoppingBag, superadminOnly: false },
    { label: 'Tipo de Cambio (USD)', href: '/admin/currency', icon: Coins, superadminOnly: true },
    { label: 'Gestión de Usuarios', href: '/admin/users', icon: Users, superadminOnly: true },
    { label: 'Configuración General', href: '/admin/settings', icon: Settings, superadminOnly: false }
  ];

  const navItems = allNavItems.filter((item) => !item.superadminOnly || userRole === 'SUPERADMIN');

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1817] flex flex-col md:flex-row">
      {checkingAuth && (
        <div className="fixed inset-0 z-50 min-h-screen bg-[#161311] flex flex-col items-center justify-center text-white gap-3">
          <div className="w-8 h-8 border-3 border-[#D4A359] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#D4A359] font-mono">
            Cargando Panel Administrativo Hobby Bolivia...
          </span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#161311] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#2D2622]">
        <div className="flex items-center gap-2 min-w-0">
          <Plane className="w-5 h-5 text-[#D4A359] -rotate-45 shrink-0" />
          <span className="font-extrabold text-sm tracking-tight text-white truncate">Hobby Bolivia Admin</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#211E1C] border border-[#D4A359]/30 text-[10px] font-mono text-[#D4A359]"
            title="Tiempo restante de sesión por inactividad"
          >
            <Clock className="w-3 h-3" />
            <span>{formatRemainingTime(remainingSeconds)}</span>
          </div>
          <button
            onClick={() => handleLogout('manual')}
            type="button"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-[11px] font-bold transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-[#A89F91] hover:text-white"
            aria-label="Menú Admin"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop when Sidebar is open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-xs"
        />
      )}

      {/* Sidebar (Fixed full height on desktop so it never scrolls off-screen) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 h-screen bg-[#161311] text-[#A89F91] flex flex-col justify-between p-4 border-r border-[#2D2622] overflow-y-auto transition-transform duration-200 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="space-y-6">

          {/* Brand Logo Header */}
          <div className="px-2 pt-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              {logoUrl && logoUrl !== 'https://hobbybolivia.com/icon.svg' && logoUrl !== '/icon.svg' ? (
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] p-0.5 flex items-center justify-center shadow-md border border-[#D4A359]/50 overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Hobby Bolivia"
                    className="w-full h-full object-contain"
                    onError={() => setLogoUrl('')}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359] shadow-md shrink-0">
                  <Plane className="w-4 h-4 -rotate-45 text-[#D4A359]" />
                </div>
              )}
              <span className="font-black text-lg tracking-tight text-[#D4A359]">
                HOBBY <span className="text-[#FAF8F5]">BOLIVIA</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 mt-2 px-0.5">
              <span className={`w-2 h-2 rounded-full ${userRole === 'SUPERADMIN' ? 'bg-[#D4A359]' : 'bg-[#3E7B44]'} animate-pulse`} />
              <span className="text-[10px] font-black text-[#D4A359] uppercase tracking-wider">
                {userRole === 'SUPERADMIN' ? 'Superadmin · Acceso Total' : 'Panel Administrador'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all ${isActive
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

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 min-h-screen bg-[#F5F2EB] flex flex-col md:pl-64">
        {/* Top Admin Session Bar (Sticky on Desktop & Tablet) */}
        <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E2DCD3] text-xs sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-[#5C5650]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sesión activa: <strong className="text-[#1A1817]">{userName}</strong></span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#211E1C] text-[#D4A359] font-bold uppercase">
              {userRole}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E2DCD3] text-[11px] font-semibold text-[#5C5650]"
              title="La sesión se cerrará automáticamente tras 15 minutos sin actividad"
            >
              <Clock className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Auto-cierre por inactividad:</span>
              <strong className={`font-mono ${remainingSeconds <= 120 ? 'text-[#F85606]' : 'text-[#1A1817]'}`}>
                {formatRemainingTime(remainingSeconds)}
              </strong>
            </div>

            <button
              onClick={() => handleLogout('manual')}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>

    </div>
  );
}
