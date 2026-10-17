'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Edit2, Trash2, X, Loader2, ExternalLink } from 'lucide-react';
import type { Banner, BannerPlacement } from '@/lib/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [placement, setPlacement] = useState<BannerPlacement>('HERO');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      if (data.success) setBanners(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openCreate = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=1400');
    setButtonText('Ver Arreglos');
    setButtonUrl('#catalogo');
    setPlacement('HERO');
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setButtonText(b.buttonText || '');
    setButtonUrl(b.buttonUrl || '');
    setPlacement(b.placement);
    setIsActive(b.isActive);
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este banner promocional?')) return;
    try {
      const res = await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      setError('El título y la URL de imagen son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        subtitle,
        imageUrl,
        buttonText,
        buttonUrl,
        placement,
        isActive
      };

      const res = await fetch('/api/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBanner ? { ...payload, id: editingBanner.id } : payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al guardar');

      setIsModalOpen(false);
      loadBanners();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Publicidad & Campañas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Banners Promocionales
          </h1>
          <p className="text-xs text-slate-500">
            Administra banners del Hero principal, banners de bodas y campañas en la tienda.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
            <span>Cargando banners...</span>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-3"
            >
              <div className="h-44 w-full relative bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  {b.placement}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm leading-snug">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-500">{b.subtitle}</p>}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-medium">
                    Botón: <strong className="text-slate-700">{b.buttonText || 'Ninguno'}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título*</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Imagen*</label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Texto del Botón</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ubicación</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as BannerPlacement)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#E11D48]"
                  >
                    <option value="HERO">HERO (Principal)</option>
                    <option value="CATEGORY_PROMO">CATEGORY_PROMO</option>
                    <option value="SIDEBAR">SIDEBAR</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E11D48] text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
