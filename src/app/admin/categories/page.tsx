'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setOrder((categories.length + 1).toString());
    setImageUrl('https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600');
    setDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setOrder(c.order.toString());
    setImageUrl(c.imageUrl || '');
    setDescription(c.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) setCategories((prev) => prev.filter((c) => c.id !== id));
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
      const payload = {
        name,
        slug,
        order: parseInt(order, 10) || 0,
        imageUrl,
        description
      };

      const res = await fetch('/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...payload, id: editingCategory.id } : payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error al guardar');

      setIsModalOpen(false);
      loadCategories();
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
          <span className="text-xs font-bold text-[#8a6a00] uppercase tracking-wider block">
            Estructura del Catálogo RC
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10202f] font-serif">
            Gestión de Categorías
          </h1>
          <p className="text-xs text-[#6b7480]">
            Organiza los grupos de repuestos, mandos, alambres y partes para aeromodelismo.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-[#10202f] hover:bg-[#1b3248] text-[#f2b705] font-bold text-xs rounded-full flex items-center gap-1.5 shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#dcd5c4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#6b7480] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#10202f]" />
            <span>Cargando categorías...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Orden</th>
                <th className="py-3 px-4">Foto</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Productos</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-400">#{c.order}</td>
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=200'}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">
                    {c.itemCount ?? 0} artículos
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl">{error}</div>}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre*</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
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

              <div>
                <label className="font-bold text-slate-700 block mb-1">Orden de Presentación</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Imagen Miniatura</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
