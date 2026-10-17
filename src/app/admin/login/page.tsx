'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('dariasdigital_hobbybolivia');
  const [password, setPassword] = useState('Imp6fSMr2%mj0w?v');
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

      localStorage.setItem('hb_admin_logged', 'true');
      router.push('/admin');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10202f] flex items-center justify-center p-4">
      <div className="bg-[#f5f1e8] rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-fade-in border border-[#dcd5c4]">
        <div className="text-center space-y-2">
          <Link href="/" className="font-serif italic font-bold text-3xl text-[#10202f] tracking-tight block">
            Hobby Bolivia
          </Link>
          <h1 className="text-xl font-bold font-serif text-[#10202f] pt-1">
            Panel Administrativo
          </h1>
          <p className="text-xs text-[#6b7480]">
            Ingresa las credenciales de gestión de Hobby Bolivia
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#b3261e]/10 border border-[#b3261e] text-[#b3261e] text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[#10202f] block mb-1">Usuario / Email</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dariasdigital_hobbybolivia"
                className="w-full pl-9 pr-3 py-2.5 border border-[#10202f] rounded bg-white text-[#10202f] focus:outline-none focus:ring-2 focus:ring-[#f2b705] font-mono"
              />
              <User className="w-4 h-4 text-[#6b7480] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#10202f] block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-[#10202f] rounded bg-white text-[#10202f] focus:outline-none focus:ring-2 focus:ring-[#f2b705] font-mono"
              />
              <Lock className="w-4 h-4 text-[#6b7480] absolute left-3 top-3" />
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

        <div className="pt-2 text-center border-t border-[#dcd5c4]">
          <Link href="/" className="text-xs text-[#6b7480] hover:text-[#10202f] font-semibold underline">
            ← Volver a la tienda pública
          </Link>
        </div>
      </div>
    </div>
  );
}
