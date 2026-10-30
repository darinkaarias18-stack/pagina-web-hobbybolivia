'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  Users,
  Award,
  Crown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Coins,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';
import type { QuoteOrder, Product, OrderStatus } from '@/lib/types';

interface AdminMetricsModuleProps {
  orders: QuoteOrder[];
  products: Product[];
  exchangeRate: number;
  lastUpdatedStr?: string;
  onRefreshRate?: () => void;
  isRefreshingRate?: boolean;
}

type PeriodType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function AdminMetricsModule({
  orders,
  products,
  exchangeRate,
  lastUpdatedStr,
  onRefreshRate,
  isRefreshingRate
}: AdminMetricsModuleProps) {
  const [periodTab, setPeriodTab] = useState<PeriodType>('DAY');
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // 1. Filtrar pedidos válidos (no cancelados para cálculo de ventas efectivas)
  const validOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status !== 'CANCELLED' && (o.status as any) !== 'CANCELADO'
    );
  }, [orders]);

  // 2. RESUMEN DE VENTAS ACUMULADAS, DESPACHADOS, ENTREGADOS
  const salesSummary = useMemo(() => {
    const totalAccumulatedSalesBob = validOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const totalAccumulatedSalesUsd =
      exchangeRate > 0 ? totalAccumulatedSalesBob / exchangeRate : 0;

    const dispatchedOrders = validOrders.filter(
      (o) => o.status === 'DESPACHADO'
    );
    const dispatchedAmountBob = dispatchedOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    const deliveredOrders = validOrders.filter(
      (o) => o.status === 'DELIVERED'
    );
    const deliveredAmountBob = deliveredOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    const inPrepOrders = validOrders.filter(
      (o) => o.status === 'IN_PREPARATION' || o.status === 'CONFIRMADO' || o.status === 'PAGADO'
    );
    const inPrepAmountBob = inPrepOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    const pendingOrders = validOrders.filter((o) => o.status === 'PENDING');
    const pendingAmountBob = pendingOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    const averageTicket =
      validOrders.length > 0
        ? totalAccumulatedSalesBob / validOrders.length
        : 0;

    const deliverySuccessRate =
      validOrders.length > 0
        ? Math.round(
          ((deliveredOrders.length + dispatchedOrders.length) /
            validOrders.length) *
          100
        )
        : 0;

    return {
      totalAccumulatedSalesBob,
      totalAccumulatedSalesUsd,
      dispatchedCount: dispatchedOrders.length,
      dispatchedAmountBob,
      deliveredCount: deliveredOrders.length,
      deliveredAmountBob,
      inPrepCount: inPrepOrders.length,
      inPrepAmountBob,
      pendingCount: pendingOrders.length,
      pendingAmountBob,
      totalOrdersCount: validOrders.length,
      averageTicket,
      deliverySuccessRate
    };
  }, [validOrders, exchangeRate]);

  // 3. REPORTE DE CLIENTES QUE COMPRARON MÁS
  const topCustomers = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        city: string;
        orderCount: number;
        totalSpentBob: number;
        itemsCount: number;
        lastOrderDate: string;
      }
    >();

    for (const ord of validOrders) {
      const key = (ord.customerPhone || ord.customerName || 'anonimo')
        .toLowerCase()
        .trim();
      const existing = map.get(key);
      const orderTotal = Number(ord.total) || 0;
      const orderItemsCount = (ord.items || []).reduce(
        (sum, it) => sum + (Number(it.quantity) || 1),
        0
      );
      const ordDate = ord.createdAt ? String(ord.createdAt) : '';

      if (existing) {
        existing.orderCount += 1;
        existing.totalSpentBob += orderTotal;
        existing.itemsCount += orderItemsCount;
        if (ordDate && (!existing.lastOrderDate || ordDate > existing.lastOrderDate)) {
          existing.lastOrderDate = ordDate;
        }
      } else {
        map.set(key, {
          name: ord.customerName || 'Cliente Particular',
          phone: ord.customerPhone || 'Sin teléfono',
          city: ord.deliveryCity || 'La Paz',
          orderCount: 1,
          totalSpentBob: orderTotal,
          itemsCount: orderItemsCount,
          lastOrderDate: ordDate
        });
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) => b.totalSpentBob - a.totalSpentBob);
    return list;
  }, [validOrders]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return topCustomers;
    const q = customerSearch.toLowerCase().trim();
    return topCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [topCustomers, customerSearch]);

  // 4. REPORTE DE PRODUCTOS MÁS VENDIDOS
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      {
        id?: number;
        name: string;
        sku: string;
        imageUrl: string;
        brand: string;
        categoryName: string;
        totalUnitsSold: number;
        totalRevenueBob: number;
        currentStock: number;
      }
    >();

    for (const ord of validOrders) {
      for (const it of ord.items || []) {
        const prod = it.item || (it as any);
        const prodId = prod?.id ? Number(prod.id) : undefined;
        const prodSku = prod?.sku ? String(prod.sku).trim() : `ITEM-${prodId || '0'}`;
        const prodName = prod?.name || prod?.title || 'Repuesto Hobby Bolivia';
        const qty = Number(it.quantity) || 1;
        const unitPrice = Number(prod?.price) || 0;
        const lineRevenue = unitPrice * qty;

        // Buscar stock actual en el catálogo vivo
        const liveProd = products.find(
          (p) => (prodId && p.id === prodId) || (prodSku && p.sku === prodSku)
        );
        const stockNow = liveProd
          ? (liveProd.stock !== undefined ? Number(liveProd.stock) : Number(liveProd.stockQuantity) || 0)
          : (prod?.stock !== undefined ? Number(prod.stock) : 10);

        const key = (prodSku || prodName).toLowerCase();
        const existing = map.get(key);

        if (existing) {
          existing.totalUnitsSold += qty;
          existing.totalRevenueBob += lineRevenue;
        } else {
          map.set(key, {
            id: prodId,
            name: prodName,
            sku: prodSku,
            imageUrl:
              prod?.image_url ||
              prod?.imageUrl ||
              'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp',
            brand: prod?.brand || 'Dubro',
            categoryName: prod?.category?.name || 'Repuestos y Accesorios',
            totalUnitsSold: qty,
            totalRevenueBob: lineRevenue,
            currentStock: stockNow
          });
        }
      }
    }

    const list = Array.from(map.values());
    list.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);
    return list;
  }, [validOrders, products]);

  const filteredProductsReport = useMemo(() => {
    if (!productSearch.trim()) return topProducts;
    const q = productSearch.toLowerCase().trim();
    return topProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [topProducts, productSearch]);

  // 5. QUE CLIENTE COMPRÓ MÁS CANTIDAD Y DE QUÉ PRODUCTO
  const largestIndividualPurchases = useMemo(() => {
    const list: {
      customerName: string;
      customerPhone: string;
      deliveryCity: string;
      productName: string;
      productSku: string;
      productImage: string;
      quantity: number;
      lineTotalBob: number;
      orderCode: string;
      orderDate: string;
    }[] = [];

    for (const ord of validOrders) {
      for (const it of ord.items || []) {
        const prod = it.item || (it as any);
        const qty = Number(it.quantity) || 1;
        const unitPrice = Number(prod?.price) || 0;
        const lineTotal = unitPrice * qty;

        list.push({
          customerName: ord.customerName || 'Cliente Hobby Bolivia',
          customerPhone: ord.customerPhone || 'Sin teléfono',
          deliveryCity: ord.deliveryCity || 'Bolivia',
          productName: prod?.name || prod?.title || 'Repuesto Hobby Bolivia',
          productSku: prod?.sku || 'N/A',
          productImage:
            prod?.image_url ||
            prod?.imageUrl ||
            'https://hobbybolivia.com/media/products/d0721149ad-dubq3570tn-t.webp',
          quantity: qty,
          lineTotalBob: lineTotal,
          orderCode: ord.orderCode,
          orderDate: ord.createdAt ? String(ord.createdAt) : ''
        });
      }
    }

    // Ordenar de mayor cantidad a menor
    list.sort((a, b) => b.quantity - a.quantity);
    return list;
  }, [validOrders]);

  const topSinglePurchase = largestIndividualPurchases[0] || null;

  // 6. VENTAS POR SEMANA, POR DÍA, POR MES Y POR AÑO
  const periodicSales = useMemo(() => {
    const byDay = new Map<string, { label: string; orderCount: number; totalBob: number; rawKey: string }>();
    const byWeek = new Map<string, { label: string; orderCount: number; totalBob: number; rawKey: string }>();
    const byMonth = new Map<string, { label: string; orderCount: number; totalBob: number; rawKey: string }>();
    const byYear = new Map<string, { label: string; orderCount: number; totalBob: number; rawKey: string }>();

    for (const ord of validOrders) {
      const d = ord.createdAt ? new Date(ord.createdAt) : new Date();
      const amount = Number(ord.total) || 0;

      // 6.1 Por Día (Formato YYYY-MM-DD y DD/MM/AAAA)
      const dayKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const dayEntry = byDay.get(dayKey);
      if (dayEntry) {
        dayEntry.orderCount += 1;
        dayEntry.totalBob += amount;
      } else {
        byDay.set(dayKey, { label: dayLabel, orderCount: 1, totalBob: amount, rawKey: dayKey });
      }

      // 6.2 Por Semana (Considerando semana exacta de Lunes a Domingo)
      // d.getDay(): 0 (Domingo) .. 6 (Sábado). Si es Domingo (0), restamos 6 días; si no, (getDay() - 1)
      const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // 1 (Lunes) .. 7 (Domingo)
      const monday = new Date(d);
      monday.setDate(d.getDate() - (dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const monDay = String(monday.getDate()).padStart(2, '0');
      const monMonth = String(monday.getMonth() + 1).padStart(2, '0');
      const sunDay = String(sunday.getDate()).padStart(2, '0');
      const sunMonth = String(sunday.getMonth() + 1).padStart(2, '0');
      const sunYear = sunday.getFullYear();

      // Clave para ordenamiento cronológico descendente (YYYY-MM-DD del Lunes)
      const weekKey = `${monday.getFullYear()}-${monMonth}-${monDay}`;
      
      // Formato solicitado: semana desde día lunes hasta día domingo
      const weekLabel = `Semana: Lunes ${monDay}/${monMonth} al Domingo ${sunDay}/${sunMonth}/${sunYear}`;

      const weekEntry = byWeek.get(weekKey);
      if (weekEntry) {
        weekEntry.orderCount += 1;
        weekEntry.totalBob += amount;
      } else {
        byWeek.set(weekKey, { label: weekLabel, orderCount: 1, totalBob: amount, rawKey: weekKey });
      }

      // 6.3 Por Mes (Ej: "Octubre 2026")
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('es-BO', {
        month: 'long',
        year: 'numeric'
      });
      const formattedMonthLabel =
        monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      const monthEntry = byMonth.get(monthKey);
      if (monthEntry) {
        monthEntry.orderCount += 1;
        monthEntry.totalBob += amount;
      } else {
        byMonth.set(monthKey, {
          label: formattedMonthLabel,
          orderCount: 1,
          totalBob: amount,
          rawKey: monthKey
        });
      }

      // 6.4 Por Año (Ej: "2026", "2025")
      const yearKey = String(d.getFullYear());
      const yearLabel = `Gestión ${yearKey}`;
      const yearEntry = byYear.get(yearKey);
      if (yearEntry) {
        yearEntry.orderCount += 1;
        yearEntry.totalBob += amount;
      } else {
        byYear.set(yearKey, { label: yearLabel, orderCount: 1, totalBob: amount, rawKey: yearKey });
      }
    }

    const sortDesc = (map: Map<string, { label: string; orderCount: number; totalBob: number; rawKey: string }>) => {
      const arr = Array.from(map.values());
      arr.sort((a, b) => b.rawKey.localeCompare(a.rawKey));
      return arr;
    };

    return {
      byDay: sortDesc(byDay),
      byWeek: sortDesc(byWeek),
      byMonth: sortDesc(byMonth),
      byYear: sortDesc(byYear)
    };
  }, [validOrders]);

  // Selección de período activo para visualización
  const activePeriodData = useMemo(() => {
    switch (periodTab) {
      case 'DAY':
        return { title: 'Ventas por Día', items: periodicSales.byDay, unit: 'Día' };
      case 'WEEK':
        return { title: 'Ventas por Semana', items: periodicSales.byWeek, unit: 'Semana' };
      case 'MONTH':
        return { title: 'Ventas por Mes', items: periodicSales.byMonth, unit: 'Mes' };
      case 'YEAR':
        return { title: 'Ventas por Año', items: periodicSales.byYear, unit: 'Año' };
    }
  }, [periodTab, periodicSales]);

  // Valor máximo para barras proporcionales
  const maxPeriodTotal = useMemo(() => {
    return Math.max(...activePeriodData.items.map((i) => i.totalBob), 1);
  }, [activePeriodData]);

  const formatBs = (num: number) =>
    `Bs. ${(Number(num) || 0).toLocaleString('es-BO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  const formatUsd = (num: number) =>
    `$us ${(Number(num) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* 2. TARJETAS DE RESUMEN EJECUTIVO (KPIs: VENTAS, DESPACHADOS, ENTREGADOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas Acumuladas */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
              Ventas Acumuladas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#D4A359]/15 text-[#B88738] flex items-center justify-center border border-[#D4A359]/30">
              <DollarSign className="w-5 h-5 text-[#B88738]" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
              {formatBs(salesSummary.totalAccumulatedSalesBob)}
            </p>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-mono font-bold text-[#8C827A]">
                ≈ {formatUsd(salesSummary.totalAccumulatedSalesUsd)}
              </span>
              <span className="font-bold text-[#D4A359] bg-[#211E1C] px-2 py-0.5 rounded-md text-[10px]">
                {salesSummary.totalOrdersCount} órdenes
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pedidos Despachados */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
              Pedidos Despachados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Truck className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
                {salesSummary.dispatchedCount}
              </p>
              <span className="text-xs font-bold text-[#8C827A]">en tránsito</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-semibold text-[#5C5650]">
                Monto: {formatBs(salesSummary.dispatchedAmountBob)}
              </span>
              <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                Salida Realizada
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pedidos Entregados */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
              Pedidos Entregados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#3E7B44]/15 text-[#3E7B44] flex items-center justify-center border border-[#3E7B44]/30">
              <CheckCircle2 className="w-5 h-5 text-[#3E7B44]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
                {salesSummary.deliveredCount}
              </p>
              <span className="text-xs font-bold text-[#3E7B44]">completados</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-semibold text-[#5C5650]">
                Monto: {formatBs(salesSummary.deliveredAmountBob)}
              </span>
              <span className="font-mono text-[10px] font-bold text-[#3E7B44] bg-[#3E7B44]/15 px-2 py-0.5 rounded-md">
                {salesSummary.deliverySuccessRate}% efectividad
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Ticket Promedio y En Proceso */}
        <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
              Ticket Promedio
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center border border-[#D4A359]/30">
              <TrendingUp className="w-5 h-5 text-[#D4A359]" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-[#1A1817] tracking-tight">
              {formatBs(salesSummary.averageTicket)}
            </p>
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#8C827A]">
                Por despachar: {salesSummary.inPrepCount + salesSummary.pendingCount}
              </span>
              <span className="text-[10px] font-bold text-[#1A1817] bg-[#E2DCD3] px-2 py-0.5 rounded-md">
                {formatBs(salesSummary.inPrepAmountBob + salesSummary.pendingAmountBob)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RÉCORD DESTACADO: QUÉ CLIENTE COMPRÓ MÁS CANTIDAD Y DE QUÉ PRODUCTO */}
      {topSinglePurchase && (
        <div className="bg-gradient-to-r from-[#211E1C] via-[#2A2623] to-[#211E1C] rounded-3xl p-6 sm:p-7 border border-[#D4A359]/50 shadow-xl text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A359] text-[#161311] text-xs font-black uppercase tracking-wider shadow-sm">
                <Crown className="w-3.5 h-3.5" />
                <span>Récord Histórico de Compra Individual</span>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#FAF8F5] tracking-tight">
                  {topSinglePurchase.customerName}
                </h3>
                <div className="flex items-center flex-wrap gap-3 text-xs text-[#A89F91] mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D4A359]" />
                    {topSinglePurchase.deliveryCity}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#D4A359]" />
                    {topSinglePurchase.customerPhone}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[#D4A359]">
                    Orden #{topSinglePurchase.orderCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Repuesto Adquirido */}
            <div className="bg-[#161311] p-4 rounded-2xl border border-[#D4A359]/30 flex items-center gap-4 shrink-0 max-w-md w-full">
              <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-[#D4A359]/40 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={topSinglePurchase.productImage}
                  alt={topSinglePurchase.productName}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#D4A359] block">
                  {topSinglePurchase.productSku}
                </span>
                <p className="text-xs font-black text-[#FAF8F5] truncate" title={topSinglePurchase.productName}>
                  {topSinglePurchase.productName}
                </p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#D4A359] text-[#161311] font-mono font-black text-xs">
                    {topSinglePurchase.quantity} unidades
                  </span>
                  <span className="font-mono font-black text-xs text-[#FAF8F5]">
                    {formatBs(topSinglePurchase.lineTotalBob)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VENTAS POR SEMANA, POR DÍA, POR MES Y POR AÑO */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-7 border border-[#E2DCD3] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-[#D4A359]" />
              <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
                Desglose Temporal de Ingresos
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1A1817]">
              {activePeriodData.title}
            </h3>
          </div>

          {/* Selector de Período Interactivo */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E2DCD3] shadow-xs">
            <button
              type="button"
              onClick={() => setPeriodTab('DAY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodTab === 'DAY'
                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              Por Día
            </button>
            <button
              type="button"
              onClick={() => setPeriodTab('WEEK')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodTab === 'WEEK'
                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              Por Semana
            </button>
            <button
              type="button"
              onClick={() => setPeriodTab('MONTH')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodTab === 'MONTH'
                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              Por Mes
            </button>
            <button
              type="button"
              onClick={() => setPeriodTab('YEAR')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodTab === 'YEAR'
                  ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                  : 'text-[#8C827A] hover:text-[#1A1817]'
              }`}
            >
              Por Año
            </button>
          </div>
        </div>

        {/* Visualización de Barras y Métricas de Ventas */}
        {activePeriodData.items.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8C827A]">
            No hay registros de ventas para este período.
          </div>
        ) : (
          <div className="space-y-3.5">
            {activePeriodData.items.map((item, idx) => {
              const percentage = Math.round((item.totalBob / maxPeriodTotal) * 100);
              return (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-[#E2DCD3] hover:border-[#D4A359]/60 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-[#211E1C] text-[#D4A359] font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-black text-sm text-[#1A1817]">
                        {item.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E2DCD3] text-[10px] font-bold text-[#5C5650]">
                        {item.orderCount} {item.orderCount === 1 ? 'pedido' : 'pedidos'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm sm:text-base text-[#1A1817] block">
                        {formatBs(item.totalBob)}
                      </span>
                      <span className="font-mono text-[11px] text-[#8C827A]">
                        {formatUsd(exchangeRate > 0 ? item.totalBob / exchangeRate : 0)}
                      </span>
                    </div>
                  </div>

                  {/* Barra Proporcional Warm Tech */}
                  <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#E2DCD3]">
                    <div
                      className="h-full bg-gradient-to-r from-[#B88738] to-[#D4A359] rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                      title={`${percentage}% del valor máximo registrado en este período`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. DOS COLUMNAS: REPORTE DE CLIENTES QUE COMPRARON MÁS Y PRODUCTOS MÁS VENDIDOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA 1: CLIENTES QUE COMPRARON MÁS */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E2DCD3] shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2DCD3]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A359] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Fidelidad de Clientes</span>
                </span>
                <h3 className="text-lg font-black text-[#1A1817] mt-0.5">
                  Clientes que Compraron Más
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#211E1C] text-[#D4A359] font-mono text-xs font-bold">
                {topCustomers.length} compradores
              </span>
            </div>

            {/* Buscador de Clientes */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, teléfono o ciudad..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium"
              />
            </div>

            {/* Lista de Clientes */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C827A]">
                  No se encontraron clientes con este criterio.
                </div>
              ) : (
                filteredCustomers.map((cust, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white rounded-2xl border border-[#E2DCD3] hover:border-[#D4A359]/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-[#D4A359] text-[#161311]'
                            : idx === 1
                              ? 'bg-[#8C827A] text-white'
                              : idx === 2
                                ? 'bg-[#B88738]/50 text-[#161311]'
                                : 'bg-[#FAF8F5] text-[#5C5650] border border-[#E2DCD3]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-[#1A1817] truncate">
                          {cust.name}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#8C827A]">
                          <span>{cust.city}</span>
                          <span>·</span>
                          <span className="font-mono">{cust.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-black text-xs text-[#1A1817] block">
                        {formatBs(cust.totalSpentBob)}
                      </span>
                      <span className="text-[10px] font-bold text-[#8C827A]">
                        {cust.orderCount} {cust.orderCount === 1 ? 'pedido' : 'pedidos'} ({cust.itemsCount} unid.)
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA 2: PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E2DCD3] shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2DCD3]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A359] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Rotación de Inventario</span>
                </span>
                <h3 className="text-lg font-black text-[#1A1817] mt-0.5">
                  Productos Más Vendidos
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-[#211E1C] text-[#D4A359] font-mono text-xs font-bold">
                {topProducts.length} repuestos
              </span>
            </div>

            {/* Buscador de Productos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, SKU o marca..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium"
              />
            </div>

            {/* Lista de Productos Más Vendidos */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredProductsReport.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8C827A]">
                  No se encontraron productos con este criterio.
                </div>
              ) : (
                filteredProductsReport.map((prod, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border border-[#E2DCD3] hover:border-[#D4A359]/60 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] p-1 border border-[#E2DCD3] flex items-center justify-center shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-[#D4A359]">
                            {prod.sku}
                          </span>
                          <span className="text-[10px] text-[#8C827A]">· {prod.brand}</span>
                        </div>
                        <p className="font-black text-xs text-[#1A1817] truncate" title={prod.name}>
                          {prod.name}
                        </p>
                        <span className="text-[10px] text-[#5C5650] block">
                          Stock almacén: <strong className={prod.currentStock < 5 ? 'text-red-600 font-bold' : 'text-[#1A1817]'}>{prod.currentStock} unid.</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#211E1C] text-[#FAF8F5] font-mono font-black text-xs block">
                        {prod.totalUnitsSold} vendidas
                      </span>
                      <span className="font-mono font-semibold text-[11px] text-[#5C5650] block mt-1">
                        {formatBs(prod.totalRevenueBob)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
