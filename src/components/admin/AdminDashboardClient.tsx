'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Package,
  Layers,
  AlertTriangle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Save,
  RotateCcw,
  SlidersHorizontal,
  FileText,
  CheckCircle2,
  Plane,
  Activity,
  Coins,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Boxes
} from 'lucide-react';
import type { Product, Category, Policy } from '@/lib/types';

export function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'products' | 'policies'
  const [activeTab, setActiveTab] = useState<'products' | 'policies'>('products');

  // Exchange Rate State in Dashboard
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Inline Fast Editing state
  const [inlineLoadingId, setInlineLoadingId] = useState<number | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: 1,
    scale: 'RC Estándar',
    material: 'Aluminio CNC / Latón',
    specs_line: '',
    compatible_models: '',
    price: '',
    currency: 'Bs.',
    old_price: '',
    stock: '',
    badge: '' as any,
    image_url: '',
    brand: 'Dubro',
    description: ''
  });

  // Image Upload Dropzone State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleImageFile = async (file: File) => {
    setImageError(null);

    // 1. Limitar tamaño máximo permitido por archivo a 2 MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setImageError("El tamaño máximo permitido por imagen es de 2 MB.");
      return;
    }

    // 2. Formatos web permitidos: .jpg, .jpeg, .png, .webp
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
    const isMimeOk = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    const isExtOk = allowedExtensions.includes(ext);

    if (!isMimeOk && !isExtOk) {
      setImageError("Solo se permiten formatos web (.jpg, .jpeg, .png, .webp)");
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, image_url: data.url }));
        showToast("Imagen optimizada en WebP correctamente");
      } else {
        setImageError(data.error || "Error al subir la imagen");
      }
    } catch (err: any) {
      setImageError(err?.message || "Error al conectar con el servidor de subidas");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Policy Editor State
  const [selectedPolicySlug, setSelectedPolicySlug] = useState('envios');
  const [policyFormTitle, setPolicyFormTitle] = useState('');
  const [policyFormContent, setPolicyFormContent] = useState('');
  const [policySaving, setPolicySaving] = useState(false);

  // Delete Confirmation State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load Data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, polRes, rateRes] = await Promise.all([
        fetch('/api/products?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/policies?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/exchange-rate?t=' + Date.now(), { cache: 'no-store' })
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const polData = await polRes.json();
      const rateData = await rateRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
      if (rateData.success && rateData.data) {
        setExchangeRate(Number(rateData.data.exchangeRate) || 6.96);
        setAutoUpdate(rateData.data.autoUpdate !== false);
      }
      if (polData.success) {
        setPolicies(polData.data);
        const currentPol = polData.data.find((p: Policy) => p.slug === selectedPolicySlug) || polData.data[0];
        if (currentPol) {
          setSelectedPolicySlug(currentPol.slug);
          setPolicyFormTitle(currentPol.title);
          setPolicyFormContent(currentPol.content);
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error al cargar los datos del catálogo", "error");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Inline Fast Update (Price, Stock or Currency)
  const handleInlineUpdate = async (id: number, field: 'price' | 'stock' | 'currency', value: any) => {
    setInlineLoadingId(id);
    try {
      const payload = field === 'currency'
        ? { currency: value, display_currency: value }
        : { [field]: value };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (p.id === id ? { ...p, [field]: value, ...(field === 'currency' ? { currency: value, display_currency: value } : {}) } : p))
        );
        const msg = field === 'currency'
          ? `Repuesto configurado para mostrarse en ${value === 'USD' ? 'Dólares ($ USD)' : 'Bolivianos (Bs.)'}`
          : `${field === 'price' ? 'Precio' : 'Stock'} actualizado`;
        showToast(msg);
      } else {
        showToast(data.error || "Error al actualizar", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al actualizar", "error");
    } finally {
      setInlineLoadingId(null);
    }
  };

  // Open Modal for Create
  const openCreateModal = () => {
    setEditingProduct(null);
    setImageError(null);
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id), 0) + 1 : 1;
    const defaultSku = `HB-${nextId.toString().padStart(4, '0')}`;
    setFormData({
      sku: defaultSku,
      name: '',
      categoryId: categories[0]?.id || 1,
      scale: 'RC Estándar',
      material: 'Aluminio CNC / Latón',
      specs_line: '',
      compatible_models: '',
      price: '',
      currency: 'Bs.',
      old_price: '',
      stock: '15',
      badge: '',
      image_url: '',
      brand: 'Dubro',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageError(null);
    const systemDefaultSku = `HB-${product.id.toString().padStart(4, '0')}`;
    const initialSku = (product.sku && product.sku.startsWith('HB-')) ? product.sku : systemDefaultSku;
    setFormData({
      sku: initialSku,
      name: product.name || product.title || '',
      categoryId: product.category_id || product.categoryId || 1,
      scale: product.scale || 'RC Estándar',
      material: product.material || 'Aluminio CNC / Latón',
      specs_line: product.specs_line || '',
      compatible_models: product.compatible_models || '',
      price: String(product.price || ''),
      currency: product.currency || 'Bs.',
      old_price: product.old_price ? String(product.old_price) : '',
      stock: product.stock !== undefined ? String(product.stock) : (product.stockQuantity !== undefined ? String(product.stockQuantity) : ''),
      badge: (product.badge || '') as any,
      image_url: product.image_url || (product.images && product.images[0]) || '',
      brand: product.brand || 'Dubro',
      description: product.description || ''
    });
    setIsModalOpen(true);
  };

  // Save Policy Handler
  const handleSelectPolicy = (slug: string) => {
    setSelectedPolicySlug(slug);
    const pol = policies.find(p => p.slug === slug);
    if (pol) {
      setPolicyFormTitle(pol.title);
      setPolicyFormContent(pol.content);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaving(true);
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedPolicySlug,
          title: policyFormTitle,
          content: policyFormContent
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Política actualizada y sincronizada en tiempo real");
        setPolicies(prev =>
          prev.map(p =>
            p.slug === selectedPolicySlug
              ? { ...p, title: policyFormTitle, content: policyFormContent }
              : p
          )
        );
      } else {
        showToast(data.error || "Error al guardar política", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al guardar", "error");
    } finally {
      setPolicySaving(false);
    }
  };

  // Submit Product Form (Create or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url.trim()) {
      setImageError("Por favor carga o selecciona una imagen para el repuesto.");
      return;
    }

    const targetId = editingProduct ? editingProduct.id : (products.length > 0 ? Math.max(...products.map(p => p.id), 0) + 1 : 1);
    const finalSku = formData.sku.trim() || `HB-${targetId.toString().padStart(4, '0')}`;

    const payload = {
      sku: finalSku,
      name: formData.name.trim(),
      category_id: Number(formData.categoryId),
      categoryId: Number(formData.categoryId),
      scale: formData.scale,
      material: formData.material,
      specs_line: formData.specs_line.trim() || 'Especificaciones estándar Hobby Bolivia',
      compatible_models: formData.compatible_models.trim(),
      price: parseFloat(formData.price) || 0,
      currency: formData.currency || 'Bs.',
      display_currency: (formData.currency || 'Bs.') as any,
      old_price: formData.old_price ? parseFloat(formData.old_price) : undefined,
      stock: formData.stock ? parseInt(formData.stock, 10) : 0,
      badge: formData.badge || undefined,
      image_url: formData.image_url.trim(),
      images: [formData.image_url.trim()],
      brand: formData.brand.trim(),
      description: formData.description.trim()
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast("Producto actualizado exitosamente");
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast(data.error || "Error al actualizar", "error");
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          showToast("Nuevo repuesto añadido al catálogo");
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast(data.error || "Error al crear", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error de red al procesar el producto", "error");
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast("Producto eliminado del catálogo");
        setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      } else {
        showToast(data.error || "Error al eliminar", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al eliminar", "error");
    } finally {
      setProductToDelete(null);
    }
  };

  // Filtered Products (Table Rows)
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (p.name || p.title || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term);

    const matchCategory =
      categoryFilter === 'all' ||
      (p.category_id || p.categoryId) === Number(categoryFilter);

    return matchSearch && matchCategory;
  });

  // Metrics in function of the table below (filteredProducts)
  const totalProducts = filteredProducts.length;
  const activeCategoriesCount = categoryFilter === 'all'
    ? new Set(filteredProducts.map(p => p.category_id || p.categoryId)).size
    : (filteredProducts.length > 0 ? 1 : 0);
  const totalInventoryValue = filteredProducts.reduce((acc, p) => acc + (p.price * (p.stock || p.stockQuantity || 0)), 0);
  const totalStockUnits = filteredProducts.reduce((acc, p) => {
    const qty = p.stock !== undefined ? Number(p.stock) : (Number(p.stockQuantity) || 0);
    return acc + (isNaN(qty) ? 0 : qty);
  }, 0);
  const lowStockCount = filteredProducts.filter(p => (p.stock !== undefined ? Number(p.stock) : (Number(p.stockQuantity) || 0)) < 5).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${
          toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}



      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F85606]"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Panel de Control Central Warm Tech
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión Integral Hobby Bolivia
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Currency Status (Solo informativo) */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF8F5] text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs select-none"
            title="Sincronización automática de paridad cada 24 horas"
          >
            <Coins className="w-4 h-4 text-[#D4A359]" />
            <span>TC Oficial:</span>
            <span className="font-mono font-black text-[#F85606]">
              Bs. {exchangeRate.toFixed(2)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] font-mono font-bold">
              {autoUpdate ? 'Auto' : 'Manual'}
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>
        </div>
      </div>

      {/* 1. Dashboard de Métricas en Warm Tech */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Productos (Columna: Producto / Repuesto) */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shrink-0 border border-[#D4A359]/30">
            <Package className="w-6 h-6 text-[#D4A359]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
              Total Productos
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">
              {totalProducts}
            </p>
          </div>
        </div>

        {/* 2. Categorías (Columna: Categoría) */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#2D2622]">
            <Layers className="w-6 h-6 text-[#D4A359]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
              Categorías
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">
              {activeCategoriesCount}
            </p>
          </div>
        </div>

        {/* 3. Valor Total del Inventario (Columna: Precio) */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F85606]/10 text-[#F85606] flex items-center justify-center shrink-0 border border-[#F85606]/20">
            <span className="text-lg font-black text-[#F85606]">Bs.</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
              Valor Inventario (Bs.)
            </span>
            <p className="text-xl sm:text-2xl font-black text-[#1A1817] leading-tight">
              Bs. {totalInventoryValue.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* 4. Total Stock (Columna: Stock) */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#FAF8F5] flex items-center justify-center shrink-0 border border-[#2D2622]">
            <Boxes className="w-6 h-6 text-[#D4A359]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
                Total Stock
              </span>
              {lowStockCount > 0 && (
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-[#F85606]/15 text-[#F85606] border border-[#F85606]/30">
                  {lowStockCount} bajo stock
                </span>
              )}
            </div>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">
              {totalStockUnits.toLocaleString('es-BO')} <span className="text-xs font-bold text-[#8C827A]">unid.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs between Product Management & Policies */}
      <div className="flex items-center gap-2 border-b border-[#E2DCD3] pt-2">
        <button
          onClick={() => setActiveTab('products')}
          type="button"
          className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#D4A359] text-[#1A1817]'
              : 'border-transparent text-[#8C827A] hover:text-[#1A1817]'
          }`}
        >
          <Package className="w-4 h-4 text-[#D4A359]" />
          <span>Catálogo de Repuestos & Edición en Línea ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          type="button"
          className={`flex items-center gap-2 px-6 py-3 font-black text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'policies'
              ? 'border-[#D4A359] text-[#1A1817]'
              : 'border-transparent text-[#8C827A] hover:text-[#1A1817]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#D4A359]" />
          <span>Gestor de Políticas en Tiempo Real</span>
        </button>
      </div>

      {/* 2. TAB: PRODUCT MANAGEMENT (CRUD & INLINE EDITING) */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          
          {/* Controls: Search & Category filter */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E2DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar por SKU o Nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
              />
              <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold w-full sm:w-auto"
              >
                <option value="all">Todas las Categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={openCreateModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] rounded-full text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#211E1C] text-[#FAF8F5] uppercase text-[10px] font-black tracking-wider">
                    <th className="py-3.5 px-4">Producto / Repuesto</th>
                    <th className="py-3.5 px-3">SKU</th>
                    <th className="py-3.5 px-3">Categoría</th>
                    <th className="py-3.5 px-3">Precio (Bs.)</th>
                    <th className="py-3.5 px-3">Precio en USD</th>
                    <th className="py-3.5 px-3 text-center">Mostrar en</th>
                    <th className="py-3.5 px-3">Stock</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2DCD3]">
                  {filteredProducts.map((p) => {
                    const imgSrc = p.image_url || (p.images && p.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
                    const isSaving = inlineLoadingId === p.id;
                    const catName = categories.find(c => c.id === (p.category_id || p.categoryId))?.name || 'General';

                    return (
                      <tr key={p.id} className="hover:bg-white/80 transition-colors">
                        
                        {/* Name + Image (STRICT RULE: bg-white, object-contain) */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                              <img
                                src={imgSrc}
                                alt={p.name || p.title}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-[#1A1817] block truncate max-w-xs">
                                {p.name || p.title}
                              </span>
                              <span className="text-[10px] text-[#5C5650] block truncate max-w-xs">
                                {p.specs_line || p.material}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3 px-3 font-mono font-bold text-[#D4A359] whitespace-nowrap">
                          {(p.sku && p.sku.startsWith('HB-')) ? p.sku : `HB-${p.id.toString().padStart(4, '0')}`}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 text-[#5C5650] whitespace-nowrap">
                          <span className="block font-bold text-[#1A1817]">{catName}</span>
                        </td>

                        {/* Fast Inline Edit: Precio (Bs.) */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[#8C827A] font-bold text-[10px]">Bs.</span>
                            <input
                              type="number"
                              step="0.5"
                              defaultValue={p.price}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val !== p.price) {
                                  handleInlineUpdate(p.id, 'price', val);
                                }
                              }}
                              className="w-20 p-1.5 font-bold text-[#1A1817] bg-white border border-[#E2DCD3] rounded-lg focus:border-[#D4A359] outline-none text-xs"
                            />
                          </div>
                        </td>

                        {/* Precio en USD (calculado según TC Oficial) */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1 font-mono font-bold text-xs">
                            <span className="text-[#8C827A] text-[10px] font-sans">$</span>
                            <span className="text-[#1A1817]">
                              {(exchangeRate > 0 ? (p.price / exchangeRate) : 0).toFixed(2)}
                            </span>
                            <span className="text-[9px] text-[#8C827A] font-sans uppercase">USD</span>
                          </div>
                        </td>

                        {/* Opción de elegir si el producto se mostrará en Bs. o en USD */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center p-0.5 bg-white border border-[#E2DCD3] rounded-xl shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleInlineUpdate(p.id, 'currency', 'Bs.')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                                (p.currency || 'Bs.') === 'Bs.'
                                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                                  : 'text-[#8C827A] hover:text-[#1A1817]'
                              }`}
                              title="Mostrar este producto en Bolivianos (Bs.) en el catálogo público"
                            >
                              Bs.
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInlineUpdate(p.id, 'currency', 'USD')}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                                p.currency === 'USD'
                                  ? 'bg-[#128C7E] text-white shadow-xs'
                                  : 'text-[#8C827A] hover:text-[#1A1817]'
                              }`}
                              title="Mostrar este producto en Dólares ($ USD) en el catálogo público"
                            >
                              USD
                            </button>
                          </div>
                        </td>

                        {/* Fast Inline Edit: Stock */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              key={`${p.id}-stock-${p.stock}`}
                              type="number"
                              defaultValue={p.stock !== undefined ? p.stock : (p.stockQuantity || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val !== p.stock) {
                                  handleInlineUpdate(p.id, 'stock', val);
                                }
                              }}
                              className={`w-16 p-1.5 font-bold rounded-lg border text-xs focus:border-[#D4A359] outline-none ${
                                (p.stock || p.stockQuantity || 0) < 5
                                  ? 'bg-[#F85606]/10 text-[#F85606] border-[#F85606]/30'
                                  : 'bg-white text-[#1A1817] border-[#E2DCD3]'
                              }`}
                            />
                            {isSaving && <span className="text-[10px] text-[#D4A359] animate-pulse">Guardando...</span>}
                          </div>
                        </td>



                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg text-[#5C5650] hover:text-[#1A1817] hover:bg-white transition-colors cursor-pointer"
                              title="Editar repuesto completo"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-1.5 rounded-lg text-[#8C827A] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar repuesto"
                            >
                              <Trash2 className="w-4 h-4" />
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

        </div>
      )}

      {/* 3. TAB: POLICIES MANAGER (PUT /api/policies) */}
      {activeTab === 'policies' && (
        <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#E2DCD3] shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-lg text-[#1A1817] tracking-tight uppercase">
              Gestor de Políticas Oficiales de Hobby Bolivia
            </h3>
            <p className="text-xs text-[#5C5650] mt-0.5">
              Actualiza las condiciones de embalaje frágil en tubos de PVC, envíos a toda Bolivia, garantías y devoluciones en tiempo real.
            </p>
          </div>

          {/* Policy Selector Buttons */}
          <div className="flex flex-wrap gap-2">
            {policies.map((pol) => (
              <button
                key={pol.slug}
                type="button"
                onClick={() => handleSelectPolicy(pol.slug)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedPolicySlug === pol.slug
                    ? 'bg-[#211E1C] text-[#FAF8F5] border border-[#D4A359]/40 shadow-sm font-black'
                    : 'bg-white text-[#5C5650] hover:text-[#1A1817] border border-[#E2DCD3]'
                }`}
              >
                {pol.title}
              </button>
            ))}
          </div>

          {/* Policy Editor Form */}
          <form onSubmit={handleSavePolicy} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#1A1817] mb-1">
                Título Oficial de la Política
              </label>
              <input
                type="text"
                required
                value={policyFormTitle}
                onChange={(e) => setPolicyFormTitle(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1A1817] mb-1">
                Contenido / Términos de la Política (Markdown y texto enriquecido)
              </label>
              <textarea
                rows={9}
                required
                value={policyFormContent}
                onChange={(e) => setPolicyFormContent(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none leading-relaxed font-mono"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#8C827A]">
                Los cambios se guardan y sincronizan automáticamente con la web pública.
              </span>
              <button
                type="submit"
                disabled={policySaving}
                className="px-6 py-3 bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider rounded-full shadow-md flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#161311]" />
                <span>{policySaving ? 'Guardando...' : 'Guardar Cambios de Política'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E2DCD3] max-h-[92vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2DCD3] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F85606] flex items-center justify-center text-white">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <h3 className="font-black text-base text-[#1A1817] uppercase tracking-wide">
                  {editingProduct ? 'Editar Repuesto Aeronáutico' : 'Agregar Nuevo Repuesto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#FAF8F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Nombre del Repuesto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Conectores E/Z Dubro (12)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#1A1817]">SKU Oficial</label>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] uppercase tracking-wider font-mono">
                      Asignado por el sistema
                    </span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={formData.sku}
                    className="w-full p-2.5 bg-[#F2EDE4] border border-[#DCD6CC] rounded-xl outline-none font-mono font-black uppercase tracking-wider text-[#1A1817] cursor-not-allowed select-none"
                    title="Código oficial generado automáticamente por el sistema. No editable."
                  />
                  <span className="text-[10px] text-[#8C827A] mt-1 block">
                    Identificador único no editable generado por el sistema.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Categoría *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Precio en Bs. *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="220"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">
                    Mostrar en Tienda *
                  </label>
                  <div className="flex items-center gap-1 p-1 bg-[#F2EDE4] border border-[#DCD6CC] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: 'Bs.' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        (formData.currency || 'Bs.') === 'Bs.'
                          ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                          : 'text-[#5C5650] hover:text-[#1A1817]'
                      }`}
                    >
                      Bs.
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: 'USD' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all cursor-pointer ${
                        formData.currency === 'USD'
                          ? 'bg-[#128C7E] text-white shadow-xs'
                          : 'text-[#5C5650] hover:text-[#1A1817]'
                      }`}
                    >
                      USD
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">
                    Stock Disponible <span className="text-[#8C827A] font-normal text-[11px]">(Opcional)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold"
                  />
                </div>
              </div>



              <div>
                <label className="block font-bold text-[#1A1817] mb-1">
                  Línea de Especificaciones Técnicas <span className="text-[#8C827A] font-normal text-[11px]">(Opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs"
                  value={formData.specs_line}
                  onChange={(e) => setFormData({ ...formData, specs_line: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                />
              </div>

              {/* ZONA DE CARGA DE IMÁGENES (DROPZONE + PREVIEW) */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="block font-bold text-[#1A1817] text-xs uppercase tracking-wider">
                    Foto del Repuesto / Producto *
                  </label>
                  <span className="text-[11px] font-semibold text-[#8C827A]">
                    Solo se aceptan imágenes de 2 MB como máximo
                  </span>
                </div>

                {/* Input oculto para selección de archivos del sistema */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageFile(e.target.files[0]);
                    }
                  }}
                />

                {/* Si ya existe imagen cargada: Miniatura de previsualización con subir y eliminar */}
                {formData.image_url ? (
                  <div className="p-3.5 bg-white border border-[#E2DCD3] rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] overflow-hidden shrink-0 flex items-center justify-center relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image_url}
                          alt="Previsualización"
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                          }}
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-[#D4A359] animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1A1817] truncate">
                            {formData.image_url.split('/').pop() || 'Foto del repuesto'}
                          </span>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#3E7B44]/15 text-[#3E7B44] border border-[#3E7B44]/30">
                            WebP
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8C827A] truncate font-mono mt-0.5">
                          {formData.image_url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#E2DCD3] text-[#1A1817] text-xs font-bold border border-[#DCD6CC] transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Subir nueva foto"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Subir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        disabled={isUploadingImage}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Zona de carga amplia y visual (Dropzone) */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleImageFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#D4A359] bg-[#D4A359]/10 scale-[1.01]'
                        : 'border-[#D0C7BC] bg-[#FAF8F5] hover:bg-white hover:border-[#D4A359]'
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="py-2 flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-[#D4A359] animate-spin" />
                        <span className="text-xs font-bold text-[#1A1817]">
                          Optimizando y convirtiendo a WebP...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shadow-xs">
                          <UploadCloud className="w-6 h-6 text-[#D4A359]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1A1817]">
                            <span className="text-[#D4A359] underline decoration-[#D4A359]">Haz clic para buscar</span> o arrastra y suelta tu foto aquí
                          </p>
                          <p className="text-[11px] text-[#8C827A] mt-0.5">
                            Formatos web: .jpg, .jpeg, .png, .webp · Máximo 2 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Alerta de validación si excede 2 MB o formato inválido */}
                {imageError && (
                  <div className="mt-2 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{imageError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#1A1817] mb-1">Descripción Detallada</label>
                <textarea
                  rows={3}
                  placeholder="Información sobre compatibilidad de montaje y recomendaciones técnicas..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-[#E2DCD3] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-[#E2DCD3] text-[#5C5650] hover:bg-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black uppercase tracking-wider shadow-md"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Repuesto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] rounded-3xl p-6 max-w-sm w-full border border-[#E2DCD3] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-base text-[#1A1817]">¿Eliminar repuesto?</h3>
              <p className="text-xs text-[#5C5650] mt-1">
                Se eliminará permanentemente &quot;{productToDelete.name || productToDelete.title}&quot; (SKU: {productToDelete.sku}) de la base de datos.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="w-1/2 py-2.5 rounded-full border border-[#E2DCD3] text-[#5C5650] font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="w-1/2 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
