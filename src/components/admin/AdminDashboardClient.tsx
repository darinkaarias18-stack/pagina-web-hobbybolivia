'use client';

import React, { useState, useEffect } from 'react';
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
  Database,
  RefreshCw,
  Server,
  Activity
} from 'lucide-react';
import type { Product, Category, Policy } from '@/lib/types';

export function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  // MySQL Hosting Status State
  const [dbStatus, setDbStatus] = useState<{
    loading: boolean;
    syncing: boolean;
    connected: boolean;
    configured: boolean;
    host?: string;
    database?: string;
    latencyMs?: number;
    currentMode: string;
    message: string;
    tables?: string[];
    productCount?: number;
  }>({
    loading: true,
    syncing: false,
    connected: false,
    configured: false,
    currentMode: 'LOCAL_REACTIVE_FALLBACK',
    message: 'Comprobando estado de conexión con MySQL del hosting...'
  });

  // Active Tab: 'products' | 'policies'
  const [activeTab, setActiveTab] = useState<'products' | 'policies'>('products');

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
    old_price: '',
    stock: '',
    badge: '' as any,
    image_url: '',
    brand: 'Dubro',
    description: ''
  });

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

  // Check MySQL Hosting Connection Status
  const checkDbStatus = async () => {
    try {
      setDbStatus(prev => ({ ...prev, loading: true }));
      const res = await fetch('/api/db-setup', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setDbStatus({
          loading: false,
          syncing: false,
          connected: Boolean(data.mysql?.connected),
          configured: Boolean(data.mysql?.configured),
          host: data.mysql?.host || 'No configurado',
          database: data.mysql?.database || 'Local Store',
          latencyMs: data.mysql?.latencyMs,
          currentMode: data.currentMode,
          message: data.message,
          tables: data.mysql?.tables || [],
          productCount: data.mysql?.productCount ?? data.localFallback?.productsCount
        });
      }
    } catch {
      setDbStatus(prev => ({
        ...prev,
        loading: false,
        message: 'No se pudo verificar el diagnóstico de MySQL.'
      }));
    }
  };

  // Trigger Table Sync on Hosting
  const handleSyncHostingTables = async () => {
    try {
      setDbStatus(prev => ({ ...prev, syncing: true }));
      const res = await fetch('/api/db-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSeed: true })
      });
      const data = await res.json();
      if (data.success) {
        showToast("¡Tablas inicializadas y sincronizadas en el MySQL de tu Hosting!");
        await checkDbStatus();
        await fetchData();
      } else {
        showToast(data.message || "Error al sincronizar tablas", "error");
      }
    } catch (err) {
      showToast("Error de red al conectar con el endpoint de setup", "error");
    } finally {
      setDbStatus(prev => ({ ...prev, syncing: false }));
    }
  };

  // Load Data from APIs
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, polRes] = await Promise.all([
        fetch('/api/products?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/policies?t=' + Date.now(), { cache: 'no-store' })
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const polData = await polRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
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
    checkDbStatus();
    fetchData();
  }, []);

  // Inline Fast Update (Price or Stock)
  const handleInlineUpdate = async (id: number, field: 'price' | 'stock', value: number) => {
    setInlineLoadingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
        );
        showToast(`${field === 'price' ? 'Precio' : 'Stock'} actualizado`);
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
    setFormData({
      sku: `HB-${(products.length + 1).toString().padStart(4, '0')}`,
      name: '',
      categoryId: categories[0]?.id || 1,
      scale: 'RC Estándar',
      material: 'Aluminio CNC / Latón',
      specs_line: '',
      compatible_models: '',
      price: '',
      old_price: '',
      stock: '15',
      badge: '',
      image_url: 'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp',
      brand: 'Dubro',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      name: product.name || product.title || '',
      categoryId: product.category_id || product.categoryId || 1,
      scale: product.scale || 'RC Estándar',
      material: product.material || 'Aluminio CNC / Latón',
      specs_line: product.specs_line || '',
      compatible_models: product.compatible_models || '',
      price: String(product.price || ''),
      old_price: product.old_price ? String(product.old_price) : '',
      stock: String(product.stock !== undefined ? product.stock : (product.stockQuantity || 0)),
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

    const payload = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category_id: Number(formData.categoryId),
      categoryId: Number(formData.categoryId),
      scale: formData.scale,
      material: formData.material,
      specs_line: formData.specs_line.trim(),
      compatible_models: formData.compatible_models.trim(),
      price: parseFloat(formData.price) || 0,
      old_price: formData.old_price ? parseFloat(formData.old_price) : undefined,
      stock: parseInt(formData.stock, 10) || 0,
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

  // Metrics
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.stock || p.stockQuantity || 0) < 5).length;
  const activeCategoriesCount = categories.length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.stock || p.stockQuantity || 0)), 0);

  // Filtered Products
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

      {/* TOP BANNER: ESTADO DE CONEXIÓN MYSQL DEL HOSTING */}
      <div className="bg-[#161311] text-[#FAF8F5] rounded-3xl p-5 sm:p-6 border border-[#2D2622] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              dbStatus.connected
                ? 'bg-[#3E7B44]/20 border-[#3E7B44] text-[#78C47F]'
                : 'bg-[#211E1C] border-[#D4A359]/40 text-[#D4A359]'
            }`}>
              <Database className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  dbStatus.connected
                    ? 'bg-[#3E7B44] text-white'
                    : 'bg-[#211E1C] text-[#D4A359] border border-[#D4A359]/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-white animate-pulse' : 'bg-[#F85606]'}`} />
                  {dbStatus.connected ? 'MySQL Hosting Conectado' : 'Modo Almacenamiento Local Reactivo'}
                </span>

                {dbStatus.latencyMs !== undefined && (
                  <span className="text-[11px] font-mono text-[#D4A359]">
                    Latencia: {dbStatus.latencyMs}ms
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-black text-[#FAF8F5] mt-1.5 tracking-tight">
                Servidor MySQL: <span className="text-[#D4A359] font-mono">{dbStatus.host || 'Local (.data/db.json)'}</span> • BD: <span className="text-[#D4A359] font-mono">{dbStatus.database}</span>
              </h3>

              <p className="text-xs text-[#A89F91] mt-0.5 max-w-2xl">
                {dbStatus.message}
              </p>
            </div>
          </div>

          {/* Action Buttons for Hosting DB */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
            <button
              onClick={checkDbStatus}
              disabled={dbStatus.loading}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#211E1C] hover:bg-[#2E2A27] text-[#FAF8F5] font-bold text-xs uppercase tracking-wider border border-[#D4A359]/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#D4A359] ${dbStatus.loading ? 'animate-spin' : ''}`} />
              <span>Probar Conexión</span>
            </button>

            <button
              onClick={handleSyncHostingTables}
              disabled={dbStatus.syncing}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              <Server className="w-3.5 h-3.5 text-[#161311]" />
              <span>{dbStatus.syncing ? 'Sincronizando...' : 'Sincronizar Tablas en el Hosting'}</span>
            </button>
          </div>

        </div>
      </div>

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

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>

          <button
            onClick={openCreateModal}
            type="button"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#C69755] text-[#161311] font-black text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#161311]" />
            <span>Agregar Repuesto</span>
          </button>
        </div>
      </div>

      {/* 1. Dashboard de Métricas en Warm Tech */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Productos */}
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

        {/* Bajo Stock */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            lowStockCount > 0 ? 'bg-[#F85606]/15 border-[#F85606]/30 text-[#F85606]' : 'bg-[#3E7B44]/15 border-[#3E7B44]/30 text-[#3E7B44]'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
              Bajo Stock (&lt; 5 unid.)
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">
              {lowStockCount}
            </p>
          </div>
        </div>

        {/* Categorías Activas */}
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

        {/* Valor Total del Inventario */}
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
                <span>Nuevo</span>
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
                    <th className="py-3.5 px-3">Categoría / Escala</th>
                    <th className="py-3.5 px-3">Precio (Bs.)</th>
                    <th className="py-3.5 px-3">Stock</th>
                    <th className="py-3.5 px-3">Badge</th>
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
                          {p.sku}
                        </td>

                        {/* Category & Scale */}
                        <td className="py-3 px-3 text-[#5C5650] whitespace-nowrap">
                          <span className="block font-bold text-[#1A1817]">{catName}</span>
                          <span className="text-[10px] text-[#8C827A]">{p.scale || 'RC Estándar'}</span>
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

                        {/* Fast Inline Edit: Stock */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              defaultValue={p.stock !== undefined ? p.stock : (p.stockQuantity || 0)}
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

                        {/* Badge */}
                        <td className="py-3 px-3">
                          {p.badge ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#211E1C] text-[#D4A359] whitespace-nowrap border border-[#D4A359]/30">
                              {p.badge}
                            </span>
                          ) : (
                            <span className="text-[#8C827A] text-xs">-</span>
                          )}
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
                Se guardará inmediatamente vía endpoint <code>PUT /api/policies</code> en el Hosting MySQL y Local Store.
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
                  <label className="block font-bold text-[#1A1817] mb-1">SKU Oficial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. DUBQ3570"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block font-bold text-[#1A1817] mb-1">Stock Disponible *</label>
                  <input
                    type="number"
                    required
                    placeholder="15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Escala</label>
                  <select
                    value={formData.scale}
                    onChange={(e) => setFormData({ ...formData, scale: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                  >
                    <option value="RC Estándar">RC Estándar</option>
                    <option value="Micro">Micro / 1:32</option>
                    <option value="1:10">1:10</option>
                    <option value="1:48">1:48</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Material</label>
                  <input
                    type="text"
                    placeholder="Ej. Aluminio CNC / Latón"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                  >
                    <option value="">Sin Badge</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Popular">Popular</option>
                    <option value="Pocas Unidades">Pocas Unidades</option>
                    <option value="Oferta">Oferta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1817] mb-1">Línea de Especificaciones Técnicas *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs"
                  value={formData.specs_line}
                  onChange={(e) => setFormData({ ...formData, specs_line: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1817] mb-1">URL de la Imagen * (Conserva rutas originales)</label>
                <input
                  type="text"
                  required
                  placeholder="https://hobbybolivia.com/media/products/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-mono text-[11px]"
                />
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
