'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  CheckCircle2,
  Plane,
  Activity,
  Coins,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Boxes,
  Eye,
  EyeOff
} from 'lucide-react';
import type { Product, Category } from '@/lib/types';

export function AdminDashboardClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Exchange Rate State in Dashboard
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  // Inline Fast Editing state
  const [inlineLoadingId, setInlineLoadingId] = useState<number | null>(null);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [usdPriceInput, setUsdPriceInput] = useState<string>('');

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

  // Comprimir imagen automáticamente en el navegador si pesa más de 1 MB antes de enviarla
  const compressImageClientSide = (file: File, maxBytes = 1024 * 1024): Promise<File> => {
    return new Promise((resolve) => {
      if (file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxBytes || quality <= 0.35) {
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const compressedFile = new File([blob], `${baseName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                quality -= 0.12;
                tryCompress();
              }
            },
            'image/webp',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  const handleImageFile = async (file: File) => {
    setImageError(null);

    // 1. Formatos web permitidos: .jpg, .jpeg, .png, .webp
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
      // 2. Comprimir automáticamente a <= 1 MB antes de subir a la base de datos
      const MAX_DB_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB
      const processedFile = await compressImageClientSide(file, MAX_DB_IMAGE_SIZE);

      const uploadFormData = new FormData();
      uploadFormData.append('file', processedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (data.success && data.url) {
        const finalKb = data.optimizedSize ? Math.round(data.optimizedSize / 1024) : Math.round(processedFile.size / 1024);
        setFormData(prev => ({ ...prev, image_url: data.url }));
        showToast(`Imagen comprimida y optimizada (${finalKb} KB <= 1 MB)`);
      } else {
        setImageError(data.error || "Error al subir la imagen");
      }
    } catch (err: any) {
      setImageError(err?.message || "Error al conectar con el servidor de subidas");
    } finally {
      setIsUploadingImage(false);
    }
  };

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
      const [prodRes, catRes, rateRes] = await Promise.all([
        fetch('/api/products?includeInactive=true&t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' }),
        fetch('/api/exchange-rate?t=' + Date.now(), { cache: 'no-store' })
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();
      const rateData = await rateRes.json();

      if (prodData.success) setProducts(prodData.data);
      if (catData.success) setCategories(catData.data);
      if (rateData.success && rateData.data) {
        setExchangeRate(Number(rateData.data.exchangeRate) || 6.96);
        setAutoUpdate(rateData.data.autoUpdate !== false);
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

  // Inline Fast Update (Price, Stock, Currency or Visibility)
  const handleInlineUpdate = async (id: number, field: 'price' | 'stock' | 'currency' | 'is_active', value: any) => {
    setInlineLoadingId(id);
    try {
      const payload = field === 'currency'
        ? { currency: value, display_currency: value }
        : field === 'is_active'
          ? { is_active: Boolean(value), isActive: Boolean(value) }
          : { [field]: value };

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (
            p.id === id
              ? {
                ...p,
                [field]: value,
                ...(field === 'currency' ? { currency: value, display_currency: value } : {}),
                ...(field === 'is_active' ? { is_active: Boolean(value), isActive: Boolean(value) } : {})
              }
              : p
          ))
        );

        // Sincronizar en tiempo real con cualquier pestaña abierta de la tienda pública
        try {
          const channel = new BroadcastChannel('hb_catalog_channel');
          channel.postMessage({ type: 'PRODUCT_UPDATED', id, field, value });
          channel.close();
        } catch {
          // ignore
        }
        try {
          localStorage.setItem('hb_catalog_sync', JSON.stringify({ id, field, value, t: Date.now() }));
        } catch {
          // ignore
        }

        const msg = field === 'currency'
          ? `Repuesto configurado para mostrarse en ${value === 'USD' ? 'Dólares ($ USD)' : 'Bolivianos (Bs.)'}`
          : field === 'is_active'
            ? (value ? 'Producto marcado como VISIBLE en el catálogo público' : 'Producto marcado como NO VISIBLE (oculto en la tienda)')
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
    setUsdPriceInput('');
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
    const initialBs = product.price || 0;
    const rate = exchangeRate > 0 ? exchangeRate : 11.84;
    setUsdPriceInput(initialBs > 0 ? (initialBs / rate).toFixed(2) : '');
    setIsModalOpen(true);
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

  // Unique brands list for classification
  const availableBrands = useMemo(() => {
    const list = products.map(p => p.brand).filter((b): b is string => Boolean(b && b.trim()));
    return Array.from(new Set(list)).sort();
  }, [products]);

  // Filtered Products (Table Rows)
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      !term ||
      (p.name || p.title || '').toLowerCase().includes(term) ||
      (p.sku || '').toLowerCase().includes(term) ||
      (p.brand || '').toLowerCase().includes(term);

    const matchCategory =
      categoryFilter === 'all' ||
      (p.category_id || p.categoryId) === Number(categoryFilter);

    const matchBrand =
      brandFilter === 'all' ||
      (p.brand || 'Dubro').toLowerCase() === brandFilter.toLowerCase();

    return matchSearch && matchCategory && matchBrand;
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
    <div className="p-3 sm:p-5 lg:p-6 space-y-6 w-full mx-auto">

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}



      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Panel de Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión Integral Hobby Bolivia
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Currency Status (Solo informativo con fecha actual) */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF8F5] text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs select-none"
            title="Tipo de cambio oficial vigente a la fecha de hoy"
          >
            <Coins className="w-4 h-4 text-[#D4A359]" />
            <span>
              TC Oficial ({new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' })}):
            </span>
            <span className="font-mono font-black text-[#1A1817]">
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

      {/* Product Management (CRUD & Inline Editing) */}
      <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-3 pt-2">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#1A1817]">
          <Package className="w-4 h-4 text-[#D4A359]" />
          <span>Catálogo de Repuestos & Edición en Línea ({products.length})</span>
        </div>
      </div>

      <div className="space-y-4">

        {/* Controls: Search, Category & Brand filter (Sticky al bajar) */}
        <div className="sticky top-[45px] z-20 bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#E2DCD3] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Buscar por SKU, Nombre o Marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none"
            />
            <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold flex-1 sm:flex-initial"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-semibold flex-1 sm:flex-initial"
              title="Clasificar por Marca"
            >
              <option value="all">Todas las Marcas</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
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
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] shadow-sm overflow-x-auto xl:overflow-visible">
          <div className="w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-[113px] z-10 shadow-xs">
                <tr className="bg-[#211E1C] text-[#FAF8F5] uppercase text-[9.5px] font-black tracking-wider">
                  <th className="py-3 px-3 rounded-tl-2xl">SKU</th>
                  <th className="py-3 px-3">Producto / Repuesto</th>
                  <th className="py-3 px-2">Categoría</th>
                  <th className="py-3 px-2">Marca</th>
                  <th className="py-3 px-2 text-center">Precio (Bs.)</th>
                  <th className="py-3 px-2 text-center">Precio USD</th>
                  <th className="py-3 px-2 text-center">Mostrar en</th>
                  <th className="py-3 px-2 text-center">Stock</th>
                  <th className="py-3 px-2 text-center">Visibilidad</th>
                  <th className="py-3 px-3 text-right rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD3]">
                {filteredProducts.map((p) => {
                  const imgSrc = p.image_url || (p.images && p.images[0]) || "https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp";
                  const catName = categories.find(c => c.id === (p.category_id || p.categoryId))?.name || 'General';
                  const isVisible = p.is_active !== false && p.isActive !== false;

                  return (
                    <tr key={p.id} className={`hover:bg-white/80 transition-colors ${!isVisible ? 'bg-[#EFEAE2]/50 opacity-75' : ''}`}>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono font-bold text-[#D4A359] text-[11px] whitespace-nowrap">
                        {(p.sku && p.sku.startsWith('HB-')) ? p.sku : `HB-${p.id.toString().padStart(4, '0')}`}
                      </td>

                      {/* Name + Image (STRICT RULE: bg-white, object-contain) */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-white p-0.5 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                            <img
                              src={imgSrc}
                              alt={p.name || p.title}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-[#1A1817] text-xs block truncate max-w-[160px] xl:max-w-[220px]" title={p.name || p.title}>
                              {p.name || p.title}
                            </span>
                            <span className="text-[10px] text-[#5C5650] block truncate max-w-[160px] xl:max-w-[220px]">
                              {p.specs_line || p.material}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-2 text-[#5C5650]">
                        <span className="block font-bold text-[#1A1817] text-[11px] truncate max-w-[110px]" title={catName}>
                          {catName}
                        </span>
                      </td>

                      {/* Marca */}
                      <td className="py-2.5 px-2 whitespace-nowrap">
                        <span
                          onClick={() => setBrandFilter(brandFilter === (p.brand || 'Dubro') ? 'all' : (p.brand || 'Dubro'))}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md border font-bold text-[10px] shadow-2xs transition-all cursor-pointer ${brandFilter === (p.brand || 'Dubro')
                            ? 'bg-[#211E1C] text-[#D4A359] border-[#D4A359]'
                            : 'bg-white text-[#1A1817] border-[#E2DCD3] hover:border-[#D4A359]'
                            }`}
                          title={`Clic para filtrar solo repuestos de ${p.brand || 'Dubro'}`}
                        >
                          {p.brand || 'Dubro'}
                        </span>
                      </td>

                      {/* Precio (Bs.) - Solo número, no editable inline */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-[#1A1817]">
                          {Number(p.price).toFixed(2)}
                        </span>
                      </td>

                      {/* Precio USD - Solo número */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-[#1A1817]">
                          {(exchangeRate > 0 ? (p.price / exchangeRate) : 0).toFixed(2)}
                        </span>
                      </td>

                      {/* Opción de elegir si el producto se mostrará en Bs. o en USD */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="inline-flex items-center p-0.5 bg-white border border-[#E2DCD3] rounded-lg shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleInlineUpdate(p.id, 'currency', 'Bs.')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${(p.currency || 'Bs.') === 'Bs.'
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
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${p.currency === 'USD'
                              ? 'bg-[#128C7E] text-white shadow-xs'
                              : 'text-[#8C827A] hover:text-[#1A1817]'
                              }`}
                            title="Mostrar este producto en Dólares ($ USD) en el catálogo público"
                          >
                            USD
                          </button>
                        </div>
                      </td>

                      {/* Stock - Solo número */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 font-mono font-bold text-xs rounded-md ${(p.stock !== undefined ? p.stock : (p.stockQuantity || 0)) < 5
                            ? 'bg-[#F85606]/15 text-[#F85606] font-black'
                            : 'text-[#1A1817]'
                            }`}
                        >
                          {p.stock !== undefined ? p.stock : (p.stockQuantity || 0)}
                        </span>
                      </td>

                      {/* Visibilidad (Visible / No Visible) */}
                      <td className="py-2.5 px-2 text-center whitespace-nowrap">
                        <div className="inline-flex items-center p-0.5 bg-white border border-[#E2DCD3] rounded-lg shadow-2xs">
                          <button
                            type="button"
                            disabled={inlineLoadingId === p.id}
                            onClick={() => handleInlineUpdate(p.id, 'is_active', true)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${isVisible
                              ? 'bg-[#3E7B44] text-white shadow-xs'
                              : 'text-[#8C827A] hover:text-[#1A1817]'
                              }`}
                            title="Hacer visible este producto en el catálogo público"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Visible</span>
                          </button>
                          <button
                            type="button"
                            disabled={inlineLoadingId === p.id}
                            onClick={() => handleInlineUpdate(p.id, 'is_active', false)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black transition-all cursor-pointer ${!isVisible
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-[#8C827A] hover:text-[#1A1817]'
                              }`}
                            title="Ocultar este producto del catálogo público"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>No visible</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-[#5C5650] hover:text-[#1A1817] hover:bg-white transition-colors cursor-pointer"
                            title="Editar repuesto completo"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg text-[#8C827A] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Eliminar repuesto"
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

      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E2DCD3] max-h-[92vh] flex flex-col overflow-hidden"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Categoría *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-semibold text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Marca *</label>
                  <input
                    type="text"
                    list="brands-datalist"
                    placeholder="Ej. Dubro"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-semibold text-xs"
                    required
                  />
                  <datalist id="brands-datalist">
                    {availableBrands.map((b) => (
                      <option key={b} value={b} />
                    ))}
                    <option value="Dubro" />
                    <option value="Great Planes" />
                    <option value="APC Propellers" />
                    <option value="Hobbywing Tech" />
                    <option value="TowerPro" />
                    <option value="Tattu Gens Ace" />
                    <option value="E-flite" />
                    <option value="Futaba" />
                    <option value="Sunnysky" />
                    <option value="Spektrum RC" />
                    <option value="AcroFlight" />
                    <option value="AeroCarbon" />
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Precio en Bs. *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="220"
                    value={formData.price}
                    onChange={(e) => {
                      const newBs = e.target.value;
                      setFormData({ ...formData, price: newBs });
                      const num = parseFloat(newBs);
                      const rate = exchangeRate > 0 ? exchangeRate : 11.84;
                      if (!isNaN(num) && num > 0) {
                        setUsdPriceInput((num / rate).toFixed(2));
                      } else {
                        setUsdPriceInput('');
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">Precio en USD</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs text-[#8C827A] pointer-events-none">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="18.59"
                      value={usdPriceInput}
                      onChange={(e) => {
                        const newUsd = e.target.value;
                        setUsdPriceInput(newUsd);
                        const num = parseFloat(newUsd);
                        const rate = exchangeRate > 0 ? exchangeRate : 11.84;
                        if (!isNaN(num) && num > 0) {
                          setFormData({ ...formData, price: (num * rate).toFixed(1) });
                        } else if (newUsd === '') {
                          setFormData({ ...formData, price: '' });
                        }
                      }}
                      className="w-full pl-6 pr-2.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1817] mb-1">
                    Mostrar en Tienda *
                  </label>
                  <div className="flex items-center gap-1 p-1 bg-[#F2EDE4] border border-[#DCD6CC] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: 'Bs.' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all cursor-pointer ${(formData.currency || 'Bs.') === 'Bs.'
                        ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                        : 'text-[#5C5650] hover:text-[#1A1817]'
                        }`}
                    >
                      Bs.
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, currency: 'USD' })}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-black text-xs transition-all cursor-pointer ${formData.currency === 'USD'
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
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    placeholder="15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-bold text-xs"
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
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${isDragging
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
                            Formatos web: .jpg, .jpeg, .png, .webp
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
