'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Printer,
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Loader2,
  Search,
  RefreshCw,
  ExternalLink,
  Package,
  Clock,
  AlertTriangle,
  FileText,
  X,
  Plane,
  Eye,
  ChevronDown,
  Truck,
  Check,
  ShieldCheck,
  Kanban,
  Table as TableIcon,
  ArrowRight,
  ArrowLeft,
  GripVertical,
  Trash2
} from 'lucide-react';
import type { QuoteOrder, OrderStatus } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

type FilterTab = 'ALL' | 'PEDIDO' | 'PENDING' | 'PAID' | 'DISPATCHED' | 'CANCELLED';
type ViewMode = 'kanban' | 'table';

export default function AdminQuotesPage() {
  const { isBsMode } = useCurrency();
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban'); // Kanban por defecto
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Drag and drop para Tablero Kanban
  const [draggedOrderCode, setDraggedOrderCode] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<OrderStatus | null>(null);

  // Modales
  const [detailOrder, setDetailOrder] = useState<QuoteOrder | null>(null);
  const [printOrder, setPrintOrder] = useState<QuoteOrder | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<QuoteOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    const code = orderToDelete.orderCode;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/quotes?orderCode=${encodeURIComponent(code)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(prev => prev.filter(o => o.orderCode !== code));
        showToast(`Pedido #${code} eliminado con éxito`);
        setOrderToDelete(null);
      } else {
        showToast(data.error || 'No se pudo eliminar el pedido', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const loadOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/quotes?t=' + Date.now(), { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
        if (isManualRefresh) {
          showToast('Bandeja de pedidos actualizada');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('Error al cargar los pedidos', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Manejador del cambio de estado con lógica de descuento/reversión de stock
  const handleUpdateStatus = async (orderCode: string, newStatus: OrderStatus) => {
    setUpdatingCode(orderCode);
    try {
      const res = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderCode, status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderCode === orderCode ? { ...o, ...(data.data || { status: newStatus }) } : o))
        );
        if (detailOrder && detailOrder.orderCode === orderCode) {
          setDetailOrder((prev) => (prev ? { ...prev, ...(data.data || { status: newStatus }) } : null));
        }
        if (printOrder && printOrder.orderCode === orderCode) {
          setPrintOrder((prev) => (prev ? { ...prev, ...(data.data || { status: newStatus }) } : null));
        }

        const statusLabels: Record<string, string> = {
          PEDIDO: 'PEDIDO (Nuevo)',
          PENDING: 'PENDIENTE DE PAGO',
          PAGADO: 'PAGADO (Stock Descontado)',
          CONFIRMADO: 'CONFIRMADO (Stock Descontado)',
          DESPACHADO: 'DESPACHADO (Stock Descontado)',
          DELIVERED: 'ENTREGADO',
          IN_PREPARATION: 'EN PREPARACIÓN',
          CANCELADO: 'CANCELADO (Stock Reincorporado)',
          CANCELLED: 'CANCELADO (Stock Reincorporado)'
        };

        const label = statusLabels[newStatus] || newStatus;
        showToast(`Pedido #${orderCode} actualizado a: ${label}`);
      } else {
        showToast(data.error || 'No se pudo actualizar el estado del pedido', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al actualizar estado', 'error');
    } finally {
      setUpdatingCode(null);
    }
  };

  // Normalizador de estado para columnas de Kanban
  const normalizeStatus = (status?: string): 'PEDIDO' | 'PENDING' | 'PAGADO' | 'DESPACHADO' | 'CANCELADO' => {
    if (status === 'DESPACHADO' || status === 'DELIVERED') return 'DESPACHADO';
    if (status === 'PAGADO' || status === 'CONFIRMADO' || status === 'IN_PREPARATION') return 'PAGADO';
    if (status === 'CANCELADO' || status === 'CANCELLED') return 'CANCELADO';
    if (status === 'PENDING') return 'PENDING';
    return 'PEDIDO';
  };

  // Contadores en tiempo real
  const counts = useMemo(() => {
    return {
      all: orders.length,
      pedido: orders.filter((o) => normalizeStatus(o.status) === 'PEDIDO').length,
      pending: orders.filter((o) => normalizeStatus(o.status) === 'PENDING').length,
      paid: orders.filter((o) => normalizeStatus(o.status) === 'PAGADO').length,
      dispatched: orders.filter((o) => normalizeStatus(o.status) === 'DESPACHADO').length,
      cancelled: orders.filter((o) => normalizeStatus(o.status) === 'CANCELADO').length
    };
  }, [orders]);

  // Filtrado combinado por Buscador Global y Tabs
  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      // 1. Buscador Global
      const matchesSearch =
        !q ||
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.recipientName || '').toLowerCase().includes(q) ||
        (o.deliveryCity || '').toLowerCase().includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q);

      // 2. Filtro de Pestaña Superior
      let matchesTab = true;
      const normalized = normalizeStatus(o.status);
      if (activeTab === 'PEDIDO') matchesTab = normalized === 'PEDIDO';
      else if (activeTab === 'PENDING') matchesTab = normalized === 'PENDING';
      else if (activeTab === 'PAID') matchesTab = normalized === 'PAGADO';
      else if (activeTab === 'DISPATCHED') matchesTab = normalized === 'DESPACHADO';
      else if (activeTab === 'CANCELLED') matchesTab = normalized === 'CANCELADO';

      return matchesSearch && matchesTab;
    });
  }, [orders, search, activeTab]);

  // Agrupación de pedidos para columnas Kanban
  const kanbanColumns = useMemo(() => {
    const q = search.toLowerCase().trim();
    const searchable = orders.filter((o) => {
      if (!q) return true;
      return (
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.recipientName || '').toLowerCase().includes(q) ||
        (o.deliveryCity || '').toLowerCase().includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q)
      );
    });

    return [
      {
        id: 'PEDIDO' as const,
        title: 'Pedidos',
        subtitle: 'Recibidos / Sin Confirmar',
        colorBadge: 'bg-purple-100 text-purple-900 border-purple-300',
        headerBorder: 'border-purple-400',
        dotColor: 'bg-purple-600',
        orders: searchable.filter((o) => normalizeStatus(o.status) === 'PEDIDO'),
        nextStatus: 'PENDING' as OrderStatus,
        nextLabel: 'A Pendiente de Pago'
      },
      {
        id: 'PENDING' as const,
        title: 'Pendientes de Pago',
        subtitle: 'Esperando Comprobante QR',
        colorBadge: 'bg-amber-100 text-amber-900 border-amber-300',
        headerBorder: 'border-amber-400',
        dotColor: 'bg-amber-500',
        orders: searchable.filter((o) => normalizeStatus(o.status) === 'PENDING'),
        nextStatus: 'PAGADO' as OrderStatus,
        nextLabel: 'Marcar Pagado'
      },
      {
        id: 'PAGADO' as const,
        title: 'Pagados',
        subtitle: 'Stock Descontado',
        colorBadge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        headerBorder: 'border-emerald-500',
        dotColor: 'bg-emerald-600',
        orders: searchable.filter((o) => normalizeStatus(o.status) === 'PAGADO'),
        nextStatus: 'DESPACHADO' as OrderStatus,
        nextLabel: 'Despachar Orden'
      },
      {
        id: 'DESPACHADO' as const,
        title: 'Despachados',
        subtitle: 'En Camino / Entregados',
        colorBadge: 'bg-blue-100 text-blue-900 border-blue-300',
        headerBorder: 'border-blue-500',
        dotColor: 'bg-blue-600',
        orders: searchable.filter((o) => normalizeStatus(o.status) === 'DESPACHADO'),
        nextStatus: null,
        nextLabel: null
      },
      {
        id: 'CANCELADO' as const,
        title: 'Cancelados',
        subtitle: 'Stock Reincorporado',
        colorBadge: 'bg-red-100 text-red-900 border-red-300',
        headerBorder: 'border-red-400',
        dotColor: 'bg-red-600',
        orders: searchable.filter((o) => normalizeStatus(o.status) === 'CANCELADO'),
        nextStatus: 'PEDIDO' as OrderStatus,
        nextLabel: 'Reabrir Pedido'
      }
    ];
  }, [orders, search]);

  // Semáforo Visual del Tiempo de Espera
  const getWaitingTime = (dateStr?: string | Date) => {
    if (!dateStr) return { text: 'Reciente', color: 'green' };
    const now = Date.now();
    const created = new Date(dateStr).getTime();
    const diffMs = Math.max(0, now - created);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    let text = '';
    if (diffDays > 0) {
      const remHours = diffHours % 24;
      text = `${diffDays}d ${remHours}h`;
    } else if (diffHours > 0) {
      const remMins = diffMins % 60;
      text = `${diffHours}h ${remMins}m`;
    } else {
      text = `${Math.max(1, diffMins)}m`;
    }

    let color: 'green' | 'yellow' | 'red' = 'green';
    if (diffHours >= 48) {
      color = 'red';
    } else if (diffHours >= 12) {
      color = 'yellow';
    }

    return { text, color, hours: diffHours };
  };

  const formatPrice = (amount: number) => {
    const val = Number(amount) || 0;
    if (isBsMode) {
      return `Bs. ${val.toLocaleString('es-BO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    return `$${val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} USD`;
  };

  const formatBs = formatPrice;

  const renderStatusBadge = (status?: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'PEDIDO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
            <span>Pedido (Nuevo)</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Pendiente de Pago</span>
          </span>
        );
      case 'PAGADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Pagado</span>
          </span>
        );
      case 'DESPACHADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Despachado</span>
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-900 border border-red-300 shadow-2xs">
            <X className="w-3 h-3 text-red-600" />
            <span>Cancelado</span>
          </span>
        );
    }
  };

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

      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]"></span>
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Panel de Control · Despachos & Logística
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-[#8C827A] mt-0.5">
            Tablero interactivo Kanban y control tabular de órdenes con sincronización de inventario.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Selector de Vista: Kanban vs Tabla */}
          <div className="flex items-center p-1 bg-[#FAF8F5] rounded-2xl border border-[#E2DCD3] shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${viewMode === 'kanban'
                ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                : 'text-[#8C827A] hover:text-[#1A1817]'
                }`}
              title="Ver en formato tablero Kanban interactivo"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${viewMode === 'table'
                ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                : 'text-[#8C827A] hover:text-[#1A1817]'
                }`}
              title="Ver en formato tabla tabular clásica"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Recargar pedidos desde la base de datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#D4A359]' : ''}`} />
            <span>{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
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

      {/* Buscador Global y Filtros Rápidos */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#E2DCD3] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (#HB-...), cliente, departamento o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-8 py-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium shadow-2xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8C827A] hover:text-[#1A1817] cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Si estamos en vista tabla, mostramos las pestañas de estado */}
        {viewMode === 'table' && (
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1 w-full max-w-full touch-pan-x">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'ALL'
                ? 'bg-[#211E1C] text-[#D4A359]'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Todos ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PEDIDO')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'PEDIDO'
                ? 'bg-purple-700 text-white'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Pedidos ({counts.pedido})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'PENDING'
                ? 'bg-amber-500 text-[#161311]'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Pendientes ({counts.pending})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PAID')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'PAID'
                ? 'bg-[#3E7B44] text-white'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Pagados ({counts.paid})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DISPATCHED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'DISPATCHED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Despachados ({counts.dispatched})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CANCELLED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${activeTab === 'CANCELLED'
                ? 'bg-red-600 text-white'
                : 'bg-white text-[#5C5650] border border-[#E2DCD3]'
                }`}
            >
              Cancelados ({counts.cancelled})
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-16 text-center bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] text-xs text-[#8C827A] flex items-center justify-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4A359]" />
          <span className="font-bold">Cargando gestión de pedidos...</span>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ================= VISTA TABLERO KANBAN INTERACTIVO ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4.5 items-start overflow-x-auto pb-6">
          {kanbanColumns.map((col) => {
            const totalColBob = col.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
            const isDropTarget = dragOverColumnId === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverColumnId !== col.id) {
                    setDragOverColumnId(col.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverColumnId === col.id) {
                    setDragOverColumnId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverColumnId(null);
                  const orderCode = e.dataTransfer.getData('text/plain') || draggedOrderCode;
                  if (orderCode) {
                    const targetOrder = orders.find((o) => o.orderCode === orderCode);
                    if (targetOrder && normalizeStatus(targetOrder.status) !== col.id) {
                      handleUpdateStatus(orderCode, col.id);
                    }
                  }
                  setDraggedOrderCode(null);
                }}
                className={`bg-[#FAF8F5] rounded-3xl p-3 sm:p-3.5 border transition-all duration-200 flex flex-col shadow-xs min-h-[580px] max-h-[82vh] ${isDropTarget
                  ? 'border-[#D4A359] ring-2 ring-[#D4A359]/70 bg-[#FDF9F2] scale-[1.01]'
                  : 'border-[#E2DCD3]'
                  }`}
              >
                {/* Cabecera de Columna Kanban */}
                <div className={`p-3 rounded-2xl bg-white border border-[#E2DCD3] shadow-2xs mb-3 border-t-4 ${col.headerBorder}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
                      <h3 className="font-black text-xs text-[#1A1817] truncate uppercase tracking-tight" title={col.title}>
                        {col.title}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${col.colorBadge}`}>
                      {col.orders.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#8C827A] font-semibold">
                    <span>{col.subtitle}</span>
                    <span className="font-mono font-bold text-[#1A1817]">
                      {formatBs(totalColBob)}
                    </span>
                  </div>
                </div>

                {/* Zona de Soltado Destacada al Arrastrar */}
                {isDropTarget && (
                  <div className="mb-3 p-3 rounded-2xl border-2 border-dashed border-[#D4A359] bg-[#D4A359]/15 text-center text-xs font-black text-[#161311] animate-pulse flex items-center justify-center gap-2">
                    <span>⬇ Soltar aquí para mover a {col.title}</span>
                  </div>
                )}

                {/* Lista de Tarjetas de Pedidos */}
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
                  {col.orders.length === 0 ? (
                    <div className="p-8 text-center text-[11px] text-[#A89F91] border border-dashed border-[#DCD6CC] rounded-2xl bg-white/40">
                      <span>No hay pedidos en este estado</span>
                    </div>
                  ) : (
                    col.orders.map((ord) => {
                      const itemsCount = (ord.items || []).reduce(
                        (sum, i) => sum + (Number(i.quantity) || 1),
                        0
                      );
                      const waitInfo = getWaitingTime(ord.createdAt);
                      const city = ord.deliveryCity || 'La Paz';
                      const isUpdating = updatingCode === ord.orderCode;
                      const isBeingDragged = draggedOrderCode === ord.orderCode;
                      const firstItem = ord.items && ord.items[0] ? (ord.items[0].item || ord.items[0] as any) : null;

                      return (
                        <div
                          key={ord.orderCode}
                          draggable={!isUpdating}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', ord.orderCode);
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggedOrderCode(ord.orderCode);
                          }}
                          onDragEnd={() => {
                            setDraggedOrderCode(null);
                            setDragOverColumnId(null);
                          }}
                          className={`bg-white rounded-2xl p-4 border border-[#E2DCD3] shadow-2xs hover:shadow-md transition-all space-y-3 group hover:border-[#D4A359]/60 cursor-grab active:cursor-grabbing select-none ${isBeingDragged ? 'opacity-40 scale-[0.98] border-dashed border-[#D4A359]' : ''
                            }`}
                        >
                          {/* Fila 1: Grip + Código + Semáforo de Tiempo */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="cursor-grab active:cursor-grabbing text-[#8C827A] group-hover:text-[#D4A359] transition-colors" title="Arrastrar para mover entre columnas">
                                <GripVertical className="w-3.5 h-3.5" />
                              </span>
                              <span className="font-mono font-black text-xs text-[#D4A359] bg-[#211E1C] px-2.5 py-1 rounded-lg border border-[#D4A359]/30 shadow-2xs">
                                #{ord.orderCode}
                              </span>
                            </div>

                            {/* Semáforo */}
                            {waitInfo.color === 'green' ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200"
                                title="Tiempo de espera óptimo (< 12 hrs)"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{waitInfo.text}</span>
                              </span>
                            ) : waitInfo.color === 'yellow' ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200"
                                title="Tiempo de espera moderado (12 a 48 hrs)"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>{waitInfo.text}</span>
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-red-700 border border-red-200"
                                title="Tiempo crítico de atención (> 48 hrs)"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                                <span>{waitInfo.text}</span>
                              </span>
                            )}
                          </div>

                          {/* Fila 2: Cliente y WhatsApp */}
                          <div className="space-y-0.5">
                            <p className="font-black text-xs text-[#1A1817] truncate" title={ord.customerName}>
                              {ord.customerName || 'Cliente sin nombre'}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <a
                                href={`https://wa.me/${(ord.customerPhone || '').replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#5C5650] hover:text-[#3E7B44] transition-colors"
                              >
                                <Phone className="w-3 h-3 text-[#3E7B44] shrink-0" />
                                <span>{ord.customerPhone || 'S/N'}</span>
                              </a>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8C827A]">
                                <MapPin className="w-3 h-3 text-[#D4A359] shrink-0" />
                                <span>{city}</span>
                              </span>
                            </div>
                          </div>

                          {/* Fila 3: Detalle de Productos */}
                          <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E2DCD3] space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold text-[#5C5650]">
                              <span>{ord.items?.length || 0} producto(s)</span>
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#E2DCD3]">
                                {itemsCount} unid.
                              </span>
                            </div>
                            {firstItem && (
                              <p className="text-[11px] font-semibold text-[#1A1817] truncate" title={firstItem.name || firstItem.title}>
                                {firstItem.name || firstItem.title}
                              </p>
                            )}
                          </div>

                          {/* Fila 4: Total en USD */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-black uppercase text-[#8C827A]">
                              Total:
                            </span>
                            <span className="font-mono font-black text-sm text-[#1A1817]">
                              {formatBs(ord.total)}
                            </span>
                          </div>

                          {/* Fila 5: Selector Rápido de Estado */}
                          <div className="pt-2 border-t border-[#E2DCD3] space-y-2">
                            <div className="relative">
                              <select
                                value={normalizeStatus(ord.status)}
                                disabled={isUpdating}
                                onChange={(e) =>
                                  handleUpdateStatus(ord.orderCode, e.target.value as OrderStatus)
                                }
                                className="w-full text-[11px] font-black rounded-xl px-2.5 py-1.5 pr-6 border border-[#E2DCD3] bg-white text-[#1A1817] cursor-pointer outline-none transition-all appearance-none shadow-2xs hover:border-[#D4A359]"
                              >
                                <option value="PEDIDO">1. Pedido</option>
                                <option value="PENDING">2. Pendiente de Pago</option>
                                <option value="PAGADO">3. Pagado (Stock)</option>
                                <option value="DESPACHADO">4. Despachado</option>
                                <option value="CANCELADO">5. Cancelado</option>
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C827A]" />
                            </div>

                            {/* Botones de Acción de Tarjeta */}
                            <div className="flex items-center justify-between gap-1.5 pt-1">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setDetailOrder(ord)}
                                  className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer"
                                  title="Ver productos solicitados"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPrintOrder(ord)}
                                  className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer"
                                  title="Imprimir Nota de Pedido Oficial"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrderToDelete(ord)}
                                  className="p-1.5 rounded-lg bg-[#FAF8F5] hover:bg-red-600 text-[#5C5650] hover:text-white border border-[#E2DCD3] hover:border-red-600 transition-colors cursor-pointer group"
                                  title="Eliminar pedido"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors" />
                                </button>
                              </div>

                              {col.nextStatus && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(ord.orderCode, col.nextStatus!)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] text-[10px] font-black uppercase transition-colors cursor-pointer"
                                  title={col.nextLabel || 'Avanzar estado'}
                                >
                                  <span>Avanzar</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {isUpdating && (
                              <span className="text-[9.5px] text-[#D4A359] font-bold block text-center animate-pulse">
                                Actualizando almacén...
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VISTA TABLA TABULAR ================= */
        <div className="w-full overflow-x-auto scrollbar-thin rounded-2xl border border-neutral-200 bg-white shadow-sm touch-pan-x">
          <table className="w-full text-left border-collapse text-xs min-w-[880px]">
            <thead>
              <tr className="bg-[#211E1C] text-[#FAF8F5] uppercase tracking-wider text-[10px] font-black border-b border-[#2D2622]">
                <th className="py-3.5 px-4 whitespace-nowrap">ORDEN</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">TIEMPO ESPERA</th>
                <th className="py-3.5 px-4 whitespace-nowrap">FECHA & DESTINO</th>
                <th className="py-3.5 px-4 whitespace-nowrap">CLIENTE</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">TOTAL (USD)</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">ESTADO (GESTIONAR)</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2DCD3]">
              {filteredOrders.map((ord) => {
                const itemsCount = (ord.items || []).reduce(
                  (sum, i) => sum + (Number(i.quantity) || 1),
                  0
                );
                const waitInfo = getWaitingTime(ord.createdAt);
                const city = ord.deliveryCity || 'La Paz';
                const isUpdating = updatingCode === ord.orderCode;
                const currentMappedValue = normalizeStatus(ord.status);

                return (
                  <tr
                    key={ord.orderCode}
                    className="hover:bg-[#FAF8F5]/80 transition-colors group"
                  >
                    {/* 1. ORDEN */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-1">
                        <span className="font-mono font-black text-xs text-[#D4A359] bg-[#211E1C] px-2.5 py-1 rounded-lg border border-[#D4A359]/30 inline-block shadow-2xs">
                          #{ord.orderCode}
                        </span>
                        <span className="text-[10px] text-[#8C827A] font-bold block">
                          {ord.items?.length || 0} rep. ({itemsCount} unid.)
                        </span>
                      </div>
                    </td>

                    {/* 2. TIEMPO ESPERA */}
                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                      {waitInfo.color === 'green' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{waitInfo.text}</span>
                        </span>
                      ) : waitInfo.color === 'yellow' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span>{waitInfo.text}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                          <span>{waitInfo.text}</span>
                        </span>
                      )}
                    </td>

                    {/* 3. FECHA & DESTINO */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5C5650]">
                          <Calendar className="w-3 h-3 text-[#D4A359] shrink-0" />
                          <span>
                            {ord.createdAt
                              ? new Date(ord.createdAt).toLocaleDateString('es-BO', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                              : 'Fecha reciente'}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1 font-bold text-xs text-[#1A1817]">
                          <MapPin className="w-3 h-3 text-[#D4A359] shrink-0" />
                          <span>{city}</span>
                        </div>
                      </div>
                    </td>

                    {/* 4. CLIENTE */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="space-y-1">
                        <p className="font-black text-xs text-[#1A1817] truncate max-w-[200px]" title={ord.customerName}>
                          {ord.customerName}
                        </p>
                        <a
                          href={`https://wa.me/${(ord.customerPhone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#5C5650] hover:text-[#3E7B44] transition-colors"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-[#3E7B44] shrink-0" />
                          <span>{ord.customerPhone}</span>
                        </a>
                      </div>
                    </td>

                    {/* 5. TOTAL (BS.) */}
                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                      <span className="font-mono font-black text-sm text-[#1A1817] block">
                        {formatBs(ord.total)}
                      </span>
                      <span className="text-[10px] text-[#8C827A] font-medium block">
                        Efectivo / QR
                      </span>
                    </td>

                    {/* 6. ESTADO (GESTIONAR) */}
                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                      <div className="relative inline-block">
                        <select
                          value={currentMappedValue}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleUpdateStatus(ord.orderCode, e.target.value as OrderStatus)
                          }
                          className={`text-xs font-black rounded-xl px-3 py-1.5 pr-7 border cursor-pointer outline-none transition-all appearance-none shadow-2xs ${currentMappedValue === 'PEDIDO'
                            ? 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200/80'
                            : currentMappedValue === 'PAGADO'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-400 hover:bg-emerald-200/80'
                              : currentMappedValue === 'DESPACHADO'
                                ? 'bg-blue-100 text-blue-900 border-blue-400 hover:bg-blue-200/80'
                                : currentMappedValue === 'CANCELADO'
                                  ? 'bg-red-100 text-red-900 border-red-300 hover:bg-red-200/80'
                                  : 'bg-amber-100 text-amber-900 border-amber-400 hover:bg-amber-200/80'
                            }`}
                        >
                          <option value="PEDIDO">Pedido</option>
                          <option value="PENDING">Pendiente de Pago</option>
                          <option value="PAGADO">Pagado</option>
                          <option value="DESPACHADO">Despachado</option>
                          <option value="CANCELADO">Cancelado</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-70" />
                      </div>
                      {isUpdating && (
                        <span className="text-[10px] text-[#D4A359] font-bold block mt-1 animate-pulse">
                          Actualizando...
                        </span>
                      )}
                    </td>

                    {/* 7. ACCIONES */}
                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailOrder(ord)}
                          className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer shadow-2xs"
                          title="Ver detalle de productos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrintOrder(ord)}
                          className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#211E1C] text-[#5C5650] hover:text-[#D4A359] border border-[#E2DCD3] transition-colors cursor-pointer shadow-2xs"
                          title="Imprimir Nota de Pedido / Despacho Oficial"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-red-600 text-[#5C5650] hover:text-white border border-[#E2DCD3] hover:border-red-600 transition-colors cursor-pointer shadow-2xs group"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTOS SOLICITADOS */}
      {detailOrder && (
        <div
          onClick={() => setDetailOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E2DCD3] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-white border-b border-[#E2DCD3] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center border border-[#D4A359]/40 shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#1A1817]">
                      Pedido #{detailOrder.orderCode}
                    </span>
                    {renderStatusBadge(detailOrder.status)}
                  </div>
                  <p className="text-xs text-[#8C827A]">
                    Detalle de productos y destino de despacho
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-1">
                  <span className="text-[10px] font-black text-[#8C827A] uppercase block">
                    Comprador:
                  </span>
                  <p className="font-black text-[#1A1817] text-sm">{detailOrder.customerName}</p>
                  <p className="font-mono font-bold text-[#5C5650]">{detailOrder.customerPhone}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-1">
                  <span className="text-[10px] font-black text-[#8C827A] uppercase block">
                    Destino ({detailOrder.deliveryCity || 'Bolivia'}):
                  </span>
                  <p className="font-semibold text-[#1A1817]">
                    {detailOrder.deliveryAddress || 'A coordinar por WhatsApp'}
                  </p>
                </div>
              </div>

              {/* Lista de Productos */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#1A1817] block">
                  Productos Solicitados ({(detailOrder.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)} unidades):
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(detailOrder.items || []).map((it, idx) => {
                    const prod = it.item || (it as any);
                    const prodName = prod?.name || prod?.title || 'Producto Hobby Bolivia';
                    const prodSku = prod?.sku || `HB-${idx + 1}`;
                    const prodImg =
                      prod?.image_url ||
                      prod?.imageUrl ||
                      '/placeholder.webp';
                    const unitPrice = Number(prod?.price) || 0;
                    const qty = Number(it.quantity) || 1;
                    const lineTotal = unitPrice * qty;

                    return (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-2xl border border-[#E2DCD3] flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] p-1 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                            <img
                              src={prodImg}
                              alt={prodName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-[10px] text-[#D4A359]">
                              {prodSku}
                            </span>
                            <p className="font-black text-xs text-[#1A1817] truncate" title={prodName}>
                              {prodName}
                            </p>
                            <span className="text-[11px] text-[#8C827A]">
                              {formatBs(unitPrice)} c/u
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-md bg-[#211E1C] text-[#FAF8F5] font-mono font-black text-xs inline-block">
                            x{qty}
                          </span>
                          <span className="font-mono font-black text-xs text-[#1A1817] block mt-1">
                            {formatBs(lineTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Final */}
              <div className="pt-3 border-t border-[#E2DCD3] flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#5C5650]">
                  Total a Cobrar:
                </span>
                <span className="text-xl font-black text-[#1A1817] font-mono">
                  {formatBs(detailOrder.total)}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E2DCD3] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2 border border-[#E2DCD3] rounded-full text-xs font-bold text-[#5C5650] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintOrder(detailOrder);
                  setDetailOrder(null);
                }}
                className="px-5 py-2 bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>Imprimir Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPRIMIBLE: NOTA OFICIAL DE PEDIDO / DESPACHO */}
      {printOrder && (
        <div
          onClick={() => setPrintOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#161311]/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1C1815] rounded-3xl max-w-3xl w-full shadow-2xl border border-[#D4A359]/30 flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header del Modal */}
            <div className="px-6 py-4 bg-[#161311] border-b border-[#2D2622] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#211E1C] border border-[#D4A359]/40 flex items-center justify-center text-[#D4A359] shadow-sm">
                  <Plane className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-[#FAF8F5] text-sm uppercase tracking-wide">
                      Comprobante Oficial de Despacho
                    </h3>
                    <span className="font-mono text-xs font-black text-[#D4A359] bg-[#211E1C] px-2 py-0.5 rounded-md border border-[#D4A359]/30">
                      #{printOrder.orderCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A89F91]">
                    Hobby Bolivia Aeromodelismo · Documento de Control y Entrega
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintOrder(null)}
                  className="p-1.5 rounded-full text-[#A89F91] hover:text-white hover:bg-[#211E1C] cursor-pointer transition-colors"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Canvas (Hoja Imprimible Oficial) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#161311]/40">
              <div
                id="printable-order-note"
                className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-[#1A1817] shadow-xl relative overflow-hidden print:p-0 print:border-none print:shadow-none"
              >
                {/* Franja superior decorativa Warm Tech */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#211E1C] via-[#D4A359] to-[#211E1C] rounded-full" />

                {/* Encabezado Corporativo Oficial */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E2DCD3]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#211E1C] border border-[#D4A359]/60 flex items-center justify-center text-[#D4A359] shadow-sm shrink-0">
                        <Plane className="w-4 h-4 -rotate-45" />
                      </div>
                      <div>
                        <h2 className="font-black text-lg tracking-tight text-[#1A1817] leading-none">
                          HOBBY BOLIVIA
                        </h2>
                        <span className="text-[10px] font-black text-[#D4A359] tracking-wider uppercase">
                          Aeromodelismo & R/C de Precisión
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#5C5650] leading-relaxed pt-1">
                      Productos, motores y componentes certificados para aeromodelos.
                      <br />
                      La Paz, Bolivia · Soporte WhatsApp: (+591) 70123456
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E2DCD3] shadow-2xs shrink-0">
                    <span className="text-[10px] font-black uppercase text-[#8C827A] tracking-wider block">
                      Nota de Despacho
                    </span>
                    <span className="font-mono font-black text-base sm:text-lg text-[#1A1817] block">
                      #{printOrder.orderCode}
                    </span>
                    <div className="flex items-center sm:justify-end gap-1.5 text-[11px] font-medium text-[#5C5650]">
                      <Calendar className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>
                        {printOrder.createdAt
                          ? new Date(printOrder.createdAt).toLocaleDateString('es-BO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                          : 'Fecha actual'}
                      </span>
                    </div>
                    <div className="pt-1 flex sm:justify-end">
                      {renderStatusBadge(printOrder.status)}
                    </div>
                  </div>
                </div>

                {/* Tarjetas Cliente & Envío */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-center text-[#D4A359]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                        Cliente / Destinatario:
                      </span>
                    </div>
                    <div className="pl-1 space-y-0.5">
                      <p className="font-black text-sm text-[#1A1817]">
                        {printOrder.customerName || 'Cliente sin nombre'}
                      </p>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-[#5C5650]">
                        <Phone className="w-3 h-3 text-[#3E7B44]" />
                        <span className="font-bold">{printOrder.customerPhone || 'Sin teléfono'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#FAF8F5] border border-[#E2DCD3] flex items-center justify-center text-[#D4A359]">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                        Destino & Entrega:
                      </span>
                    </div>
                    <div className="pl-1 space-y-0.5">
                      <p className="font-black text-sm text-[#1A1817]">
                        {printOrder.deliveryCity || 'La Paz'}
                      </p>
                      <p className="text-xs font-semibold text-[#5C5650]">
                        {printOrder.deliveryAddress || 'A coordinar por WhatsApp'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tabla de Productos Solicitados */}
                <div className="bg-white rounded-2xl border border-[#E2DCD3] overflow-hidden shadow-2xs">
                  <div className="px-4 py-2.5 bg-[#211E1C] flex items-center justify-between text-[#FAF8F5]">
                    <span className="font-black text-[10px] uppercase tracking-wider text-[#D4A359]">
                      Detalle de Productos y Componentes
                    </span>
                    <span className="font-mono text-[10px] text-[#FAF8F5]/80">
                      Total Unidades: {(printOrder.items || []).reduce((sum, i) => sum + (Number(i.quantity) || 1), 0)}
                    </span>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] text-[#5C5650] text-[9.5px] font-black uppercase border-b border-[#E2DCD3]">
                        <th className="py-2.5 px-4 w-28">SKU</th>
                        <th className="py-2.5 px-3">Producto</th>
                        <th className="py-2.5 px-3 text-center w-20">Cant.</th>
                        <th className="py-2.5 px-3 text-right w-28">Precio Unit.</th>
                        <th className="py-2.5 px-4 text-right w-32">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2DCD3]">
                      {(printOrder.items || []).map((it, i) => {
                        const prod = it.item || (it as any);
                        const prodName = prod?.name || prod?.title || 'Producto de precisión';
                        const prodSku =
                          prod?.sku ||
                          (prod?.id ? `HB-${String(prod.id).padStart(4, '0')}` : `HB-${String(i + 1).padStart(4, '0')}`);
                        const qty = Number(it.quantity) || 1;
                        const price = Number(prod?.price) || 0;
                        const lineTotal = price * qty;
                        const prodImg =
                          prod?.image_url ||
                          prod?.imageUrl ||
                          '/placeholder.webp';

                        return (
                          <tr key={i} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold text-[#D4A359] text-[11px] whitespace-nowrap">
                              {prodSku}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] p-0.5 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                                  <img
                                    src={prodImg}
                                    alt={prodName}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <span className="font-extrabold text-[#1A1817] text-xs">
                                  {prodName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-[#211E1C] text-[#FAF8F5] font-mono font-black text-xs">
                                x{qty}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-[#5C5650] whitespace-nowrap">
                              {formatBs(price)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black text-[#1A1817] text-xs whitespace-nowrap">
                              {formatBs(lineTotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Resumen Financiero */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2DCD3]">
                  <div className="space-y-1 text-[#5C5650] text-[11px] text-center sm:text-left">
                    <div className="flex items-center gap-1.5 justify-center sm:justify-start font-bold text-[#1A1817]">
                      <ShieldCheck className="w-4 h-4 text-[#3E7B44]" />
                      <span>Garantía de Productos Hobby Bolivia</span>
                    </div>
                    <p>Comprobante de retiro de almacén oficial. Precios expresados en Dólares (USD).</p>
                  </div>

                  <div className="bg-white px-5 py-3.5 rounded-2xl border-2 border-[#D4A359]/40 shadow-xs flex items-center gap-6 shrink-0">
                    <span className="font-black uppercase tracking-wider text-xs text-[#5C5650]">
                      Total a Pagar:
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#1A1817] font-mono">
                      {formatBs(printOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Cuadros de Firma */}
                <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-dashed border-[#DCD6CC] text-center text-[10px] text-[#8C827A]">
                  <div className="space-y-1">
                    <div className="border-b border-[#A89F91] w-3/4 mx-auto h-8" />
                    <span className="font-bold text-[#1A1817] block pt-1">
                      Firma / C.I. de Recepción
                    </span>
                    <span>Cliente / Destinatario</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b border-[#A89F91] w-3/4 mx-auto h-8" />
                    <span className="font-bold text-[#1A1817] block pt-1">
                      Control y Despacho
                    </span>
                    <span>Hobby Bolivia · Aeromodelismo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 bg-[#161311] border-t border-[#2D2622] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPrintOrder(null)}
                className="px-5 py-2.5 rounded-full border border-[#2D2622] bg-[#211E1C] text-[#FAF8F5] hover:bg-[#2D2622] font-bold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-full bg-[#D4A359] hover:bg-[#FAF8F5] text-[#161311] font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#161311]" />
                <span>Imprimir Nota de Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DE PEDIDO */}
      {orderToDelete && (
        <div
          onClick={() => !isDeleting && setOrderToDelete(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/75 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-3xl max-w-md w-full shadow-2xl border border-[#E2DCD3] overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1A1817] uppercase tracking-wide">
                  Eliminar Pedido
                </h3>
                <span className="font-mono text-xs font-bold text-[#D4A359] bg-[#211E1C] px-2 py-0.5 rounded">
                  #{orderToDelete.orderCode}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5C5650] leading-relaxed">
              ¿Estás seguro de que deseas eliminar permanentemente el pedido de <strong className="text-[#1A1817]">{orderToDelete.customerName}</strong> por un total de <strong className="text-[#1A1817]">${Number(orderToDelete.total || 0).toFixed(2)} USD</strong>? Esta acción lo borrará del sistema.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#E2DCD3] bg-white text-xs font-bold text-[#5C5650] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteOrder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, eliminar pedido</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para impresión limpia sin interfaz modal */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-order-note,
          #printable-order-note * {
            visibility: visible;
          }
          #printable-order-note {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
