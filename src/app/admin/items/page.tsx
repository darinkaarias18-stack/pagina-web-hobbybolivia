'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Plane,
  Loader2,
  Package,
  Camera,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { ImageUploader } from '@/components/ui/ImageUploader';
import type { CatalogItem, Category, ItemType, Availability, ActionType } from '@/lib/types';

function AdminItemsContent() {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get('action');
  const editIdParam = searchParams.get('edit');

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Form Fields
  const [sku, setSku] = useState('');
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Dubro');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<ItemType>('PRODUCT');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [availability, setAvailability] = useState<Availability>('IN_STOCK');
  const [stockQuantity, setStockQuantity] = useState('15');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch(`/api/items?t=${Date.now()}`, { cache: 'no-store' }),
        fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' })
      ]);

      const itemsJson = await itemsRes.json();
      const catsJson = await catsRes.json();

      if (itemsJson.success) setItems(itemsJson.data);
      if (catsJson.success) setCategories(catsJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL action trigger (?action=new or ?edit=1)
  useEffect(() => {
    if (!loading && items.length > 0) {
      if (actionParam === 'new') {
        openCreateModal();
        if (typeof window !== 'undefined') window.history.replaceState({}, '', '/admin/items');
      } else if (editIdParam) {
        const itemToEdit = items.find((i) => i.id === Number(editIdParam));
        if (itemToEdit) openEditModal(itemToEdit);
        if (typeof window !== 'undefined') window.history.replaceState({}, '', '/admin/items');
      }
    }
  }, [actionParam, editIdParam, loading]);

  const openCreateModal = () => {
    setEditingItem(null);
    setSku(`HB-RC-${Date.now().toString().slice(-4)}`);
    setTitle('');
    setBrand('Dubro');
    setSlug('');
    setDescription('');
    setItemType('PRODUCT');
    setPrice('');
    setCompareAtPrice('');
    setAvailability('IN_STOCK');
    setStockQuantity('15');
    setCategoryId(categories[0]?.id || 1);
    setImageUrl('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setSku(item.sku);
    setTitle(item.title);
    setBrand(item.brand || 'Dubro');
    setSlug(item.slug);
    setDescription(item.description);
    setItemType(item.itemType);
    setPrice(item.price.toString());
    setCompareAtPrice(item.compareAtPrice ? item.compareAtPrice.toString() : '');
    setAvailability(item.availability);
    setStockQuantity(item.stockQuantity.toString());
    setCategoryId(item.categoryId);
    setImageUrl(item.images?.[0] || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingItem) {
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

  const handleQuickToggleStock = async (item: CatalogItem) => {
    const nextAvailability: Availability =
      item.availability === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: nextAvailability })
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, availability: nextAvailability } : i))
        );
        showToast(
          nextAvailability === 'IN_STOCK'
            ? `Stock activado para "${item.title}"`
            : `Marcado como agotado: "${item.title}"`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const promptDeleteItem = (item: CatalogItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/items/${itemToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
        showToast(`Producto "${itemToDelete.title}" eliminado con éxito.`);
        setItemToDelete(null);
      } else {
        alert(data.error || 'No se pudo eliminar el producto.');
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al eliminar el producto.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !price) {
      setFormError('El nombre del producto y el precio son obligatorios');
      return;
    }

    setFormSaving(true);
    try {
      const finalImage = imageUrl.trim() || 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
      const payload = {
        sku: sku.trim() || `HB-${Date.now().toString().slice(-4)}`,
        title: title.trim(),
        brand: brand.trim() || null,
        slug: slug.trim() || `item-${Date.now()}`,
        description: description.trim(),
        itemType,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        availability,
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        actionType: 'ADD_TO_CART' as ActionType,
        categoryId: Number(categoryId),
        images: [finalImage]
      };

      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar el producto');
      }

      // Reflect change immediately in local state
      if (editingItem) {
        setItems((prev) =>
          prev.map((i) => (i.id === editingItem.id ? { ...i, ...data.data, images: [finalImage] } : i))
        );
      } else if (data.data) {
        setItems((prev) => [{ ...data.data, images: [finalImage] }, ...prev]);
      }

      setIsModalOpen(false);
      showToast(editingItem ? 'Fotografía y datos actualizados con éxito.' : 'Producto creado con éxito.');
      await loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setFormSaving(false);
    }
  };

  const filteredItems = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q) ||
      (i.brand && i.brand.toLowerCase().includes(q)) ||
      (i.category && i.category.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-[#e04f26] uppercase tracking-wider block">
            Inventario & Productos
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#162544] tracking-tight">
            Gestión de Productos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Crea, edita fotografías, ajusta precios y gestiona stock disponible en la web.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-5 py-2.5 bg-[#e04f26] hover:bg-[#c93e18] text-white font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 font-black" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, código SKU, marca (Dubro, Great Planes)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <span className="text-xs text-slate-500 font-semibold">
          {filteredItems.length} {filteredItems.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#162544]" />
            <span>Cargando productos desde la base de datos...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500 space-y-3">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No se encontraron productos con ese término.</p>
            <button
              onClick={() => setSearch('')}
              className="text-xs text-[#e04f26] font-bold hover:underline"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Foto</th>
                  <th className="py-3 px-4">Nombre del Producto</th>
                  <th className="py-3 px-4">Marca</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Stock Rápido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.images?.[0] || 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp'}
                          alt={item.title}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    </td>

                    {/* Title & SKU */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 leading-snug">{item.title}</p>
                      <span className="font-mono text-[10px] text-slate-400 block mt-0.5">{item.sku}</span>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[11px] text-[#162544] uppercase tracking-wide">
                        {item.brand || 'Dubro'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {item.category?.name || 'Conectores y Mandos'}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        $us {Number(item.price).toFixed(2)}
                      </div>
                      {item.compareAtPrice && (
                        <span className="text-[10px] text-slate-400 line-through font-mono">
                          $us {Number(item.compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Quick Stock Toggle (1 click) */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleQuickToggleStock(item)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                          item.availability === 'IN_STOCK'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                        title="Haz clic para alternar entre Con Stock / Sin Stock"
                      >
                        {item.availability === 'IN_STOCK' ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Con Stock ({item.stockQuantity})</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            <span>Sin Stock (Agotado)</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* 3 Action Buttons on the Right */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. Edit / Change Photo Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-[#162544] hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                          title="Cambiar fotografía, precio, stock o datos"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#e04f26] group-hover:text-white transition-colors" />
                          <span>Editar</span>
                        </button>

                        {/* 2. Delete Button */}
                        <button
                          type="button"
                          onClick={() => promptDeleteItem(item)}
                          className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
                          title="Eliminar producto permanentemente"
                        >
                          <Trash2 className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
                          <span>Eliminar</span>
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

      {/* ========================================================
          CREATE / EDIT MODAL (CON IMAGE UPLOADER INTEGRADO)
      ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#e04f26]/10 text-[#e04f26] flex items-center justify-center">
                  {editingItem ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-[#162544]">
                    {editingItem ? 'Editar Producto / Cambiar Foto' : 'Crear Nuevo Producto'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingItem ? `Actualizando SKU: ${sku}` : 'Ingresa los datos para publicarlo en la web.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                <span>✕</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              {/* 1. Fotografía del Producto (ImageUploader: PC o URL) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <ImageUploader
                  label="Fotografía del Producto (Sube de tu PC o pega un link)"
                  value={imageUrl}
                  onChange={setImageUrl}
                  recommendedSize="Solo se pueden subir imágenes en formato PNG y JPG hasta 3 megas"
                />
              </div>

              {/* 2. Nombre del Producto & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Producto*</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ej. Conectores E/Z Dubro (12)"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código / SKU*</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ej. DUBQ3570"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
                  />
                </div>
              </div>

              {/* 3. Categoría & Marca */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría*</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca / Línea*</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej. Dubro, Great Planes, Futaba, etc."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544] focus:ring-1 focus:ring-[#162544]"
                  />
                </div>
              </div>

              {/* 4. Precio ($us), Precio Anterior y Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio ($us)*</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="31.70"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Anterior (Opcional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cantidad en Stock</label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544]"
                  />
                </div>
              </div>

              {/* 5. Disponibilidad rápida */}
              <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700">Estado de Stock:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="IN_STOCK"
                    checked={availability === 'IN_STOCK'}
                    onChange={() => setAvailability('IN_STOCK')}
                  />
                  <span className="text-emerald-700 font-bold">Disponible / Con Stock</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="availability"
                    value="OUT_OF_STOCK"
                    checked={availability === 'OUT_OF_STOCK'}
                    onChange={() => setAvailability('OUT_OF_STOCK')}
                  />
                  <span className="text-rose-700 font-bold">Agotado / Sin Stock</span>
                </label>
              </div>

              {/* 6. Descripción Breve */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Descripción Breve</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre rosca, compatibilidad, medidas o contenido del empaque..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-[#162544]"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-6 py-2.5 bg-[#162544] hover:bg-[#1d2b53] text-white rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-colors"
                >
                  {formSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingItem ? 'Guardar Cambios' : 'Publicar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PRODUCTO
      ======================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-slate-800 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#162544]">
                  ¿Eliminar este producto?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Estás a punto de eliminar permanentemente <strong className="text-slate-900 font-bold">{itemToDelete.title}</strong> (SKU: {itemToDelete.sku}). Esta acción lo removerá de la base de datos y ya no aparecerá en el catálogo web.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-full hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteItem}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Eliminando...' : 'Sí, Eliminar Producto'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#10202f] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminItemsPage() {
  return (
    <Suspense fallback={
      <div className="p-16 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#162544]" />
        <span>Cargando productos...</span>
      </div>
    }>
      <AdminItemsContent />
    </Suspense>
  );
}
