'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Printer,
  Send,
  Calendar,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Package,
  Clock,
  AlertTriangle,
  FileText,
  X,
  Plane
} from 'lucide-react';
import type { QuoteOrder, OrderStatus } from '@/lib/types';

export default function AdminQuotesPage() {
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal for printable order / dispatch note
  const [printOrder, setPrintOrder] = useState<QuoteOrder | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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
        const statusLabel =
          newStatus === 'DELIVERED'
            ? 'ENTREGADO'
            : newStatus === 'DESPACHADO'
              ? 'DESPACHADO'
              : newStatus === 'PAGADO'
                ? 'PAGADO'
                : newStatus === 'CONFIRMADO'
                  ? 'CONFIRMADO'
                  : newStatus === 'IN_PREPARATION'
                    ? 'EN PREPARACIÓN'
                    : newStatus === 'CANCELLED' || newStatus === 'CANCELADO'
                      ? 'CANCELADO'
                      : 'PENDIENTE';
        showToast(`Pedido ${orderCode} actualizado a ${statusLabel}`);
      } else {
        showToast(data.error || 'No se pudo actualizar el estado', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error de conexión al actualizar estado', 'error');
    } finally {
      setUpdatingCode(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        (o.orderCode || '').toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.recipientName || '').toLowerCase().includes(q) ||
        (o.deliveryCity || '').toLowerCase().includes(q) ||
        (o.deliveryAddress || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Metrics
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'IN_PREPARATION' || o.status === 'CONFIRMADO' || o.status === 'PAGADO'
  ).length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'DESPACHADO').length;
  const totalQuotedAmount = orders
    .filter((o) => o.status !== 'CANCELLED' && o.status !== 'CANCELADO')
    .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  const formatBs = (amount: number) =>
    `Bs. ${(Number(amount) || 0).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom duration-200 ${toast.type === 'success' ? 'bg-[#3E7B44]' : 'bg-red-600'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
              Panel de Control · Despachos
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
            Gestión de Pedidos
          </h1>
          <p className="text-xs text-[#8C827A] mt-1">
            Gestiona las órdenes de repuestos enviadas desde el carrito y coordina despachos departamentales.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D4A359] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Actualizando...' : 'Actualizar Bandeja'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-white text-[#1A1817] font-bold text-xs border border-[#E2DCD3] shadow-xs transition-colors"
          >
            <span>Ver Tienda Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4A359]" />
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center shrink-0 border border-[#D4A359]/30">
            <ShoppingBag className="w-6 h-6 text-[#D4A359]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider block">
              Total Pedidos
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">{totalOrdersCount}</p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center shrink-0 border border-[#D4A359]/30">
            <Clock className="w-6 h-6 text-[#B88738]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider block">
              Por Despachar
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">{activeOrdersCount}</p>
          </div>
        </div>

        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E2DCD3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3E7B44]/15 text-[#3E7B44] flex items-center justify-center shrink-0 border border-[#3E7B44]/30">
            <CheckCircle2 className="w-6 h-6 text-[#3E7B44]" />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider block">
              Entregados
            </span>
            <p className="text-2xl font-black text-[#1A1817] leading-tight">{deliveredOrdersCount}</p>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="sticky top-[45px] z-20 bg-[#FAF8F5]/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#E2DCD3] flex items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C827A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código (HB-...), cliente, ciudad, dirección o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-8 py-2.5 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8C827A] hover:text-[#1A1817]"
              title="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="p-16 text-center bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] text-xs text-[#8C827A] flex items-center justify-center gap-2.5">
          <Loader2 className="w-5 h-5 animate-spin text-[#D4A359]" />
          <span className="font-bold">Cargando bandeja de pedidos y cotizaciones...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#FAF8F5] p-14 text-center rounded-3xl border border-dashed border-[#D4A359]/40 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-[#1A1817]">
            No se encontraron pedidos con estos filtros
          </h3>
          <p className="text-xs text-[#8C827A] max-w-md mx-auto">
            Cuando los clientes envíen un pedido o cotización desde el carrito de compras, aparecerá registrado aquí automáticamente.
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 rounded-full bg-[#211E1C] text-[#D4A359] text-xs font-bold hover:bg-[#D4A359] hover:text-[#161311] transition-colors cursor-pointer"
            >
              Ver todos los pedidos
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map((ord) => {
            const city = ord.deliveryCity || 'Bolivia';
            const address = ord.deliveryAddress || 'A coordinar con el comprador';
            const notes = ord.customerNotes || ord.cardMessage || '';

            return (
              <div
                key={ord.orderCode}
                className="bg-[#FAF8F5] rounded-3xl border border-[#E2DCD3] hover:border-[#D4A359]/60 shadow-sm transition-all p-5 sm:p-6 space-y-5"
              >
                {/* Order Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2DCD3] pb-4">
                  <div className="flex items-center flex-wrap gap-3">
                    <span className="font-mono font-black text-xs sm:text-sm text-[#D4A359] bg-[#211E1C] px-3.5 py-1.5 rounded-xl border border-[#D4A359]/40 shadow-2xs">
                      {ord.orderCode}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5650] bg-white px-3 py-1 rounded-xl border border-[#E2DCD3]">
                      <Calendar className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleString('es-BO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : 'Fecha reciente'}
                      </span>
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1A1817] bg-white px-3 py-1 rounded-xl border border-[#E2DCD3]">
                      <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>{city}</span>
                    </span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={ord.status}
                      disabled={updatingCode === ord.orderCode}
                      onChange={(e) =>
                        handleUpdateStatus(ord.orderCode, e.target.value as OrderStatus)
                      }
                      className={`text-xs font-black uppercase rounded-xl px-3.5 py-2 border cursor-pointer outline-none transition-colors ${ord.status === 'DELIVERED' || ord.status === 'DESPACHADO'
                          ? 'bg-[#3E7B44]/15 text-[#1E4D2B] border-[#3E7B44]/40'
                          : ord.status === 'IN_PREPARATION' || ord.status === 'CONFIRMADO' || ord.status === 'PAGADO'
                            ? 'bg-[#D4A359]/20 text-[#8A6220] border-[#D4A359]/50'
                            : ord.status === 'CANCELLED' || ord.status === 'CANCELADO'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                    >
                      <option value="PENDING">PENDIENTE</option>
                      <option value="CONFIRMADO">CONFIRMADO</option>
                      <option value="PAGADO">PAGADO</option>
                      <option value="DESPACHADO">DESPACHADO</option>
                      <option value="IN_PREPARATION">EN PREPARACIÓN</option>
                      <option value="DELIVERED">ENTREGADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>

                    {/* Print Order Dispatch Note Button */}
                    <button
                      type="button"
                      onClick={() => setPrintOrder(ord)}
                      className="px-3.5 py-2 rounded-xl bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Ver e imprimir Nota de Pedido / Despacho"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>Nota de Pedido</span>
                    </button>
                  </div>
                </div>

                {/* 3-Column Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Column 1: Datos del Comprador */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-2.5">
                    <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>Datos del Comprador</span>
                    </span>
                    <div>
                      <div className="font-black text-sm text-[#1A1817]">{ord.customerName}</div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#5C5650] mt-1">
                        <Phone className="w-3 h-3 text-[#D4A359]" />
                        <span>{ord.customerPhone}</span>
                      </div>
                    </div>
                    {ord.recipientName && ord.recipientName !== ord.customerName && (
                      <div className="pt-2 border-t border-[#F5F2EB]">
                        <span className="text-[10px] font-bold text-[#8C827A] uppercase block">
                          Recibe:
                        </span>
                        <span className="font-bold text-[#1A1817]">{ord.recipientName}</span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Dirección para el Pedido */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] space-y-2.5">
                    <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>Dirección para el Pedido</span>
                    </span>
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E2DCD3] font-black text-[11px] text-[#1A1817] mb-1">
                        {city}
                      </span>
                      <p className="text-[#1A1817] font-semibold leading-snug">{address}</p>
                    </div>
                    {(ord.deliveryDate || ord.deliveryTimeSlot) && (
                      <div className="pt-2 border-t border-[#F5F2EB] text-[11px] text-[#5C5650]">
                        {ord.deliveryDate && <span className="font-bold">{ord.deliveryDate}</span>}
                        {ord.deliveryTimeSlot && <span> · {ord.deliveryTimeSlot}</span>}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Notas & Total a Pagar */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E2DCD3] flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-black text-[#8C827A] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D4A359]" />
                        <span>Notas / Instrucciones de Envío</span>
                      </span>
                      <p className="text-xs text-[#5C5650] leading-relaxed line-clamp-3">
                        {notes ? notes : 'Sin observaciones adicionales registradas.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E2DCD3] flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#5C5650]">
                        Total a Pagar:
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#1A1817] bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#D4A359]/50">
                        {formatBs(ord.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Repuestos Solicitados */}
                <div className="bg-white rounded-2xl border border-[#E2DCD3] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#1A1817] uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>
                        Repuestos Solicitados ({ord.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0}{' '}
                        unid.)
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {(ord.items || []).map((it, idx) => {
                      const prod = it.item || (it as any);
                      const prodName = prod?.name || prod?.title || 'Repuesto Hobby Bolivia';
                      const prodSku =
                        prod?.sku ||
                        (prod?.id ? `HB-${String(prod.id).padStart(4, '0')}` : `ITEM-${idx + 1}`);
                      const prodImg =
                        prod?.image_url ||
                        (prod?.images && prod.images[0]) ||
                        'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp';
                      const unitPrice = Number(prod?.price) || 0;
                      const qty = Number(it.quantity) || 1;
                      const lineTotal = unitPrice * qty;

                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E2DCD3]"
                        >
                          <div className="w-11 h-11 rounded-lg bg-white p-1 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prodImg}
                              alt={prodName}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[10px] text-[#D4A359]">
                                {prodSku}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-[#211E1C] text-[#FAF8F5] font-mono font-black text-[10px]">
                                x{qty}
                              </span>
                            </div>
                            <p
                              className="font-bold text-xs text-[#1A1817] truncate mt-0.5"
                              title={prodName}
                            >
                              {prodName}
                            </p>
                            {unitPrice > 0 && (
                              <p className="text-[11px] font-mono font-semibold text-[#5C5650]">
                                {formatBs(lineTotal)}{' '}
                                <span className="text-[10px] text-[#8C827A]">
                                  ({formatBs(unitPrice)} c/u)
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Order / Dispatch Note Modal */}
      {printOrder && (
        <div
          onClick={() => setPrintOrder(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#161311]/70 backdrop-blur-xs animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-[#E2DCD3] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#E2DCD3] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#211E1C] border border-[#D4A359]/50 flex items-center justify-center text-[#D4A359]">
                  <Plane className="w-4 h-4 -rotate-45" />
                </div>
                <div>
                  <h3 className="font-black text-[#1A1817] text-sm uppercase tracking-wider">
                    Nota de Pedido / Despacho
                  </h3>
                  <p className="text-[11px] text-[#8C827A] font-mono">
                    Orden #{printOrder.orderCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintOrder(null)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#1A1817] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div
              id="printable-order-note"
              className="bg-[#FAF8F5] border border-[#E2DCD3] rounded-2xl p-6 space-y-5 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E2DCD3]">
                <div>
                  <span className="font-black text-base tracking-tight text-[#1A1817] block">
                    HOBBY BOLIVIA · AEROMODELISMO & R/C
                  </span>
                  <span className="text-[11px] text-[#5C5650]">
                    Repuestos y Componentes de Precisión · La Paz, Bolivia
                  </span>
                </div>
                <div className="sm:text-right font-mono">
                  <span className="font-black text-sm text-[#1A1817] block">
                    {printOrder.orderCode}
                  </span>
                  <span className="text-[11px] text-[#5C5650]">
                    {printOrder.createdAt
                      ? new Date(printOrder.createdAt).toLocaleDateString('es-BO', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                      : 'Fecha reciente'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#E2DCD3] space-y-1">
                  <span className="text-[10px] font-black text-[#8C827A] uppercase block">
                    Cliente:
                  </span>
                  <p className="font-black text-[#1A1817]">{printOrder.customerName}</p>
                  <p className="font-mono text-[#5C5650]">{printOrder.customerPhone}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E2DCD3] space-y-1">
                  <span className="text-[10px] font-black text-[#8C827A] uppercase block">
                    Dirección de Envío ({printOrder.deliveryCity || 'Bolivia'}):
                  </span>
                  <p className="font-semibold text-[#1A1817]">
                    {printOrder.deliveryAddress || 'A coordinar por WhatsApp'}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-xl border border-[#E2DCD3] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#211E1C] text-[#FAF8F5] text-[10px] font-black uppercase">
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Repuesto</th>
                      <th className="py-2.5 px-3 text-center">Cant.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2DCD3]">
                    {(printOrder.items || []).map((it, i) => {
                      const prod = it.item || (it as any);
                      const prodName = prod?.name || prod?.title || 'Repuesto';
                      const prodSku =
                        prod?.sku ||
                        (prod?.id ? `HB-${String(prod.id).padStart(4, '0')}` : `ITEM-${i + 1}`);
                      const qty = Number(it.quantity) || 1;
                      const price = Number(prod?.price) || 0;
                      return (
                        <tr key={i}>
                          <td className="py-2 px-3 font-mono font-bold text-[#D4A359]">
                            {prodSku}
                          </td>
                          <td className="py-2 px-3 font-semibold text-[#1A1817]">{prodName}</td>
                          <td className="py-2 px-3 text-center font-mono font-bold">{qty}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            {formatBs(price * qty)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(printOrder.customerNotes || printOrder.cardMessage) && (
                <div className="bg-white p-3.5 rounded-xl border border-[#E2DCD3]">
                  <span className="text-[10px] font-black text-[#8C827A] uppercase block mb-1">
                    Notas / Observaciones:
                  </span>
                  <p className="text-[#1A1817]">
                    {printOrder.customerNotes || printOrder.cardMessage}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#E2DCD3]">
                <span className="font-black uppercase tracking-wider text-xs text-[#5C5650]">
                  Total a Pagar:
                </span>
                <span className="text-lg font-black text-[#1A1817]">
                  {formatBs(printOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setPrintOrder(null)}
                className="px-4 py-2.5 border border-[#E2DCD3] rounded-full text-xs font-bold text-[#5C5650] hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#211E1C] hover:bg-[#D4A359] text-white hover:text-[#161311] font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#D4A359]" />
                <span>Imprimir Nota de Pedido</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
