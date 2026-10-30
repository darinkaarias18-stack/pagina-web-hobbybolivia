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
  ExternalLink,
  Coins,
  RefreshCw,
  UploadCloud,
  Loader2,
  Boxes,
  Eye,
  EyeOff,
  Plane,
  X,
  CheckCircle2
} from 'lucide-react';
import type { Product, Category } from '@/lib/types';

export function AdminProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Exchange Rate State in Dashboard
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [lastUpdatedStr, setLastUpdatedStr] = useState<string>('');
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);

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

  // Comprimir imagen automáticamente en el navegador a WebP (máx. 1000px y <= 250 KB)
  const compressImageClientSide = (file: File, maxBytes = 250 * 1024): Promise<File> => {
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
        const maxDim = 1000; // Máximo 1000px manteniendo proporción

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

        let quality = 0.82;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              if (blob.size <= maxBytes || quality <= 0.40) {
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                const compressedFile = new File([blob], `${baseName}.webp`, {
                  type: 'image/webp',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                quality -= 0.10;
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

    // 1. Validación de tamaño original: si supera 10 MB, rechazar inmediatamente
    const MAX_RAW_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_RAW_SIZE) {
      const msg = "El archivo original es demasiado pesado para procesar (máximo 10 MB).";
      setImageError(msg);
      showToast(msg, "error");
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
      // 3. Pre-procesamiento de compresión interna automática (máx 1000px y <= 250 KB)
      const MAX_TARGET_BYTES = 250 * 1024; // 250 KB
      const processedFile = await compressImageClientSide(file, MAX_TARGET_BYTES);

      const uploadFormData = new FormData();
      uploadFormData.append('file', processedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const data = await res.json();
      if (data.success && data.url) {
        const finalKb = data.optimizedSize ? Math.round(data.optimizedSize / 1024) : Math.round(processedFile.size / 1024);
        // Regla de base de datos: guardamos la ruta relativa de texto (ej. /uploads/products/xxx.webp), nunca BLOB
        setFormData(prev => ({ ...prev, image_url: data.url }));
        showToast(`Foto optimizada a WebP: ${finalKb} KB (≤ 250 KB)`);
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
        const r = Number(rateData.data.exchangeRate) || 6.96;
        setExchangeRate(r);
        setAutoUpdate(rateData.data.autoUpdate !== false);

        const raw = rateData.data.lastChecked || rateData.data.updatedAt;
        const d = raw ? new Date(raw) : new Date();
        const dStr = d.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        const tStr = d.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
        setLastUpdatedStr(`${dStr} ${tStr}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Error al sincronizar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshExchangeRate = async () => {
    setIsRefreshingRate(true);
    try {
      const res = await fetch(`/api/exchange-rate?refresh=true&t=${Date.now()}`, {
        cache: 'no-store'
      });
      const json = await res.json();
      if (json.success && json.data) {
        const newRate = Number(json.data.exchangeRate) || 6.96;
        setExchangeRate(newRate);
        setAutoUpdate(json.data.autoUpdate !== false);

        const now = new Date();
        const fullTimestamp = `${now.toLocaleDateString('es-BO', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })} ${now.toLocaleTimeString('es-BO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}`;
        setLastUpdatedStr(fullTimestamp);

        fetch('/api/products?includeInactive=true&t=' + Date.now(), { cache: 'no-store' })
          .then(r => r.json())
          .then(d => {
            if (d.success) setProducts(d.data);
          })
          .catch(() => {});

        showToast(`Tipo de cambio actualizado: 1 USD = Bs. ${newRate.toFixed(2)} (${fullTimestamp})`);
      } else {
        showToast(json.error || 'No se pudo actualizar el tipo de cambio', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar el tipo de cambio', 'error');
    } finally {
      setIsRefreshingRate(false);
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
      old_price: String(product.old_price || (product as any).oldPrice || ''),
      stock: String(product.stock !== undefined ? product.stock : (product.stockQuantity || '')),
      badge: product.badge || '',
      image_url: product.image_url || (product.images && product.images[0]) || '',
      brand: product.brand || 'Dubro',
      description: product.description || ''
    });

    const num = parseFloat(String(product.price || ''));
    const rate = exchangeRate > 0 ? exchangeRate : 11.84;
    if (!isNaN(num) && num > 0) {
      setUsdPriceInput((num / rate).toFixed(2));
    } else {
      setUsdPriceInput('');
    }

    setIsModalOpen(true);
  };

  // Submit Modal Form (Create / Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("El nombre del producto es obligatorio", "error");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showToast("Ingresa un precio válido en Bolivianos", "error");
      return;
    }

    const payload = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category_id: formData.categoryId,
      scale: formData.scale,
      material: formData.material,
      specs_line: formData.specs_line,
      compatible_models: formData.compatible_models,
      price: parseFloat(formData.price),
      currency: formData.currency,
      display_currency: formData.currency,
      old_price: formData.old_price ? parseFloat(formData.old_price) : null,
      stock: parseInt(formData.stock || '0', 10),
      badge: formData.badge || null,
      image_url: formData.image_url || '/images/placeholder.webp',
      images: [formData.image_url || '/images/placeholder.webp'],
      brand: formData.brand.trim() || 'Dubro',
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
          showToast("Producto creado exitosamente");
          setIsModalOpen(false);
          fetchData();
        } else {
          showToast(data.error || "Error al crear", "error");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Error de red", "error");
    }
  };

  // Confirm Delete
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showToast("Producto eliminado del inventario");
        setProductToDelete(null);
        fetchData();
      } else {
        showToast(data.error || "No se pudo eliminar el producto", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de red al eliminar", "error");
    }
  };

  // Available Brands list for filter & datalist
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        categoryFilter === 'all' ||
        String(p.category_id || p.categoryId) === String(categoryFilter);

      const matchesBrand =
        brandFilter === 'all' ||
        p.brand?.toLowerCase() === brandFilter.toLowerCase();

      return matchesSearch && matchesCat && matchesBrand;
    });
  }, [products, searchTerm, categoryFilter, brandFilter]);

  // Computed Metrics
  const totalProducts = products.length;
  const activeCategoriesCount = categories.length;
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock !== undefined ? p.stock : (p.stockQuantity || 0)), 0);
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => {
      const qty = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
      return acc + (Number(p.price) || 0) * qty;
    }, 0);
  }, [products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => {
      const s = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
      return s < 5;
    }).length;
  }, [products]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success'
              ? 'bg-[#161311] text-[#D4A359] border-[#D4A359]/40'
              : 'bg-red-950 text-red-200 border-red-800'
          }`}
        >
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
              Panel de Control · Catálogo & Inventario
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Productos y Stock
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Currency Status (Botón interactivo para actualizar con fecha y hora de última actualización) */}
          <button
            type="button"
            onClick={handleRefreshExchangeRate}
            disabled={isRefreshingRate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#FAF8F5] hover:bg-white active:scale-[0.98] text-[#1A1817] font-bold text-xs border border-[#E2DCD3] hover:border-[#D4A359] shadow-xs transition-all cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed select-none"
            title={`Clic para actualizar el tipo de cambio oficial ahora. Última actualización: ${lastUpdatedStr || 'reciente'}`}
          >
            {isRefreshingRate ? (
              <Loader2 className="w-4 h-4 text-[#D4A359] animate-spin shrink-0" />
            ) : (
              <Coins className="w-4 h-4 text-[#D4A359] shrink-0 group-hover:scale-110 transition-transform" />
            )}
            <span>
              TC Oficial{lastUpdatedStr ? ` (${lastUpdatedStr})` : ''}:
            </span>
            <span className="font-mono font-black text-[#1A1817]">
              Bs. {exchangeRate.toFixed(2)}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] font-mono font-bold">
              {autoUpdate ? 'Auto' : 'Manual'}
            </span>
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#D4A359] transition-colors shrink-0 ${
                isRefreshingRate ? 'animate-spin text-[#D4A359]' : 'group-hover:rotate-180 transition-transform duration-500'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D4A359] hover:text-[#161311]" />
            <span>Nuevo Producto</span>
          </button>

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

      {/* 1. Dashboard de Métricas de Inventario en Warm Tech */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Productos */}
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

        {/* 2. Categorías */}
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

        {/* 3. Valor Total del Inventario */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shrink-0 border border-[#D4A359]/30">
            <span className="text-lg font-black text-[#D4A359]">Bs.</span>
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

        {/* 4. Total Stock */}
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
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-[#D4A359]/20 text-[#8A6220] border border-[#D4A359]/40">
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
        {/* Controls: Search, Category & Brand filter */}
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
                  <th className="py-3 px-2 text-center">Stock</th>
                  <th className="py-3 px-2 text-center">Visibilidad</th>
                  <th className="py-3 px-3 text-right rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2DCD3]">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#D4A359] animate-spin" />
                        <span className="text-xs text-[#8C827A] font-semibold">Cargando catálogo de productos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#8C827A]">
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
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

                        {/* Precio (Bs.) */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-[#1A1817]">
                            {Number(p.price).toFixed(2)}
                          </span>
                        </td>

                        {/* Precio USD */}
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-[#1A1817]">
                            {(exchangeRate > 0 ? (p.price / exchangeRate) : 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Stock */}
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E2DCD3] max-h-[94vh] flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E2DCD3] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359] shadow-xs">
                  <Plane className="w-4 h-4 -rotate-45 text-[#D4A359]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A359] block">
                    Catálogo Oficial Hobby Bolivia
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-[#1A1817] uppercase tracking-tight leading-tight">
                    {editingProduct ? 'Editar Repuesto Aeronáutico' : 'Agregar Nuevo Repuesto'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
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

              {/* Layout Principal en 2 Columnas: Izquierda Imagen Grande | Derecha Datos del Repuesto */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUMNA IZQUIERDA (5/12): FOTO DEL REPUESTO EN FORMATO GRANDE */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-[#1A1817] text-xs uppercase tracking-wider">
                      Foto del Repuesto / Producto *
                    </label>
                    <span className="text-[10px] font-bold text-[#8C827A]">
                      Vista Previa Oficial
                    </span>
                  </div>

                  {formData.image_url ? (
                    <div className="bg-white border border-[#E2DCD3] rounded-2xl p-4 shadow-xs flex flex-col gap-3.5">
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
                        className={`w-full h-64 sm:h-72 rounded-xl bg-white border-2 transition-all flex items-center justify-center relative overflow-hidden cursor-pointer group ${isDragging
                          ? 'border-[#D4A359] bg-[#D4A359]/5'
                          : 'border-[#EBE5DB] hover:border-[#D4A359]'
                          }`}
                        title="Haz clic o arrastra una imagen aquí para cambiar la foto"
                      >
                        <img
                          src={formData.image_url}
                          alt={formData.name || 'Vista previa del repuesto'}
                          className="max-h-full max-w-full w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/placeholder.webp';
                          }}
                        />

                        {isUploadingImage && (
                          <div className="absolute inset-0 bg-[#161311]/70 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 text-white">
                            <Loader2 className="w-7 h-7 text-[#D4A359] animate-spin" />
                            <span className="text-xs font-bold">Optimizando imagen...</span>
                          </div>
                        )}
                      </div>

                      {/* Botones de Acción debajo de la imagen grande */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="py-2.5 px-3 rounded-xl bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                        >
                          <UploadCloud className="w-4 h-4 text-[#D4A359] group-hover:text-[#161311]" />
                          <span>Cambiar Foto</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                          disabled={isUploadingImage}
                          className="py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-black uppercase tracking-wider border border-red-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone grande cuando no hay imagen */
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
                      className={`w-full h-72 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${isDragging
                        ? 'border-[#D4A359] bg-[#D4A359]/10 scale-[1.01]'
                        : 'border-[#D0C7BC] bg-white hover:border-[#D4A359]'
                        }`}
                    >
                      {isUploadingImage ? (
                        <div className="py-2 flex flex-col items-center gap-2.5">
                          <Loader2 className="w-9 h-9 text-[#D4A359] animate-spin" />
                          <span className="text-xs font-bold text-[#1A1817]">
                            Comprimiendo y optimizando foto a WebP (≤ 250 KB)...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shadow-sm border border-[#D4A359]/40">
                            <UploadCloud className="w-7 h-7 text-[#D4A359]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-black text-[#1A1817]">
                              Haz clic para subir o arrastra la foto aquí
                            </p>
                            <p className="text-[11px] text-[#8C827A]">
                              JPG, PNG o WebP (compresión automática WebP ≤ 250 KB, máx. 1000px)
                            </p>
                          </div>
                          <span className="mt-1 px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3] text-[#1A1817] font-bold text-xs">
                            Seleccionar Archivo
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {imageError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                      <span>{imageError}</span>
                    </div>
                  )}
                </div>

                {/* COLUMNA DERECHA (7/12): INFORMACIÓN TÉCNICA, PRECIOS Y DESCRIPCIÓN */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Fila 1: Nombre del Repuesto + SKU Oficial */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-8">
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Nombre del Repuesto *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Conectores E/Z Dubro (12)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] font-semibold focus:border-[#D4A359] outline-none shadow-2xs"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px]">
                          SKU Oficial
                        </label>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] uppercase font-mono">
                          Sistema
                        </span>
                      </div>
                      <input
                        type="text"
                        readOnly
                        value={formData.sku}
                        className="w-full px-3.5 py-2.5 bg-[#EFEAE2] border border-[#DCD6CC] rounded-xl outline-none font-mono font-black uppercase tracking-wider text-[#1A1817] cursor-not-allowed select-none"
                        title="Código oficial generado automáticamente por el sistema."
                      />
                    </div>
                  </div>

                  {/* Fila 2: Categoría, Marca y Stock Disponible */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-5">
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Categoría *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({ ...formData, categoryId: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-semibold text-xs text-[#1A1817] shadow-2xs cursor-pointer"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Marca *
                      </label>
                      <input
                        type="text"
                        list="brands-datalist"
                        placeholder="Ej. Dubro"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-semibold text-xs text-[#1A1817] shadow-2xs"
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

                    <div className="sm:col-span-3">
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Stock Disponible
                      </label>
                      <input
                        type="number"
                        placeholder="15"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-mono font-bold text-xs text-[#1A1817] shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Fila 3: Bloque de Precios y Moneda */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E2DCD3] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                        Configuración de Precio y Moneda
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#5C5650]">
                        TC: 1 USD = Bs. {exchangeRate.toFixed(2)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-end">
                      <div>
                        <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                          Precio en Bs. *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#8C827A] pointer-events-none">
                            Bs.
                          </span>
                          <input
                            type="number"
                            step="0.5"
                            required
                            placeholder="220.00"
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
                            className="w-full pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl focus:bg-white focus:border-[#D4A359] outline-none font-mono font-bold text-xs text-[#1A1817]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                          Precio en USD
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#8C827A] pointer-events-none">
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
                            className="w-full pl-7 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl focus:bg-white focus:border-[#D4A359] outline-none font-mono font-bold text-xs text-[#1A1817]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fila 4: Línea de Especificaciones Técnicas */}
                  <div>
                    <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                      Línea de Especificaciones Técnicas{' '}
                      <span className="text-[#8C827A] font-semibold normal-case text-[11px]">
                        (Opcional)
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Paso Alambre hasta 2mm | Prisionero Allen | 12 Pcs"
                      value={formData.specs_line}
                      onChange={(e) => setFormData({ ...formData, specs_line: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-medium text-[#1A1817] shadow-2xs"
                    />
                  </div>

                  {/* Fila 5: Descripción Detallada */}
                  <div>
                    <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                      Descripción Detallada
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Información sobre compatibilidad de montaje y recomendaciones técnicas..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl focus:border-[#D4A359] outline-none font-medium text-[#1A1817] leading-relaxed shadow-2xs"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Pie del Modal */}
              <div className="pt-4 border-t border-[#E2DCD3] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-[#E2DCD3] bg-white text-[#5C5650] hover:text-[#1A1817] font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
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
