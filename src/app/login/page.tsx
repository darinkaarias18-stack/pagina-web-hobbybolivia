'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, ArrowRight, Loader2, ShieldCheck, ShoppingBag, Eye, EyeOff, Plane } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';
  const reason = searchParams.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    reason === 'inactivity'
      ? 'Tu sesión se cerró automáticamente por inactividad para proteger el panel.'
      : ''
  );

  // Al entrar a /login, cerrar cualquier sesión previa para exigir usuario y contraseña siempre
  useEffect(() => {
    localStorage.removeItem('hb_admin_logged');
    localStorage.removeItem('hb_user_role');
    localStorage.removeItem('hb_user_username');
    localStorage.removeItem('hb_user_name');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Credenciales inválidas');
      }

      // Store in localStorage for instant client state
      localStorage.setItem('hb_admin_logged', 'true');
      localStorage.setItem('hb_user_role', data.user.role);
      localStorage.setItem('hb_user_username', data.user.username);
      localStorage.setItem('hb_user_name', data.user.name);

      router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161311] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F85606]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#D4A359]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-[#E2DCD3]">

        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#F85606] flex items-center justify-center text-white shadow-md shadow-[#F85606]/30">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <span className="font-black text-2xl tracking-tight text-[#161311]">
              HOBBY <span className="text-[#F85606]">BOLIVIA</span>
            </span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161311] text-[#D4A359] text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-[#D4A359]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A359]" />
              <span>Acceso Administrativo Restringido</span>
            </div>
            <p className="text-xs text-[#5C5650]">
              Ingresa tu usuario y contraseña registrados en la base de datos para continuar
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs" autoComplete="off">
          <div>
            <label className="font-bold text-[#1A1817] block mb-1">Usuario o Correo Electrónico</label>
            <div className="relative">
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario o correo autorizado"
                className="w-full pl-9 pr-3 py-2.5 border border-[#E2DCD3] rounded-xl bg-[#FAF8F5] text-[#1A1817] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A359] focus:border-transparent font-medium transition-all"
              />
              <User className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1A1817] block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-[#E2DCD3] rounded-xl bg-[#FAF8F5] text-[#1A1817] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A359] focus:border-transparent font-medium transition-all"
              />
              <Lock className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 p-1 text-[#8C827A] hover:text-[#1A1817] transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#1A1817]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#8C827A]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#161311] hover:bg-[#D4A359] text-[#FAF8F5] hover:text-[#161311] active:scale-[0.99] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>VERIFICAR E INGRESAR AL PANEL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-[#EFEAE2] flex items-center justify-center">
          <Link
            href="/"
            className="text-xs text-[#5C5650] hover:text-[#F85606] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#F85606]" />
            <span>← Volver al Catálogo Público</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#161311] flex items-center justify-center text-[#D4A359] text-xs">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
