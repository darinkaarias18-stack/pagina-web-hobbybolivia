'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Tag
} from 'lucide-react';
import type { Category } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState('1');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar las categorías', 'error');
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
    setImageUrl('https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp');
    setDescription('');
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setOrder(c.order.toString());
    setImageUrl(c.imageUrl || c.image_url || '');
    setDescription(c.description || '');
    setIsActive(c.isActive !== false);
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

  const handleDelete = async (id: number, catName: string) => {
    if (!confirm(`¿Eliminar la categoría "${catName}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast(`Categoría "${catName}" eliminada correctamente`);
      } else {
        showToast(data.error || 'Error al eliminar la categoría', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al eliminar la categoría', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('El nombre y el slug son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        order: parseInt(order, 10) || 0,
        imageUrl: imageUrl.trim(),
        image_url: imageUrl.trim(),
        description: description.trim(),
        isActive
      };

      const res = await fetch('/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory ? { ...payload, id: editingCategory.id } : payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar la categoría');
      }

      setIsModalOpen(false);
      showToast(editingCategory ? 'Categoría actualizada con éxito' : 'Nueva categoría creada con éxito');
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  // Filtrado reactivo en tiempo real
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const q = searchTerm.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${
            toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Estructura del Catálogo · Aeromodelismo & R/C
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión de Categorías
          </h1>
          <p className="text-xs text-[#8C827A] mt-0.5">
            Organiza las líneas de repuestos, mandos, alambres y partes técnicas para la tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] active:scale-[0.98] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#161311]" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Resumen */}
      <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-[#E2DCD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, slug o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E2DCD3] rounded-2xl text-xs text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-[#5C5650]">
          <span className="px-3 py-1 rounded-full bg-white border border-[#E2DCD3] font-mono shadow-2xs">
            {filteredCategories.length} de {categories.length} categorías
          </span>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-[#8C827A] flex items-center justify-center gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-[#D4A359]" />
            <span className="font-bold">Cargando catálogo de categorías...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-16 text-center text-xs text-[#8C827A]">
            No se encontraron categorías registradas con este criterio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#5C5650] font-black uppercase text-[10.5px] tracking-wider border-b border-[#E2DCD3]">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Orden</th>
                  <th className="py-3.5 px-4 w-20">Miniatura</th>
                  <th className="py-3.5 px-4">Nombre de Categoría</th>
                  <th className="py-3.5 px-4">Slug URL</th>
                  <th className="py-3.5 px-4 text-center">Artículos</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD3]/60 bg-white">
                {filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                    <td className="py-3 px-4 text-center font-mono font-black text-xs text-[#8C827A]">
                      #{c.order}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-center shrink-0 p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.imageUrl || c.image_url || 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'}
                          alt={c.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
                          }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-black text-xs sm:text-sm text-[#1A1817]">
                        {c.name}
                      </p>
                      {c.description && (
                        <p className="text-[11px] text-[#8C827A] line-clamp-1 max-w-sm mt-0.5">
                          {c.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-[#161311] bg-[#F5F2EB] px-2.5 py-1 rounded-lg border border-[#E2DCD3] inline-block">
                        /{c.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]">
                        {c.itemCount ?? 0} repuestos
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {c.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Activa</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Oculta</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer"
                          title="Editar categoría"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-colors cursor-pointer"
                          title="Eliminar categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full shadow-2xl border border-[#E2DCD3] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#D4A359]" />
                <h3 className="font-black text-base text-[#1A1817]">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría de Catálogo'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#211E1C] text-[#8C827A] hover:text-[#D4A359] border border-[#E2DCD3] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-black text-[#1A1817] block mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Varillaje y Mandos R/C"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-2xl text-xs text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-[#1A1817] block mb-1">
                    Slug URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="varillaje-y-mandos-rc"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-2xl text-xs font-mono text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none"
                  />
                </div>

                <div>
                  <label className="font-black text-[#1A1817] block mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-2xl text-xs font-mono font-bold text-[#1A1817] focus:border-[#D4A359] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-black text-[#1A1817] block mb-1">
                  URL de Imagen Miniatura
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://hobbybolivia.com/media/products/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-2xl text-xs text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-mono"
                  />
                  {imageUrl && (
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#E2DCD3] p-1 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="font-black text-[#1A1817] block mb-1">
                  Descripción Técnica de la Categoría
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe los componentes que agrupa esta categoría para los aeromodelistas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-2xl text-xs text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#D4A359] rounded cursor-pointer"
                  />
                  <span className="font-bold text-xs text-[#1A1817]">
                    Categoría activa y visible en la tienda
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2DCD3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E2DCD3] bg-white hover:bg-[#FAF8F5] text-[#5C5650] font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] active:scale-[0.98] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar Categoría</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
