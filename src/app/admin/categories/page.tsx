'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
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
  Tag,
  Package,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  ArrowUpRight,
  ChevronRight,
  Boxes,
  Lock
} from 'lucide-react';
import type { Category, Product } from '@/lib/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Modal para ver los productos asignados a una categoría
  const [viewingCategoryProducts, setViewingCategoryProducts] = useState<Category | null>(null);

  // Tab de categoría seleccionada en la sección inferior de productos
  const [selectedBottomTab, setSelectedBottomTab] = useState<number | 'all'>('all');

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/products?includeInactive=true&t=' + Date.now(), { cache: 'no-store' })
      ]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();

      if (catData.success && Array.isArray(catData.data)) {
        setCategories(catData.data);
      }
      if (prodData.success && Array.isArray(prodData.data)) {
        setProducts(prodData.data);
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar datos del catálogo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCategoryProducts = (catId: number) => {
    return products.filter((p) => p.category_id === catId || p.categoryId === catId);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    const nextOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.order || 0)) + 1
      : 1;
    setOrder(nextOrder.toString());
    setImageUrl('');
    setDescription('');
    setIsActive(true);
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setOrder(c.order ? c.order.toString() : '1');
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
      loadData();
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

  // Resumen de Métricas de Categorías
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive !== false).length;
    const totalItems = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);
    return { total, active, totalItems };
  }, [categories]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 ${toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
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
            Organiza las líneas de productos, mandos, alambres y partes técnicas para la tienda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] active:scale-[0.98] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#161311]" />
            <span>Nueva Categoría</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors shrink-0"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>
        </div>
      </div>

      {/* Resumen Superior de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A] block">
              Total Categorías
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono mt-1">
              {stats.total}
            </p>
            <span className="text-xs text-[#5C5650] font-medium">Líneas de catálogo registradas</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2DCD3] flex items-center justify-center text-[#D4A359] shadow-2xs">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A] block">
              Categorías Visibles
            </span>
            <p className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono mt-1">
              {stats.active}
            </p>
            <span className="text-xs text-[#5C5650] font-medium">Activas en catálogo público</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A] block">
              Productos Clasificados
            </span>
            <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono mt-1">
              {stats.totalItems}
            </p>
            <span className="text-xs text-[#5C5650] font-medium">Artículos distribuidos</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2DCD3] flex items-center justify-center text-[#D4A359] shadow-2xs">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Modo de Vista */}
      <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-3xl border border-[#E2DCD3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          <span className="text-xs font-bold text-[#5C5650] hidden md:inline">
            {filteredCategories.length} categorías
          </span>

          {/* Toggle Cuadrícula vs Tabla */}
          <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'grid'
                ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                : 'text-[#8C827A] hover:text-[#1A1817]'
                }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'table'
                ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                : 'text-[#8C827A] hover:text-[#1A1817]'
                }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Listado</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenedor Principal: Cuadrícula o Tabla */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#8C827A] bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] flex items-center justify-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4A359]" />
          <span className="font-bold">Cargando catálogo de categorías y productos...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#8C827A] bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3]">
          No se encontraron categorías registradas con este criterio.
        </div>
      ) : viewMode === 'grid' ? (
        /* ================= VISTA CUADRÍCULA DE TARJETAS ================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredCategories.map((c) => {
            const isCatActive = c.isActive !== false;
            const catProducts = getCategoryProducts(c.id);

            return (
              <div
                key={c.id}
                className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-xs hover:shadow-md hover:border-[#D4A359]/60 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3.5">
                  {/* Fila Superior: Orden + Estado */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs text-[#8C827A] bg-white px-2 py-0.5 rounded-lg border border-[#E2DCD3]">
                      #{c.order || 1}
                    </span>

                    {isCatActive ? (
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
                  </div>

                  {/* Icono + Título de Categoría (Sin imagen) */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/30 flex items-center justify-center shrink-0 shadow-2xs">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-base text-[#1A1817] truncate" title={c.name}>
                        {c.name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-[#8A6220] block truncate">
                        /{c.slug}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  {c.description && (
                    <p className="text-xs text-[#5C5650] line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  {/* Lista de Productos Asignados a esta Categoría */}
                  <div className="bg-white rounded-2xl p-3.5 border border-[#E2DCD3] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#E2DCD3]/60">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#1A1817] flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Productos Oficiales ({catProducts.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewingCategoryProducts(c)}
                        className="text-[10px] font-black text-[#D4A359] hover:text-[#1A1817] hover:underline cursor-pointer flex items-center gap-0.5"
                      >
                        <span>Ver detalle</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {catProducts.length === 0 ? (
                      <p className="text-xs text-[#8C827A] italic py-2 text-center">
                        Sin productos vinculados aún
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                        {catProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs py-2 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3]/70 hover:border-[#D4A359]/60 hover:bg-white transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0 mr-2">
                              <span className="font-mono font-black text-[10px] text-[#1A1817] bg-white px-2 py-0.5 rounded-lg border border-[#E2DCD3] shrink-0">
                                {p.sku}
                              </span>
                              <span
                                className="truncate text-[#1A1817] font-black text-xs"
                                title={p.name || p.title}
                              >
                                {p.name || p.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="font-mono font-black text-xs text-[#8A6220]">
                                ${p.priceUsd ? Number(p.priceUsd).toFixed(2) : (p.price / 12.01).toFixed(2)} USD
                              </span>
                              <span
                                className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-full border ${p.stock < 5
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  }`}
                                title={`${p.stock} unidades disponibles`}
                              >
                                {p.stock} u.
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer de Tarjeta: Botones de Acción */}
                <div className="pt-3 border-t border-[#E2DCD3] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingCategoryProducts(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#1A1817] bg-white hover:bg-[#211E1C] hover:text-[#D4A359] px-3.5 py-2 rounded-xl border border-[#E2DCD3] hover:border-[#211E1C] font-mono shadow-2xs transition-all cursor-pointer group/btn"
                    title="Ver todos los productos asignados en detalle"
                  >
                    <Package className="w-3.5 h-3.5 text-[#D4A359]" />
                    <span>{catProducts.length} productos</span>
                    <Eye className="w-3.5 h-3.5 text-[#8C827A] group-hover/btn:text-[#D4A359]" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/admin/products"
                      className="inline-flex items-center gap-1 text-xs font-black text-[#8A6220] hover:text-[#1A1817] bg-white px-3 py-2 rounded-xl border border-[#E2DCD3] hover:border-[#D4A359] transition-all cursor-pointer shadow-2xs"
                      title="Administrar en Productos & Stock"
                    >
                      <span>Gestionar</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="p-2 rounded-xl bg-white hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer"
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
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VISTA TABLA DETALLADA ================= */
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#211E1C] text-[#FAF8F5] font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Orden</th>
                  <th className="py-3.5 px-4">Nombre de Categoría</th>
                  <th className="py-3.5 px-4">Slug URL</th>
                  <th className="py-3.5 px-4 text-center">Artículos Asignados</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD3]/60 bg-white">
                {filteredCategories.map((c) => {
                  const catProducts = getCategoryProducts(c.id);

                  return (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/80 transition-colors group">
                      <td className="py-3 px-4 text-center font-mono font-black text-xs text-[#8C827A]">
                        #{c.order || 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/30 flex items-center justify-center shrink-0 shadow-2xs">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-black text-xs sm:text-sm text-[#1A1817]">
                              {c.name}
                            </p>
                            {c.description && (
                              <p className="text-[11px] text-[#8C827A] line-clamp-1 max-w-sm mt-0.5">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-[#8A6220] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E2DCD3] inline-block">
                          /{c.slug}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingCategoryProducts(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-black bg-[#FAF8F5] hover:bg-[#211E1C] text-[#1A1817] hover:text-[#D4A359] border border-[#E2DCD3] hover:border-[#211E1C] shadow-2xs transition-all cursor-pointer"
                          title="Clic para ver los productos asignados a esta categoría"
                        >
                          <Package className="w-3.5 h-3.5 text-[#D4A359]" />
                          <span>{catProducts.length} productos 👁️</span>
                        </button>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= SECCIÓN INFERIOR: REPOSITORIO COMPLETO DE PRODUCTOS POR CATEGORÍA ================= */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E2DCD3] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DCD3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#D4A359]"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                Inventario Oficial Interconectado
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[#1A1817]">
              Productos Oficiales Asignados por Grupo
            </h2>
          </div>

          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-xs shrink-0"
          >
            <Package className="w-3.5 h-3.5 text-[#161311]" />
            <span>Gestionar en Productos & Stock</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tabs de Filtro por Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedBottomTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${selectedBottomTab === 'all'
              ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
              : 'bg-white hover:bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]'
              }`}
          >
            Todos los Grupos ({products.length})
          </button>
          {categories.map((c) => {
            const count = getCategoryProducts(c.id).length;
            const isSelected = selectedBottomTab === c.id;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedBottomTab(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${isSelected
                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                  : 'bg-white hover:bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]'
                  }`}
              >
                <span>{c.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-[#D4A359] text-[#161311]' : 'bg-[#FAF8F5] text-[#8C827A]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tabla de Productos Filtrados */}
        <div className="bg-white rounded-2xl border border-[#E2DCD3] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#211E1C] text-[#FAF8F5] font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 text-center w-14">N°</th>
                  <th className="py-3 px-4 w-28">SKU / CÓDIGO</th>
                  <th className="py-3 px-4">NOMBRE DEL PRODUCTO</th>
                  <th className="py-3 px-4">CATEGORÍA</th>
                  <th className="py-3 px-3 text-center">PRECIO USD</th>
                  <th className="py-3 px-3 text-center">PRECIO (BS.)</th>
                  <th className="py-3 px-3 text-center">STOCK</th>
                  <th className="py-3 px-4 text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD3]/60">
                {(selectedBottomTab === 'all'
                  ? products
                  : getCategoryProducts(selectedBottomTab as number)
                ).map((p, index) => {
                  const assignedCat = categories.find(
                    (c) => c.id === (p.category_id || p.categoryId)
                  );

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-3 text-center font-mono">
                        <span className="font-mono text-[11px] font-bold text-[#8C827A] bg-[#FAF8F5] border border-[#E2DCD3] px-2 py-0.5 rounded-lg inline-block text-center min-w-[28px]">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-xs text-[#1A1817]">
                        <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E2DCD3] inline-block">
                          {p.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-xs text-[#1A1817]">
                        {p.name || p.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-300">
                          {assignedCat?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-xs text-[#8A6220]">
                        ${p.priceUsd ? Number(p.priceUsd).toFixed(2) : (p.price / 12.01).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-xs text-[#1A1817]">
                        Bs. {Number(p.price).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-mono font-black text-xs px-2 py-0.5 rounded-full border ${p.stock < 5
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}
                        >
                          {p.stock} unid.
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.is_active !== false && p.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Visible</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Oculto</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL DE DETALLE DE PRODUCTOS DE LA CATEGORÍA ================= */}
      {viewingCategoryProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#E2DCD3] p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A] block">
                    Productos Asignados
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-[#1A1817]">
                    {viewingCategoryProducts.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingCategoryProducts(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#211E1C] text-[#8C827A] hover:text-[#D4A359] border border-[#E2DCD3] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2DCD3] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#211E1C] text-[#FAF8F5] font-black uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-3 text-center w-14">N°</th>
                      <th className="py-3 px-4">SKU / CÓDIGO</th>
                      <th className="py-3 px-4">NOMBRE DEL PRODUCTO</th>
                      <th className="py-3 px-3 text-center">PRECIO USD</th>
                      <th className="py-3 px-3 text-center">PRECIO (BS.)</th>
                      <th className="py-3 px-3 text-center">STOCK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DCD3]/60">
                    {getCategoryProducts(viewingCategoryProducts.id).map((p, index) => (
                      <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className="font-mono text-[11px] font-bold text-[#8C827A] bg-[#FAF8F5] border border-[#E2DCD3] px-2 py-0.5 rounded-lg inline-block text-center min-w-[28px]">
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-black text-xs text-[#1A1817]">
                          <span className="bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E2DCD3] inline-block">
                            {p.sku}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-black text-xs text-[#1A1817]">
                          {p.name || p.title}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-xs text-[#8A6220]">
                          ${p.priceUsd ? Number(p.priceUsd).toFixed(2) : (p.price / 12.01).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-black text-xs text-[#1A1817]">
                          Bs. {Number(p.price).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`font-mono font-black text-xs px-2 py-0.5 rounded-full border ${p.stock < 5
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                          >
                            {p.stock} unid.
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2DCD3]">
              <span className="text-xs text-[#5C5650] font-bold">
                Total: {getCategoryProducts(viewingCategoryProducts.id).length} productos asignados
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingCategoryProducts(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#E2DCD3] text-[#5C5650] font-bold text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <Link
                  href="/admin/products"
                  className="px-5 py-2 rounded-xl bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                >
                  <span>Editar en Productos & Stock</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-black text-[#1A1817] block">
                      Orden de Visualización
                    </label>
                    <span className="text-[10px] font-bold text-[#8C827A] bg-[#FAF8F5] border border-[#E2DCD3] px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-[#8C827A]" />
                      Solo lectura
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={order}
                      className="w-full pl-3.5 pr-9 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl text-xs font-mono font-black text-[#5C5650] cursor-not-allowed select-none outline-none shadow-2xs"
                      title="El orden de visualización es automático y no se puede editar"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Lock className="w-3.5 h-3.5 text-[#8C827A]" />
                    </div>
                  </div>
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
