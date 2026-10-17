'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, ArrowRight, Loader2, ShieldCheck, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/items';

  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('superhobby2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin/items');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10202f] flex items-center justify-center p-4">
      <div className="bg-[#f5f1e8] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-fade-in border border-[#dcd5c4]">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="font-serif italic font-bold text-3xl text-[#10202f] tracking-tight block">
            Hobby Bolivia
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10202f] text-[#f2b705] text-[11px] font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#f2b705]" />
            <span>Acceso al Panel</span>
          </div>
          <p className="text-xs text-[#6b7480] pt-1">
            Ingresa tus credenciales de Administrador o Superadmin
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <span className="text-sm font-bold">✕</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#10202f] block mb-1">Usuario</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superadmin"
                className="w-full pl-9 pr-3 py-2.5 border border-[#10202f] rounded-lg bg-white text-[#10202f] focus:outline-none focus:ring-2 focus:ring-[#f2b705] font-mono"
              />
              <User className="w-4 h-4 text-[#6b7480] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#10202f] block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-[#10202f] rounded-lg bg-white text-[#10202f] focus:outline-none focus:ring-2 focus:ring-[#f2b705] font-mono"
              />
              <Lock className="w-4 h-4 text-[#6b7480] absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 p-1 text-[#6b7480] hover:text-[#10202f] transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-[#10202f]" />
                ) : (
                  <Eye className="w-4 h-4 text-[#6b7480]" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#f2b705]" />
            ) : (
              <>
                <span>INGRESAR AL PANEL</span>
                <ArrowRight className="w-4 h-4 text-[#f2b705]" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-[#dcd5c4] flex items-center justify-center">
          <Link
            href="/"
            className="text-xs text-[#6b7480] hover:text-[#10202f] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#e04f26]" />
            <span>← Volver al Catálogo Público</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#10202f] flex items-center justify-center text-white text-xs">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
