'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Save, CheckCircle2, AlertTriangle, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Policy } from '@/lib/types';

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('envios');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/policies?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setPolicies(data.data);
        const cur = data.data.find((p: Policy) => p.slug === selectedPolicySlug) || data.data[0];
        if (cur) {
          setSelectedPolicySlug(cur.slug);
          setTitle(cur.title);
          setContent(cur.content);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error al cargar políticas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSelectPolicy = (slug: string) => {
    setSelectedPolicySlug(slug);
    const p = policies.find(item => item.slug === slug);
    if (p) {
      setTitle(p.title);
      setContent(p.content);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPolicySlug,
          title,
          content
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Política actualizada correctamente en base de datos");
        setPolicies(prev => prev.map(p => p.slug === selectedPolicySlug ? { ...p, title, content } : p));
      } else {
        showToast(data.error || "Error al actualizar", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-bold flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Gestor de Políticas Oficiales
          </h1>
          <p className="text-xs text-slate-500">
            Administra los términos de envíos, garantías y devoluciones de Hobby Bolivia.
          </p>
        </div>

        <Link
          href="/#politicas"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs"
        >
          <span>Ver en la Tienda</span>
          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
        </Link>
      </div>

      {/* Policy Tabs */}
      <div className="flex flex-wrap gap-2">
        {policies.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => handleSelectPolicy(p.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedPolicySlug === p.slug
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Editor Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título de la Política
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contenido Oficial (Soporta Markdown)
            </label>
            <textarea
              rows={12}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-600 outline-none leading-relaxed font-mono"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              Conectado a la API <code>PUT /api/policies</code>.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando en BD...' : 'Guardar Política'}</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
