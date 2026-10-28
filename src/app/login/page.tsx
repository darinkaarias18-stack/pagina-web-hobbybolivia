'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, ArrowRight, Loader2, ShieldCheck, ShoppingBag, Eye, EyeOff, Plane } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

      router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 border border-slate-200">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900">
              HOBBY <span className="text-blue-600">BOLIVIA</span>
            </span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-cyan-400 text-[11px] font-extrabold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Acceso Administrativo Seguro</span>
            </div>
            <p className="text-xs text-slate-500">
              Ingresa tus credenciales autorizadas de Administrador
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">!</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Usuario o Correo Electrónico</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej. darinka.arias18@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-700" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <span>INGRESAR AL PANEL</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 text-center border-t border-slate-100 flex items-center justify-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>← Volver al Catálogo Público</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white text-xs">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
