'use client';

import React, { useState, useEffect } from 'react';
import { CalendarHeart, Plus, Edit2, Trash2, X, Loader2, Sparkles } from 'lucide-react';
import type { Occasion } from '@/lib/types';

export default function AdminOccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [iconName, setIconName] = useState('Heart');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadOccasions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/occasions');
      const data = await res.json();
      if (data.success) setOccasions(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOccasions();
  }, []);

  const openCreate = () => {
    setEditingOccasion(null);
    setName('');
    setSlug('');
    setIconName('Heart');
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (occ: Occasion) => {
    setEditingOccasion(occ);
    setName(occ.name);
    setSlug(occ.slug);
    setIconName(occ.iconName || 'Flower');
    setError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingOccasion) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta ocasión?')) return;
    try {
      const res = await fetch(`/api/occasions?id=${id}`, { method: 'DELETE' });
      if (res.ok) setOccasions((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      setError('El nombre y slug son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = { name, slug, iconName };
      const res = await fetch('/api/occasions', {
        method: editingOccasion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingOccasion ? { ...payload, id: editingOccasion.id } : payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al guardar');

      setIsModalOpen(false);
      loadOccasions();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#E11D48] uppercase tracking-wider block">
            Fechas Festivas & Motivos
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            Gestión de Ocasiones Especiales
          </h1>
          <p className="text-xs text-slate-500">
            Administra ocasiones de alta demanda como Día de la Madre, Flores Amarillas, Cumpleaños y Aniversarios.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Ocasión</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#E11D48]" />
            <span>Cargando ocasiones...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Icono</th>
                <th className="py-3 px-4">Nombre de la Ocasión</th>
                <th className="py-3 px-4">Slug Identificador</th>
                <th className="py-3 px-4">Arreglos Vinculados</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {occasions.map((occ) => (
                <tr key={occ.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-lg text-[#E11D48]">
                    <Sparkles className="w-4 h-4 text-[#E11D48]" />
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{occ.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{occ.slug}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {occ.itemCount ?? 0} diseños
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(occ)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(occ.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingOccasion ? 'Editar Ocasión' : 'Nueva Ocasión'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Ocasión*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. 21 de Septiembre (Flores Amarillas)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Slug*</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
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
