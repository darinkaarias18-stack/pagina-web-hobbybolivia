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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import type { Product, Category } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

interface InlinePriceCellsProps {
  productId: number;
  currentPriceBob: number;
  currentPriceUsd?: number;
  isBsMode: boolean;
  exchangeRate: number;
  onSavePrice: (id: number, newPriceBob?: number, newPriceUsd?: number) => Promise<void>;
  isUpdating: boolean;
}

function InlinePriceCells({
  productId,
  currentPriceBob,
  currentPriceUsd,
  isBsMode,
  exchangeRate,
  onSavePrice,
  isUpdating
}: InlinePriceCellsProps) {
  const rate = exchangeRate > 0 ? exchangeRate : 6.96;
  const baseUsd = currentPriceUsd !== undefined && currentPriceUsd !== null && Number(currentPriceUsd) > 0
    ? Number(currentPriceUsd)
    : (currentPriceBob > 0 ? Number(currentPriceBob) / rate : 0);

  const calculatedBob = Number((baseUsd * rate).toFixed(2));

  // En modo USD: muestra el precio en USD.
  // En modo Bs: muestra el precio calculado de acuerdo al tipo de cambio oficial del dólar en ese momento.
  const displayVal = isBsMode
    ? calculatedBob.toFixed(2)
    : baseUsd.toFixed(2);

  const [inputVal, setInputVal] = useState<string>(displayVal);

  useEffect(() => {
    setInputVal(displayVal);
  }, [displayVal]);

  const resetInputs = () => {
    setInputVal(displayVal);
  };

  const commitPrice = async () => {
    const parsed = parseFloat(inputVal);
    if (isNaN(parsed) || parsed < 0) {
      resetInputs();
      return;
    }
    const currentNum = parseFloat(displayVal);
    if (Math.abs(parsed - currentNum) > 0.001) {
      if (isBsMode) {
        // En modo Bs: se guarda el monto en Bs. y se calcula el equivalente en USD según el tipo de cambio oficial
        const newUsd = Number((parsed / rate).toFixed(2));
        await onSavePrice(productId, parsed, newUsd);
      } else {
        // En modo USD: se guarda el monto en USD y se calcula el equivalente en Bs. según el tipo de cambio oficial
        const newBob = Number((parsed * rate).toFixed(2));
        await onSavePrice(productId, newBob, parsed);
      }
    }
  };

  return (
    <td className="py-3.5 px-3 text-center whitespace-nowrap min-w-[115px] border-b border-[#E2DCD3]/60 bg-white group-hover:bg-[#FAF8F5] transition-colors">
      <div className="relative inline-flex items-center">
        <span className="absolute left-2.5 text-[10px] font-black text-[#8A6220] pointer-events-none select-none">
          {isBsMode ? 'Bs.' : '$'}
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              resetInputs();
              e.currentTarget.blur();
            }
          }}
          disabled={isUpdating}
          className={`w-22 ${isBsMode ? 'pl-7' : 'pl-6'} pr-2 py-1.5 bg-[#FAF8F5] hover:bg-white focus:bg-white border border-[#E2DCD3] hover:border-[#D4A359] focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/20 rounded-xl text-center font-mono font-bold text-xs text-[#8A6220] outline-none transition-all shadow-2xs disabled:opacity-50`}
          title={`Editar precio en ${isBsMode ? 'Bs.' : 'USD ($)'} (presiona Enter o sal de la casilla para guardar)`}
        />
      </div>
    </td>
  );
}

interface InlineStockCellProps {
  productId: number;
  currentStock: number;
  onSaveStock: (id: number, newStock: number) => Promise<void>;
  isUpdating: boolean;
}

function InlineStockCell({
  productId,
  currentStock,
  onSaveStock,
  isUpdating
}: InlineStockCellProps) {
  const [stockInput, setStockInput] = useState<string>(String(currentStock ?? 0));

  useEffect(() => {
    setStockInput(String(currentStock ?? 0));
  }, [currentStock]);

  const commitStock = async () => {
    const parsed = parseInt(stockInput, 10);
    if (isNaN(parsed) || parsed < 0) {
      setStockInput(String(currentStock ?? 0));
      return;
    }
    if (parsed !== currentStock) {
      await onSaveStock(productId, parsed);
    }
  };

  const numVal = parseInt(stockInput, 10) || 0;
  const statusColor =
    numVal <= 0
      ? { bg: 'bg-rose-50 text-rose-800 border-rose-300 focus:border-rose-500', dot: 'bg-rose-500' }
      : numVal < 5
        ? { bg: 'bg-amber-50 text-amber-800 border-amber-300 focus:border-amber-500', dot: 'bg-amber-500' }
        : { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 focus:border-emerald-500', dot: 'bg-emerald-500' };

  return (
    <td className="py-3.5 px-3 text-center whitespace-nowrap min-w-[135px] border-b border-[#E2DCD3]/60 bg-white group-hover:bg-[#FAF8F5] transition-colors">
      <div className="inline-flex items-center gap-1.5 justify-center">
        <span className={`w-2 h-2 rounded-full ${statusColor.dot} shrink-0`} />
        <div className="relative inline-flex items-center">
          <input
            type="number"
            min="0"
            step="1"
            value={stockInput}
            onChange={(e) => setStockInput(e.target.value)}
            onBlur={commitStock}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setStockInput(String(currentStock ?? 0));
                e.currentTarget.blur();
              }
            }}
            disabled={isUpdating}
            className={`w-18 py-1.5 px-2 text-center font-mono font-black text-xs rounded-xl border focus:ring-2 focus:ring-[#D4A359]/20 outline-none transition-all shadow-2xs disabled:opacity-50 ${statusColor.bg}`}
            title="Editar stock disponible (escribe la cantidad y presiona Enter o haz clic fuera para guardar)"
          />
        </div>
        <span className="text-[11px] font-bold text-[#8C827A] select-none pointer-events-none">
          unid.
        </span>
      </div>
    </td>
  );
}

function getCategoryBadgeStyle(catId: number, name: string) {
  const lower = (name || '').toLowerCase();
  if (catId === 9 || lower.includes('combustible')) {
    return {
      bg: 'bg-amber-50 text-amber-900 border-amber-300/80',
      dot: 'bg-amber-500'
    };
  }
  if (catId === 10 || lower.includes('tanque')) {
    return {
      bg: 'bg-sky-50 text-sky-900 border-sky-300/80',
      dot: 'bg-sky-500'
    };
  }
  if (catId === 11 || lower.includes('servo')) {
    return {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300/80',
      dot: 'bg-emerald-500'
    };
  }
  if (catId === 13 || lower.includes('electrico') || lower.includes('eléctrico')) {
    return {
      bg: 'bg-teal-50 text-teal-900 border-teal-300/80',
      dot: 'bg-teal-500'
    };
  }
  if (catId === 14 || lower.includes('madera')) {
    return {
      bg: 'bg-amber-100/80 text-amber-950 border-amber-400/80',
      dot: 'bg-amber-700'
    };
  }
  if (catId === 15 || lower.includes('spinner')) {
    return {
      bg: 'bg-rose-50 text-rose-900 border-rose-300/80',
      dot: 'bg-rose-500'
    };
  }
  if (catId === 16 || lower.includes('construccion') || lower.includes('construcción')) {
    return {
      bg: 'bg-indigo-50 text-indigo-900 border-indigo-300/80',
      dot: 'bg-indigo-500'
    };
  }
  if (catId === 17 || lower.includes('rueda')) {
    return {
      bg: 'bg-cyan-50 text-cyan-900 border-cyan-300/80',
      dot: 'bg-cyan-500'
    };
  }
  if (catId === 18 || lower.includes('monokote')) {
    return {
      bg: 'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-300/80',
      dot: 'bg-fuchsia-500'
    };
  }
  if (catId === 12 || lower.includes('helice') || lower.includes('hélice')) {
    return {
      bg: 'bg-orange-50 text-orange-900 border-orange-300/80',
      dot: 'bg-orange-500'
    };
  }
  if (catId === 3 || lower.includes('motor')) {
    return {
      bg: 'bg-indigo-50 text-indigo-900 border-indigo-300/80',
      dot: 'bg-indigo-500'
    };
  }
  if (catId === 1 || lower.includes('conector')) {
    return {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300/80',
      dot: 'bg-emerald-500'
    };
  }
  if (catId === 2 || lower.includes('varillaje')) {
    return {
      bg: 'bg-purple-50 text-purple-900 border-purple-300/80',
      dot: 'bg-purple-500'
    };
  }
  return {
    bg: 'bg-[#FAF8F5] text-[#1A1817] border-[#E2DCD3]',
    dot: 'bg-[#D4A359]'
  };
}

export function AdminProductsClient() {
  const { isBsMode } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Exchange Rate State in Dashboard
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [lastUpdatedStr, setLastUpdatedStr] = useState<string>('');
  const [isRefreshingRate, setIsRefreshingRate] = useState<boolean>(false);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [customRateInput, setCustomRateInput] = useState<string>('');
  const [rateMode, setRateMode] = useState<'manual' | 'auto'>('auto');
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  // Inline Fast Editing state
  const [inlineLoadingId, setInlineLoadingId] = useState<number | null>(null);

  // Table horizontal drag-to-scroll with mouse cursor
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleTableMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, textarea')) return;
    if (!tableScrollRef.current) return;
    setIsDraggingTable(true);
    setDragStartX(e.pageX - tableScrollRef.current.offsetLeft);
    setDragScrollLeft(tableScrollRef.current.scrollLeft);
  };

  const handleTableMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTable || !tableScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tableScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleTableMouseUpOrLeave = () => {
    setIsDraggingTable(false);
  };

  const scrollTable = (offset: number) => {
    if (tableScrollRef.current) {
      tableScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

    // 0ms Vista previa instantánea para feedback visual inmediato
    const instantPreview = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, image_url: instantPreview }));

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
        // Guardamos la URL pública definitiva del servidor
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
          .catch(() => { });

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

  const handleSaveCustomRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customRateInput);
    if (isNaN(parsed) || parsed <= 0) {
      showToast('Por favor introduce un tipo de cambio válido mayor a 0', 'error');
      return;
    }

    setIsSavingRate(true);
    try {
      const res = await fetch('/api/exchange-rate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exchangeRate: parsed,
          autoUpdate: false,
          source: 'Manual (Administrador)'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const newRate = Number(data.data?.exchangeRate) || parsed;
        setExchangeRate(newRate);
        setAutoUpdate(false);

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

        if (typeof window !== 'undefined') {
          try {
            const channel = new BroadcastChannel('hb_catalog_channel');
            channel.postMessage({ type: 'RATE_UPDATED', exchangeRate: newRate });
            channel.close();
          } catch { }
          localStorage.setItem('hb_rate_sync', JSON.stringify({ rate: newRate, timestamp: Date.now() }));
        }

        showToast(`Tipo de cambio guardado: 1 USD = Bs. ${newRate.toFixed(2)}`);
        setIsRateModalOpen(false);

        fetch('/api/products?includeInactive=true&t=' + Date.now(), { cache: 'no-store' })
          .then(r => r.json())
          .then(d => { if (d.success) setProducts(d.data); })
          .catch(() => { });
      } else {
        showToast(data.error || 'Error al guardar el tipo de cambio', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al guardar el tipo de cambio', 'error');
    } finally {
      setIsSavingRate(false);
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
                ...(field === 'stock' ? { stock: Number(value), stockQuantity: Number(value) } : {}),
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
          ? `Producto configurado para mostrarse en ${value === 'USD' ? 'Dólares ($ USD)' : 'Bolivianos (Bs.)'}`
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

  // Inline Fast Price Update (Montos ingresados a criterio, sin cálculos automáticos de tipo de cambio)
  const handleInlinePriceUpdate = async (id: number, newBob?: number, newUsd?: number) => {
    setInlineLoadingId(id);
    try {
      const payload: any = {};
      if (newBob !== undefined) {
        payload.price = newBob;
      }
      if (newUsd !== undefined) {
        payload.priceUsd = newUsd;
        payload.price_usd = newUsd;
      }

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
                ...(newBob !== undefined ? { price: newBob } : {}),
                ...(newUsd !== undefined ? { priceUsd: newUsd, price_usd: newUsd } : {})
              }
              : p
          ))
        );

        try {
          const channel = new BroadcastChannel('hb_catalog_channel');
          channel.postMessage({ type: 'PRODUCT_UPDATED', id, field: 'price', value: newBob ?? newUsd });
          channel.close();
        } catch { }

        const text = newUsd !== undefined ? `$ ${newUsd.toFixed(2)} USD` : `Bs. ${Number(newBob).toFixed(2)}`;
        showToast(`Precio actualizado: ${text}`);
      } else {
        showToast(data.error || "Error al actualizar precio", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al actualizar precio", "error");
    } finally {
      setInlineLoadingId(null);
    }
  };

  // Inline Fast Stock Update
  const handleInlineStockUpdate = async (id: number, newStock: number) => {
    setInlineLoadingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev =>
          prev.map(p => (
            p.id === id
              ? {
                ...p,
                stock: newStock,
                stockQuantity: newStock
              }
              : p
          ))
        );

        try {
          const channel = new BroadcastChannel('hb_catalog_channel');
          channel.postMessage({ type: 'PRODUCT_UPDATED', id, field: 'stock', value: newStock });
          channel.close();
        } catch { }

        showToast(`Stock actualizado a ${newStock} unidades`);
      } else {
        showToast(data.error || "Error al actualizar stock", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error de conexión al actualizar stock", "error");
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
    const initialSku = product.sku || systemDefaultSku;
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

    const prodUsd = product.priceUsd !== undefined && product.priceUsd !== null
      ? Number(product.priceUsd)
      : (product.price_usd !== undefined && product.price_usd !== null
        ? Number(product.price_usd)
        : null);

    if (prodUsd !== null && !isNaN(prodUsd) && prodUsd > 0) {
      setUsdPriceInput(prodUsd.toFixed(2));
    } else {
      const num = parseFloat(String(product.price || ''));
      const rate = exchangeRate > 0 ? exchangeRate : 11.84;
      if (!isNaN(num) && num > 0) {
        setUsdPriceInput((num / rate).toFixed(2));
      } else {
        setUsdPriceInput('');
      }
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
    const parsedUsd = parseFloat(usdPriceInput);
    if (isNaN(parsedUsd) || parsedUsd <= 0) {
      showToast("Ingresa un precio válido en USD", "error");
      return;
    }

    const rate = exchangeRate > 0 ? exchangeRate : 11.84;
    const calculatedBob = Math.round(parsedUsd * rate * 100) / 100;

    const payload = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      category_id: formData.categoryId,
      scale: formData.scale,
      material: formData.material,
      specs_line: formData.specs_line,
      compatible_models: formData.compatible_models,
      price: calculatedBob,
      priceUsd: parsedUsd,
      price_usd: parsedUsd,
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

  // Filtered Products (Búsqueda multi-criterio: Código/SKU, Nombre, Precio USD/Bs., Stock, Marca y Categoría)
  const filteredProducts = useMemo(() => {
    const rawSearch = searchTerm.trim().toLowerCase();

    // Función auxiliar para normalizar texto removiendo tildes/acentos
    const normalizeText = (text: string) =>
      text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const normSearch = normalizeText(rawSearch);

    // Preparar búsqueda numérica limpia (soporta $8, 8 USD, Bs. 96, 8,00, etc.)
    const cleanNumeric = rawSearch
      .replace(/[$]|usd|bob|bs\.?|\s/gi, '')
      .replace(',', '.');
    const isNumericSearch = cleanNumeric.length > 0 && !isNaN(Number(cleanNumeric));
    const searchNumber = isNumericSearch ? Number(cleanNumeric) : null;

    // Detectar comandos rápidos de stock (ej. "stock: 5", "stock 5", "sin stock", "bajo stock")
    const isSinStock = normSearch === 'sin stock' || normSearch === 'agotado';
    const isConStock = normSearch === 'con stock' || normSearch === 'disponible';
    const isBajoStock = normSearch === 'bajo stock' || normSearch === 'stock bajo';

    let explicitStockFilter: number | null = null;
    const stockPrefixMatch = rawSearch.match(/^stock\s*[:=]?\s*(\d+)$/i);
    if (stockPrefixMatch) {
      explicitStockFilter = parseInt(stockPrefixMatch[1], 10);
    }

    return products.filter((p) => {
      // 1. Filtro de Categoría
      const matchesCat =
        categoryFilter === 'all' ||
        String(p.category_id || p.categoryId) === String(categoryFilter);

      // 2. Filtro de Marca
      const matchesBrand =
        brandFilter === 'all' ||
        p.brand?.toLowerCase() === brandFilter.toLowerCase();

      if (!matchesCat || !matchesBrand) return false;
      if (!rawSearch) return true;

      // 3. Extracción de valores del producto
      const sku = (p.sku || '').toLowerCase();
      const name = normalizeText(p.name || p.title || '');
      const brand = (p.brand || '').toLowerCase();

      const catId = p.category_id || p.categoryId || 1;
      const categoryName = normalizeText(p.category?.name || categories.find(c => c.id === catId)?.name || '');

      const stockQty = p.stock !== undefined ? p.stock : (p.stockQuantity !== undefined ? p.stockQuantity : 0);
      const stockStr = String(stockQty);

      const priceBob = Number(p.price) || 0;
      const priceUsd = p.priceUsd !== undefined && p.priceUsd !== null
        ? Number(p.priceUsd)
        : (p.price_usd !== undefined && p.price_usd !== null
          ? Number(p.price_usd)
          : (exchangeRate > 0 ? priceBob / exchangeRate : 0));

      const priceBobStr = priceBob.toFixed(2);
      const priceBobRound = priceBob.toString();
      const priceUsdStr = priceUsd.toFixed(2);
      const priceUsdRound = priceUsd.toString();

      // a) Comandos explícitos de stock
      if (explicitStockFilter !== null) {
        return stockQty === explicitStockFilter;
      }
      if (isSinStock) return stockQty === 0;
      if (isConStock) return stockQty > 0;
      if (isBajoStock) return stockQty > 0 && stockQty < 5;

      // b) Búsqueda por Código (SKU)
      const matchesSku =
        sku.includes(rawSearch) ||
        sku.replace(/[^a-z0-9]/g, '').includes(rawSearch.replace(/[^a-z0-9]/g, ''));

      // c) Búsqueda por Nombre
      const matchesName = name.includes(normSearch);

      // d) Búsqueda por Marca o Categoría
      const matchesBrandOrCat = brand.includes(rawSearch) || categoryName.includes(normSearch);

      // e) Búsqueda por Precio (USD o Bs.)
      let matchesPrice = false;
      if (isNumericSearch && cleanNumeric) {
        matchesPrice =
          priceUsdStr.includes(cleanNumeric) ||
          priceUsdRound.includes(cleanNumeric) ||
          priceBobStr.includes(cleanNumeric) ||
          priceBobRound.includes(cleanNumeric) ||
          (searchNumber !== null && Math.abs(priceUsd - searchNumber) < 0.01) ||
          (searchNumber !== null && Math.abs(priceBob - searchNumber) < 0.01);
      }

      // f) Búsqueda por Stock
      let matchesStock = false;
      if (stockStr === rawSearch || stockStr.includes(rawSearch)) {
        matchesStock = true;
      }
      if (isNumericSearch && searchNumber !== null && stockQty === searchNumber) {
        matchesStock = true;
      }

      return matchesSku || matchesName || matchesPrice || matchesStock || matchesBrandOrCat;
    });
  }, [products, searchTerm, categoryFilter, brandFilter, categories, exchangeRate]);

  // Computed Metrics
  const totalProducts = products.length;
  const activeCategoriesCount = categories.length;
  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock !== undefined ? p.stock : (p.stockQuantity || 0)), 0);
  }, [products]);

  const totalInventoryValueUsd = useMemo(() => {
    return products.reduce((acc, p) => {
      const qty = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
      const usd = p.priceUsd !== undefined && p.priceUsd !== null
        ? Number(p.priceUsd)
        : (p.price_usd !== undefined && p.price_usd !== null
          ? Number(p.price_usd)
          : (exchangeRate > 0 ? (Number(p.price) || 0) / exchangeRate : 0));
      return acc + usd * qty;
    }, 0);
  }, [products, exchangeRate]);

  const totalInventoryValueBob = useMemo(() => {
    return products.reduce((acc, p) => {
      const qty = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);
      const bob = p.price !== undefined && p.price !== null && Number(p.price) > 0
        ? Number(p.price)
        : (p.priceUsd !== undefined && p.priceUsd !== null ? Number(p.priceUsd) : 0);
      return acc + bob * qty;
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
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold animate-in slide-in-from-bottom-5 duration-200 ${toast.type === 'success'
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

        <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
          {/* 1. Botón Separado: TC Automático */}
          <div className="inline-flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-full border border-[#E2DCD3] shadow-xs shrink-0 max-w-full">
            <button
              type="button"
              onClick={handleRefreshExchangeRate}
              disabled={isRefreshingRate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white active:scale-[0.98] text-[#1A1817] font-bold text-[11px] sm:text-xs transition-all cursor-pointer group select-none"
              title={`Tipo de cambio automático. Clic para sincronizar con API oficial. Última actualización: ${lastUpdatedStr || 'reciente'}`}
            >
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D4A359] shrink-0 group-hover:scale-110 transition-transform" />
              <span className="whitespace-nowrap">
                TC: <strong className="font-mono text-[#1A1817]">Bs. {exchangeRate.toFixed(2)}</strong>
              </span>
              <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${autoUpdate ? 'bg-[#211E1C] text-[#D4A359]' : 'bg-[#E2DCD3] text-[#5C5650]'}`}>
                {autoUpdate ? 'Auto' : 'Off'}
              </span>
              <RefreshCw className={`w-3.5 h-3.5 text-[#8C827A] group-hover:text-[#D4A359] ml-0.5 ${isRefreshingRate ? 'animate-spin text-[#D4A359]' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>

          {/* 2. Botón Separado: TC Manual */}
          <button
            type="button"
            onClick={() => {
              setCustomRateInput(exchangeRate.toFixed(2));
              setRateMode('manual');
              setIsRateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#211E1C] hover:bg-[#D4A359] text-[#D4A359] hover:text-[#161311] border border-[#211E1C] hover:border-[#D4A359] text-[11px] sm:text-xs font-black transition-all cursor-pointer shadow-xs active:scale-[0.98] shrink-0 select-none group"
            title="Poner manualmente el valor de tipo de cambio de USD a Bs."
          >
            <Edit2 className="w-3.5 h-3.5 text-[#D4A359] group-hover:text-[#161311] transition-colors" />
            <span className="whitespace-nowrap">TC Manual</span>
            {!autoUpdate && (
              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold shrink-0">
                Activo
              </span>
            )}
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-[11px] sm:text-xs border border-[#E2DCD3] shadow-xs transition-colors whitespace-nowrap shrink-0"
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
            <span className="text-xl font-black text-[#D4A359]">{isBsMode ? 'Bs.' : '$'}</span>
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider">
              Valor Inventario {isBsMode ? '(Bs.)' : '(USD)'}
            </span>
            <p className="text-xl sm:text-2xl font-black text-[#1A1817] leading-tight">
              {isBsMode ? (
                <>Bs. {totalInventoryValueBob.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
              ) : (
                <>${totalInventoryValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-bold text-[#8C827A]">USD</span></>
              )}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DCD3] pb-3 pt-2">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-[#1A1817]">
          <Package className="w-4 h-4 text-[#D4A359]" />
          <span>Catálogo de Productos & Edición en Línea ({products.length})</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8C827A] bg-[#FAF8F5] px-2.5 py-1 rounded-xl border border-[#E2DCD3]">
            <span>↔️ Columnas deslizables</span>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E2DCD3]">
            <button
              type="button"
              onClick={() => scrollTable(-320)}
              className="p-1.5 rounded-lg bg-white hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] hover:border-[#211E1C] shadow-2xs transition-all cursor-pointer"
              title="Deslizar columnas a la izquierda"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTable(320)}
              className="p-1.5 rounded-lg bg-white hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] hover:border-[#211E1C] shadow-2xs transition-all cursor-pointer"
              title="Deslizar columnas a la derecha"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] text-[#8C827A] font-semibold">
            {filteredProducts.length} de {products.length} productos listados
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Controls: Search, Category & Brand filter (Estático, sin movimiento al deslizar barra vertical) */}
        <div className="bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#E2DCD3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
          <div className="relative flex-1 min-w-[200px] max-w-lg">
            <input
              type="text"
              placeholder="Buscar por código, nombre, precio (USD) o stock..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none shadow-2xs font-medium"
            />
            <Search className="w-4 h-4 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C827A] hover:text-[#1A1817] p-1 rounded-full cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="relative w-full sm:w-[190px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full text-xs py-2.5 pl-3.5 pr-8 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-bold cursor-pointer appearance-none shadow-2xs"
              >
                <option value="all">Todas las Categorías ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-[170px]">
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full text-xs py-2.5 pl-3.5 pr-8 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] focus:border-[#D4A359] outline-none font-bold cursor-pointer appearance-none shadow-2xs"
                title="Clasificar por Marca"
              >
                <option value="all">Todas las Marcas ({availableBrands.length})</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8C827A] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D4A359] hover:bg-[#C69755] active:scale-[0.98] text-[#161311] rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 text-[#161311]" />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        {/* Table Container with Mouse Drag & Freeze Columns */}
        <div className="w-full overflow-x-auto scrollbar-thin rounded-2xl border border-neutral-200 bg-white shadow-sm touch-pan-x">
          <div
            ref={tableScrollRef}
            onMouseDown={handleTableMouseDown}
            onMouseMove={handleTableMouseMove}
            onMouseUp={handleTableMouseUpOrLeave}
            onMouseLeave={handleTableMouseUpOrLeave}
            className={`w-full overflow-x-auto scrollbar-thin ${isDraggingTable ? 'cursor-grabbing select-none' : 'cursor-grab'
              }`}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#D4A359 #FAF8F5'
            }}
          >
            <table className="w-full text-left border-separate border-spacing-0 text-xs min-w-[1380px]">
              <thead className="bg-[#181615] text-[#FAF8F5] uppercase text-[10px] font-black tracking-wider">
                <tr>
                  {/* INMOVILIZADO 0: N° / ÍTEM */}
                  <th className="md:sticky md:left-0 z-30 bg-[#181615] text-[#FAF8F5] py-4 px-2 text-center whitespace-nowrap w-[55px] min-w-[55px] max-w-[55px] border-b border-[#E2DCD3]/60">
                    N°
                  </th>

                  {/* INMOVILIZADO 1: SKU / CÓDIGO */}
                  <th className="md:sticky md:left-[55px] z-30 bg-[#181615] text-[#FAF8F5] py-4 px-3.5 whitespace-nowrap w-[125px] min-w-[125px] max-w-[125px] border-b border-[#E2DCD3]/60 text-left">
                    SKU / CÓDIGO
                  </th>

                  {/* INMOVILIZADO 2: IMAGEN (Nueva columna después de SKU / CÓDIGO) */}
                  <th className="md:sticky md:left-[180px] z-30 bg-[#181615] text-[#FAF8F5] py-4 px-2 text-center whitespace-nowrap w-[75px] min-w-[75px] max-w-[75px] border-b border-[#E2DCD3]/60">
                    IMAGEN
                  </th>

                  {/* INMOVILIZADO 3: NOMBRE DEL PRODUCTO (solo nombre, ancho amplio sin truncar) */}
                  <th className="md:sticky md:left-[255px] z-30 bg-[#181615] text-[#FAF8F5] py-4 px-4 w-[350px] min-w-[320px] max-w-[420px] border-b border-[#E2DCD3]/60 md:border-r border-[#3A3530] md:shadow-[6px_0_15px_-4px_rgba(0,0,0,0.35)] text-left">
                    NOMBRE DEL PRODUCTO
                  </th>

                  {/* COLUMNAS DESLIZABLES */}
                  <th className="py-4 px-4 whitespace-nowrap min-w-[240px] border-b border-[#E2DCD3]/60 text-left">
                    CATEGORÍA ASIGNADA
                  </th>
                  <th className="py-4 px-3 text-center whitespace-nowrap min-w-[115px] border-b border-[#E2DCD3]/60">
                    {isBsMode ? 'PRECIO (BS.)' : 'PRECIO (USD)'}
                  </th>
                  <th className="py-4 px-3 text-center whitespace-nowrap min-w-[135px] border-b border-[#E2DCD3]/60">
                    STOCK DISPONIBLE ✏️
                  </th>
                  <th className="py-4 px-3 text-center whitespace-nowrap min-w-[150px] border-b border-[#E2DCD3]/60">
                    VISIBILIDAD
                  </th>
                  <th className="py-4 px-4 text-center rounded-tr-2xl whitespace-nowrap min-w-[160px] border-b border-[#E2DCD3]/60">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center border-b border-[#E2DCD3]/60">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#D4A359] animate-spin" />
                        <span className="text-xs text-[#8C827A] font-semibold">Cargando catálogo de productos...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[#8C827A] border-b border-[#E2DCD3]/60">
                      No se encontraron productos con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p, index) => {
                    const catId = p.category_id || p.categoryId || 1;
                    const assignedCategoryName = p.category?.name || categories.find(c => c.id === catId)?.name || 'General';
                    const badgeStyle = getCategoryBadgeStyle(catId, assignedCategoryName);
                    const isVisible = p.is_active !== false && p.isActive !== false;
                    const stockQty = p.stock !== undefined ? p.stock : (p.stockQuantity || 0);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#FAF8F5]/80 transition-colors group ${!isVisible ? 'bg-[#FAF8F5]/40 opacity-75' : ''
                          }`}
                      >
                        {/* INMOVILIZADO 0: N° / ÍTEM */}
                        <td className={`md:sticky md:left-0 z-20 w-[55px] min-w-[55px] max-w-[55px] py-4 px-2 text-center font-mono whitespace-nowrap border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5] group-hover:bg-[#F3EFEA]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <span className="font-mono text-[11px] font-bold text-[#8C827A] bg-[#FAF8F5] border border-[#E2DCD3] px-2 py-1 rounded-lg group-hover:border-[#D4A359] group-hover:text-[#1A1817] group-hover:bg-white transition-all shadow-2xs inline-block text-center min-w-[28px]">
                            {index + 1}
                          </span>
                        </td>

                        {/* INMOVILIZADO 1: SKU / CÓDIGO */}
                        <td className={`md:sticky md:left-[55px] z-20 w-[125px] min-w-[125px] max-w-[125px] py-4 px-3.5 font-mono whitespace-nowrap border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5] group-hover:bg-[#F3EFEA]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <span className="font-mono font-black text-xs text-[#1A1817] bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-[#D5CEC4] group-hover:border-[#D4A359] group-hover:bg-white transition-all inline-flex items-center gap-1.5 tracking-wider shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A359] shrink-0" />
                            {p.sku || `HB-${p.id.toString().padStart(4, '0')}`}
                          </span>
                        </td>

                        {/* INMOVILIZADO 2: IMAGEN (Después de SKU / CÓDIGO) */}
                        <td className={`md:sticky md:left-[180px] z-20 w-[75px] min-w-[75px] max-w-[75px] py-3 px-2 text-center border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5] group-hover:bg-[#F3EFEA]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          {p.image_url || p.imageUrl || (p.images && p.images[0]) ? (
                            <div className="w-11 h-11 rounded-xl bg-white p-0.5 border border-[#E2DCD3] flex items-center justify-center mx-auto shadow-2xs group-hover:border-[#D4A359]/60 group-hover:shadow-xs transition-all overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={p.image_url || p.imageUrl || (p.images && p.images[0]) || ''}
                                alt={p.name || p.title}
                                loading="lazy"
                                decoding="async"
                                className="max-h-full max-w-full object-contain pointer-events-none select-none"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : (
                            <div
                              className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-dashed border-[#D5CEC4] flex flex-col items-center justify-center text-[#8C827A] mx-auto group-hover:border-[#D4A359]/60 transition-colors"
                              title="Sin fotografía asignada"
                            >
                              <ImageIcon className="w-4 h-4 text-[#8C827A]/50 group-hover:text-[#D4A359] transition-colors" />
                            </div>
                          )}
                        </td>

                        {/* INMOVILIZADO 3: NOMBRE DEL PRODUCTO (solo nombre, visible completo sin truncar) */}
                        <td className={`md:sticky md:left-[255px] z-20 w-[350px] min-w-[320px] max-w-[420px] py-4 px-4 border-b border-[#E2DCD3]/60 md:border-r border-[#E2DCD3] md:shadow-[6px_0_15px_-4px_rgba(0,0,0,0.08)] transition-colors ${!isVisible ? 'bg-[#FAF8F5] group-hover:bg-[#F3EFEA]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <span
                            className="font-black text-xs sm:text-[13px] text-[#1A1817] leading-relaxed group-hover:text-[#D4A359] transition-colors block break-words"
                            title={p.name || p.title}
                          >
                            {p.name || p.title}
                          </span>
                        </td>

                        {/* COLUMNAS DESLIZABLES */}
                        {/* CATEGORÍA ASIGNADA */}
                        <td className={`py-4 px-4 whitespace-nowrap border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5]/60 group-hover:bg-[#FAF8F5]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <span
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black border shadow-2xs ${badgeStyle.bg}`}
                            title={`Categoría: ${assignedCategoryName}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${badgeStyle.dot} shrink-0`} />
                            <span>{assignedCategoryName}</span>
                          </span>
                        </td>

                        {/* Precios Editables Inline */}
                        <InlinePriceCells
                          productId={p.id}
                          currentPriceBob={Number(p.price) || 0}
                          currentPriceUsd={p.priceUsd !== undefined && p.priceUsd !== null ? Number(p.priceUsd) : (p.price_usd !== undefined && p.price_usd !== null ? Number(p.price_usd) : undefined)}
                          isBsMode={isBsMode}
                          exchangeRate={exchangeRate}
                          onSavePrice={async (id, newBob, newUsd) => {
                            await handleInlinePriceUpdate(id, newBob, newUsd);
                          }}
                          isUpdating={inlineLoadingId === p.id}
                        />

                        {/* STOCK DISPONIBLE (Editable Inline) */}
                        <InlineStockCell
                          productId={p.id}
                          currentStock={stockQty}
                          onSaveStock={async (id, newStock) => {
                            await handleInlineStockUpdate(id, newStock);
                          }}
                          isUpdating={inlineLoadingId === p.id}
                        />

                        {/* VISIBILIDAD */}
                        <td className={`py-4 px-3 text-center whitespace-nowrap border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5]/60 group-hover:bg-[#FAF8F5]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <div className="inline-flex items-center p-1 bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl shadow-2xs">
                            <button
                              type="button"
                              disabled={inlineLoadingId === p.id}
                              onClick={() => handleInlineUpdate(p.id, 'is_active', true)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${isVisible
                                ? 'bg-[#1F6E43] text-white shadow-xs'
                                : 'text-[#8C827A] hover:text-[#1A1817]'
                                }`}
                              title="Hacer visible este producto en el catálogo público"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Visible</span>
                            </button>
                            <button
                              type="button"
                              disabled={inlineLoadingId === p.id}
                              onClick={() => handleInlineUpdate(p.id, 'is_active', false)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black transition-all cursor-pointer ${!isVisible
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-[#8C827A] hover:text-[#1A1817]'
                                }`}
                              title="Ocultar este producto del catálogo público"
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Oculto</span>
                            </button>
                          </div>
                        </td>

                        {/* ACCIONES (Centrado, con botón Editar visible y botón Eliminar independiente) */}
                        <td className={`py-3.5 px-4 text-center whitespace-nowrap border-b border-[#E2DCD3]/60 transition-colors ${!isVisible ? 'bg-[#FAF8F5]/60 group-hover:bg-[#FAF8F5]' : 'bg-white group-hover:bg-[#FAF8F5]'
                          }`}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#1A1817] text-[#1A1817] hover:text-[#D4A359] border border-[#E2DCD3] hover:border-[#1A1817] shadow-2xs hover:shadow-sm transition-all font-black text-xs cursor-pointer group/btn"
                              title="Editar datos completos del producto"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#D4A359] group-hover/btn:text-[#D4A359]" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(p)}
                              className="p-2 rounded-xl bg-white hover:bg-rose-600 text-[#8C827A] hover:text-white border border-[#E2DCD3] hover:border-rose-600 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
                              title="Eliminar producto"
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
                    {editingProduct ? 'Editar Producto Aeronáutico' : 'Agregar Nuevo Producto'}
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

              {/* Layout Principal en 2 Columnas: Izquierda Imagen Grande | Derecha Datos del Producto */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUMNA IZQUIERDA (5/12): FOTO DEL PRODUCTO EN FORMATO GRANDE */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-black text-[#1A1817] text-xs uppercase tracking-wider">
                      Foto del Producto *
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
                          alt={formData.name || 'Vista previa del producto'}
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
                  {/* Fila 1: Nombre del Producto + SKU Oficial */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-8">
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Nombre del Producto *
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
                          SKU / Código Oficial *
                        </label>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#211E1C] text-[#D4A359] uppercase font-mono">
                          Producto
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Ej. DUBQ0206 o F-OM10"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase().trim() })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] font-mono font-black uppercase tracking-wider focus:border-[#D4A359] outline-none shadow-2xs"
                        title="Código oficial o SKU del producto (ej. DUBQ0206, F-OM10, PM2018, etc.)."
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

                  {/* Fila 3: Bloque de Precio en USD */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E2DCD3] shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                        Configuración de Precio (USD)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#5C5650]">
                        TC: 1 USD = Bs. {exchangeRate.toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <label className="block font-black text-[#1A1817] uppercase tracking-wide text-[11px] mb-1.5">
                        Precio en USD ($) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#8A6220] pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="18.59"
                          value={usdPriceInput}
                          onChange={(e) => {
                            const newUsd = e.target.value;
                            setUsdPriceInput(newUsd);
                            const num = parseFloat(newUsd);
                            const rate = exchangeRate > 0 ? exchangeRate : 11.84;
                            if (!isNaN(num) && num > 0) {
                              setFormData({ ...formData, price: (num * rate).toFixed(2) });
                            } else if (newUsd === '') {
                              setFormData({ ...formData, price: '' });
                            }
                          }}
                          className="w-full pl-7 pr-3 py-2.5 bg-[#FAF8F5] border border-[#E2DCD3] rounded-xl focus:bg-white focus:border-[#D4A359] outline-none font-mono font-bold text-xs text-[#1A1817]"
                        />
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
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
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
              <h3 className="font-black text-base text-[#1A1817]">¿Eliminar producto?</h3>
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

      {/* MODAL CONFIGURACIÓN TIPO DE CAMBIO MANUAL */}
      {isRateModalOpen && (
        <div
          onClick={() => !isSavingRate && setIsRateModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl max-w-sm w-full border border-[#E2DCD3] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DCD3]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#211E1C] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#1A1817] uppercase tracking-wide">
                    Poner Tipo de Cambio Manual
                  </h3>
                  <p className="text-[11px] text-[#8C827A] font-semibold">
                    Valor en Bolivianos por cada 1 USD para catálogo y pedidos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 rounded-lg text-[#8C827A] hover:text-[#1A1817] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomRate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-[#1A1817] mb-1.5">
                  Valor Manual (Bs. por 1 USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#8C827A]">
                    Bs.
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    autoFocus
                    value={customRateInput}
                    onChange={(e) => setCustomRateInput(e.target.value)}
                    placeholder="12.10"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2DCD3] rounded-xl text-base font-mono font-black text-[#1A1817] focus:border-[#D4A359] outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isSavingRate}
                  onClick={() => setIsRateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E2DCD3] bg-white text-xs font-bold text-[#5C5650] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingRate}
                  className="px-5 py-2.5 rounded-xl bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  {isSavingRate ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>Guardar y Aplicar</span>
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
