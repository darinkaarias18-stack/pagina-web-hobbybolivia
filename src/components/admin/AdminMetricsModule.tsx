'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
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
  BarChart2,
  CalendarDays,
  Coins,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  MapPin,
  Phone,
  AlertCircle,
  AlertTriangle,
  CreditCard,
  ArrowRight,
  Boxes,
  SlidersHorizontal
} from 'lucide-react';
import type { QuoteOrder, Product, OrderStatus } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyContext';

interface AdminMetricsModuleProps {
  orders: QuoteOrder[];
  products: Product[];
  exchangeRate: number;
  lastUpdatedStr?: string;
  onRefreshRate?: () => void;
  isRefreshingRate?: boolean;
}

type PeriodType = 'OVERVIEW' | 'WEEK' | 'MONTH' | 'DAY' | 'YEAR';
type ChartViewMode = 'HORIZONTAL' | 'VERTICAL';
type ProductTab = 'BEST_SELLERS' | 'STAGNANT_STOCK';

interface PeriodicItem {
  label: string;
  shortLabel: string;
  subLabel?: string;
  orderCount: number;
  totalBob: number;
  rawKey: string;
}

export function AdminMetricsModule({
  orders,
  products,
  exchangeRate,
  lastUpdatedStr,
  onRefreshRate,
  isRefreshingRate
}: AdminMetricsModuleProps) {
  const { isBsMode, currencyLabel, currencySymbol } = useCurrency();
  const [periodTab, setPeriodTab] = useState<PeriodType>('OVERVIEW');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('HORIZONTAL');
  const [productTab, setProductTab] = useState<ProductTab>('BEST_SELLERS');
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

    const pendingOrders = validOrders.filter(
      (o) => o.status === 'PENDING' || o.status === 'PEDIDO'
    );
    const pendingAmountBob = pendingOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );

    const toDispatchOrders = validOrders.filter(
      (o) =>
        o.status === 'IN_PREPARATION' ||
        o.status === 'CONFIRMADO' ||
        o.status === 'PAGADO' ||
        o.status === 'PENDING' ||
        o.status === 'PEDIDO'
    );
    const toDispatchAmountBob = toDispatchOrders.reduce(
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
      toDispatchCount: toDispatchOrders.length,
      toDispatchAmountBob,
      totalOrdersCount: validOrders.length,
      averageTicket,
      deliverySuccessRate
    };
  }, [validOrders, exchangeRate]);

  // Métricas temporales del modelo visual: Día, Semana (Lun-Dom), Mes Actual y Año Actual
  const performanceMetrics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    // 1. VENTAS DEL DÍA (Hoy)
    const todayOrders = validOrders.filter(
      (o) => o.createdAt && new Date(o.createdAt).toDateString() === todayStr
    );
    const todayTotalBob = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const todayCount = todayOrders.length;

    // 2. ESTA SEMANA (Lunes a Domingo)
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - (dayOfWeek - 1));
    thisMonday.setHours(0, 0, 0, 0);

    const thisSunday = new Date(thisMonday);
    thisSunday.setDate(thisMonday.getDate() + 6);
    thisSunday.setHours(23, 59, 59, 999);

    const thisWeekOrders = validOrders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d >= thisMonday && d <= thisSunday;
    });
    const thisWeekTotalBob = thisWeekOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const thisWeekCount = thisWeekOrders.length;

    // 3. MES ACTUAL (ej. OCTUBRE / NOVIEMBRE)
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthOrders = validOrders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex;
    });
    const thisMonthTotalBob = thisMonthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const thisMonthCount = thisMonthOrders.length;
    const thisMonthAverageTicket = thisMonthCount > 0 ? thisMonthTotalBob / thisMonthCount : 0;
    const monthName = now
      .toLocaleDateString('es-BO', { month: 'long' })
      .toUpperCase();

    // 4. AÑO ACTUAL (ej. 2026)
    const thisYearOrders = validOrders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear;
    });
    const thisYearTotalBob = thisYearOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const thisYearCount = thisYearOrders.length;

    // 5. CATÁLOGO ACTIVO
    const activeProductsCount = products.filter(
      (p) => p.is_active !== false && p.isActive !== false
    ).length;
    const totalProductsCount = products.length;

    return {
      todayTotalBob,
      todayCount,
      thisWeekTotalBob,
      thisWeekCount,
      thisMonthTotalBob,
      thisMonthCount,
      thisMonthAverageTicket,
      monthName,
      thisYearTotalBob,
      thisYearCount,
      currentYear,
      activeProductsCount,
      totalProductsCount
    };
  }, [validOrders, products]);

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

  // 4.1 Mapeo de ventas acumuladas por producto
  const productSalesMap = useMemo(() => {
    const map = new Map<string, { totalUnitsSold: number; totalRevenueBob: number; orderCount: number }>();

    for (const ord of validOrders) {
      for (const it of ord.items || []) {
        const prod = it.item || (it as any);
        const qty = Number(it.quantity) || 1;
        const unitPrice = Number(prod?.price) || 0;
        const lineRevenue = unitPrice * qty;
        const prodSku = (prod?.sku ? String(prod.sku).trim() : '').toUpperCase();
        const prodName = (prod?.name || prod?.title || '').trim().toLowerCase();

        const key = prodSku || prodName;
        if (!key) continue;

        const existing = map.get(key);
        if (existing) {
          existing.totalUnitsSold += qty;
          existing.totalRevenueBob += lineRevenue;
          existing.orderCount += 1;
        } else {
          map.set(key, { totalUnitsSold: qty, totalRevenueBob: lineRevenue, orderCount: 1 });
        }
      }
    }
    return map;
  }, [validOrders]);

  // 4.2 Top Productos Más Vendidos
  const topProducts = useMemo(() => {
    const list: {
      id?: number;
      name: string;
      sku: string;
      imageUrl: string;
      brand: string;
      categoryName: string;
      totalUnitsSold: number;
      totalRevenueBob: number;
      currentStock: number;
    }[] = [];

    for (const prod of products) {
      const prodSku = (prod.sku ? String(prod.sku).trim() : '').toUpperCase();
      const prodName = (prod.name || prod.title || '').trim().toLowerCase();
      const sales = productSalesMap.get(prodSku) || productSalesMap.get(prodName);
      const unitsSold = sales?.totalUnitsSold || 0;
      const stockNow = Number(prod.stock !== undefined ? prod.stock : prod.stockQuantity) || 0;

      if (unitsSold > 0) {
        list.push({
          id: prod.id,
          name: prod.name || prod.title,
          sku: prod.sku,
          imageUrl:
            prod.image_url ||
            prod.imageUrl ||
            '/placeholder.webp',
          brand: prod.brand || 'Dubro',
          categoryName: prod.category?.name || 'Productos y Accesorios',
          totalUnitsSold: unitsSold,
          totalRevenueBob: sales?.totalRevenueBob || 0,
          currentStock: stockNow
        });
      }
    }

    list.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);
    return list;
  }, [products, productSalesMap]);

  // 4.3 Productos Menos Vendidos que se Quedaron con Stock por Mucho Tiempo (Stock Estancado / Dead Stock)
  const stagnantProducts = useMemo(() => {
    const list: {
      id?: number;
      name: string;
      sku: string;
      imageUrl: string;
      brand: string;
      categoryName: string;
      totalUnitsSold: number;
      currentStock: number;
      price: number;
      immobilizedCapitalBob: number;
      isZeroSales: boolean;
    }[] = [];

    for (const prod of products) {
      const prodSku = (prod.sku ? String(prod.sku).trim() : '').toUpperCase();
      const prodName = (prod.name || prod.title || '').trim().toLowerCase();
      const sales = productSalesMap.get(prodSku) || productSalesMap.get(prodName);
      const unitsSold = sales?.totalUnitsSold || 0;
      const stockNow = Number(prod.stock !== undefined ? prod.stock : prod.stockQuantity) || 0;
      const priceNow = Number(prod.price) || 0;

      // Criterio de stock estancado: productos con stock disponible retenido en almacén (stock > 0) y ventas nulas o muy bajas (<= 2)
      if (stockNow > 0 && unitsSold <= 2) {
        list.push({
          id: prod.id,
          name: prod.name || prod.title,
          sku: prod.sku,
          imageUrl:
            prod.image_url ||
            prod.imageUrl ||
            '/placeholder.webp',
          brand: prod.brand || 'Dubro',
          categoryName: prod.category?.name || 'Productos y Accesorios',
          totalUnitsSold: unitsSold,
          currentStock: stockNow,
          price: priceNow,
          immobilizedCapitalBob: stockNow * priceNow,
          isZeroSales: unitsSold === 0
        });
      }
    }

    // Ordenar: primero los de 0 ventas (más críticos), luego por mayor capital inmovilizado
    list.sort((a, b) => {
      if (a.totalUnitsSold !== b.totalUnitsSold) {
        return a.totalUnitsSold - b.totalUnitsSold;
      }
      return b.immobilizedCapitalBob - a.immobilizedCapitalBob;
    });

    return list;
  }, [products, productSalesMap]);

  const totalImmobilizedCapitalBob = useMemo(() => {
    return stagnantProducts.reduce((sum, p) => sum + p.immobilizedCapitalBob, 0);
  }, [stagnantProducts]);

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

  const filteredStagnantProducts = useMemo(() => {
    if (!productSearch.trim()) return stagnantProducts;
    const q = productSearch.toLowerCase().trim();
    return stagnantProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [stagnantProducts, productSearch]);

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
          productName: prod?.name || prod?.title || 'Producto Hobby Bolivia',
          productSku: prod?.sku || 'N/A',
          productImage:
            prod?.image_url ||
            prod?.imageUrl ||
            '/placeholder.webp',
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
    const byDay = new Map<string, PeriodicItem>();
    const byWeek = new Map<string, PeriodicItem>();
    const byMonth = new Map<string, PeriodicItem>();
    const byYear = new Map<string, PeriodicItem>();

    for (const ord of validOrders) {
      const d = ord.createdAt ? new Date(ord.createdAt) : new Date();
      const amount = Number(ord.total) || 0;

      // 6.1 Por Día
      const dayKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const shortDay = `${d.getDate()} ${d.toLocaleDateString('es-BO', { month: 'short' })}`;
      const subDay = d.toLocaleDateString('es-BO', { weekday: 'short' });
      const dayEntry = byDay.get(dayKey);
      if (dayEntry) {
        dayEntry.orderCount += 1;
        dayEntry.totalBob += amount;
      } else {
        byDay.set(dayKey, {
          label: dayLabel,
          shortLabel: shortDay,
          subLabel: subDay,
          orderCount: 1,
          totalBob: amount,
          rawKey: dayKey
        });
      }

      // 6.2 Por Semana (Lunes a Domingo)
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

      const weekKey = `${monday.getFullYear()}-${monMonth}-${monDay}`;
      const weekLabel = `Semana: Lunes ${monDay}/${monMonth} al Domingo ${sunDay}/${sunMonth}/${sunYear}`;
      const shortWeek = `Sem. ${monDay}/${monMonth}`;
      const subWeek = `al ${sunDay}/${sunMonth}`;

      const weekEntry = byWeek.get(weekKey);
      if (weekEntry) {
        weekEntry.orderCount += 1;
        weekEntry.totalBob += amount;
      } else {
        byWeek.set(weekKey, {
          label: weekLabel,
          shortLabel: shortWeek,
          subLabel: subWeek,
          orderCount: 1,
          totalBob: amount,
          rawKey: weekKey
        });
      }

      // 6.3 Por Mes (Ej: "Octubre 2026")
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('es-BO', {
        month: 'long',
        year: 'numeric'
      });
      const formattedMonthLabel =
        monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      const shortMonth = formattedMonthLabel.split(' ')[0];
      const subMonth = formattedMonthLabel.split(' ')[1] || '';

      const monthEntry = byMonth.get(monthKey);
      if (monthEntry) {
        monthEntry.orderCount += 1;
        monthEntry.totalBob += amount;
      } else {
        byMonth.set(monthKey, {
          label: formattedMonthLabel,
          shortLabel: shortMonth,
          subLabel: subMonth,
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
        byYear.set(yearKey, {
          label: yearLabel,
          shortLabel: yearKey,
          subLabel: 'Gestión',
          orderCount: 1,
          totalBob: amount,
          rawKey: yearKey
        });
      }
    }

    const sortDesc = (map: Map<string, PeriodicItem>) => {
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

  // Ítems de la Comparativa General de KPIs (Ventas del Día, Esta Semana, Mes Actual, Año Actual)
  const overviewItems: PeriodicItem[] = useMemo(() => [
    {
      label: 'Ventas del Día (Hoy)',
      shortLabel: 'Hoy',
      subLabel: 'Ventas del Día',
      orderCount: performanceMetrics.todayCount,
      totalBob: performanceMetrics.todayTotalBob,
      rawKey: '1-today'
    },
    {
      label: 'Esta Semana (Lun - Dom)',
      shortLabel: 'Esta Semana',
      subLabel: 'Lun - Dom',
      orderCount: performanceMetrics.thisWeekCount,
      totalBob: performanceMetrics.thisWeekTotalBob,
      rawKey: '2-week'
    },
    {
      label: `Mes Actual (${performanceMetrics.monthName})`,
      shortLabel: performanceMetrics.monthName,
      subLabel: 'Mes en Curso',
      orderCount: performanceMetrics.thisMonthCount,
      totalBob: performanceMetrics.thisMonthTotalBob,
      rawKey: '3-month'
    },
    {
      label: `Año ${performanceMetrics.currentYear}`,
      shortLabel: `Año ${performanceMetrics.currentYear}`,
      subLabel: 'Acumulado',
      orderCount: performanceMetrics.thisYearCount,
      totalBob: performanceMetrics.thisYearTotalBob,
      rawKey: '4-year'
    }
  ], [performanceMetrics]);

  // Selección de período activo para visualización
  const activePeriodData = useMemo(() => {
    switch (periodTab) {
      case 'OVERVIEW':
        return { title: 'Comparativa de Rendimiento Comercial', items: overviewItems, unit: 'Período' };
      case 'WEEK':
        return { title: 'Ventas por Semana (Lunes a Domingo)', items: periodicSales.byWeek, unit: 'Semana' };
      case 'MONTH':
        return { title: 'Ventas por Mes', items: periodicSales.byMonth, unit: 'Mes' };
      case 'DAY':
        return { title: 'Ventas por Día', items: periodicSales.byDay, unit: 'Día' };
      case 'YEAR':
        return { title: 'Ventas por Año', items: periodicSales.byYear, unit: 'Año' };
    }
  }, [periodTab, overviewItems, periodicSales]);

  // Ítems para el gráfico de barras verticales (ordenados cronológicamente de izquierda a derecha)
  const chartItems = useMemo(() => {
    if (periodTab === 'OVERVIEW') {
      return overviewItems;
    }
    return [...activePeriodData.items].reverse();
  }, [periodTab, overviewItems, activePeriodData]);

  // Altura máxima con 25% de margen superior para los valores flotantes
  const maxChartBob = useMemo(() => {
    const max = Math.max(...chartItems.map((i) => i.totalBob), 0);
    return max > 0 ? max * 1.25 : 1000;
  }, [chartItems]);

  // Valor máximo para barras proporcionales en vista de lista
  const maxPeriodTotal = useMemo(() => {
    return Math.max(...activePeriodData.items.map((i) => i.totalBob), 1);
  }, [activePeriodData]);

  const formatPrice = (num: number) => {
    const val = Number(num) || 0;
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

  const formatUsd = (num: number) =>
    `$${(Number(num) || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} USD`;

  // Paleta de colores cromática para barras (horizontales, verticales y lista)
  const getItemColor = (rawKey: string, index: number, isOverview: boolean) => {
    if (isOverview) {
      if (rawKey.includes('today')) {
        return {
          gradient: 'from-emerald-600 via-emerald-500 to-emerald-400',
          shadow: 'shadow-emerald-500/30',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      }
      if (rawKey.includes('week')) {
        return {
          gradient: 'from-indigo-600 via-indigo-500 to-indigo-400',
          shadow: 'shadow-indigo-500/30',
          border: 'border-indigo-300',
          text: 'text-indigo-700',
          badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          dot: 'bg-indigo-500'
        };
      }
      if (rawKey.includes('month')) {
        return {
          gradient: 'from-purple-600 via-purple-500 to-purple-400',
          shadow: 'shadow-purple-500/30',
          border: 'border-purple-300',
          text: 'text-purple-700',
          badge: 'bg-purple-50 text-purple-800 border-purple-200',
          dot: 'bg-purple-500'
        };
      }
      return {
        gradient: 'from-[#B88738] via-[#D4A359] to-[#E5BE7E]',
        shadow: 'shadow-[#D4A359]/35',
        border: 'border-[#D4A359]/50',
        text: 'text-[#B88738]',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-[#D4A359]'
      };
    }

    const PALETTE = [
      {
        gradient: 'from-emerald-600 via-emerald-500 to-emerald-400',
        shadow: 'shadow-emerald-500/30',
        border: 'border-emerald-300',
        text: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500'
      },
      {
        gradient: 'from-indigo-600 via-indigo-500 to-indigo-400',
        shadow: 'shadow-indigo-500/30',
        border: 'border-indigo-300',
        text: 'text-indigo-700',
        badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dot: 'bg-indigo-500'
      },
      {
        gradient: 'from-purple-600 via-purple-500 to-purple-400',
        shadow: 'shadow-purple-500/30',
        border: 'border-purple-300',
        text: 'text-purple-700',
        badge: 'bg-purple-50 text-purple-800 border-purple-200',
        dot: 'bg-purple-500'
      },
      {
        gradient: 'from-[#B88738] via-[#D4A359] to-[#E5BE7E]',
        shadow: 'shadow-[#D4A359]/35',
        border: 'border-[#D4A359]/50',
        text: 'text-[#B88738]',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-[#D4A359]'
      },
      {
        gradient: 'from-sky-600 via-sky-500 to-sky-400',
        shadow: 'shadow-sky-500/30',
        border: 'border-sky-300',
        text: 'text-sky-700',
        badge: 'bg-sky-50 text-sky-800 border-sky-200',
        dot: 'bg-sky-500'
      },
      {
        gradient: 'from-rose-600 via-rose-500 to-rose-400',
        shadow: 'shadow-rose-500/30',
        border: 'border-rose-300',
        text: 'text-rose-700',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500'
      },
      {
        gradient: 'from-teal-600 via-teal-500 to-teal-400',
        shadow: 'shadow-teal-500/30',
        border: 'border-teal-300',
        text: 'text-teal-700',
        badge: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-500'
      }
    ];

    return PALETTE[index % PALETTE.length];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ================= SECCIÓN 1: $ RENDIMIENTO DE VENTAS COMERCIALES ================= */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-serif font-black text-xl">$</span>
            <h2 className="text-lg font-black text-[#1A1817] tracking-tight">
              Rendimiento de Ventas Comerciales
            </h2>
          </div>
          <span className="text-xs text-[#8C827A] font-medium">
            Moneda activa: <strong className="text-[#1A1817]">{isBsMode ? 'Bolivianos (Bs.)' : 'Dólares ($ USD)'}</strong> · TC Oficial: 1 USD = Bs. {exchangeRate.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: VENTAS DEL DÍA */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden border-t-4 border-t-emerald-500 hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Ventas del Día
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono tracking-tight">
                {formatBs(performanceMetrics.todayTotalBob)}
              </p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8C827A] font-medium">Hoy</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  {performanceMetrics.todayCount} pedidos
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: ESTA SEMANA */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden border-t-4 border-t-indigo-500 hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Esta Semana
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-indigo-700" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono tracking-tight">
                {formatBs(performanceMetrics.thisWeekTotalBob)}
              </p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8C827A] font-medium">Lun - Dom</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                  {performanceMetrics.thisWeekCount} pedidos
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: MES (MES ACTUAL) */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden border-t-4 border-t-purple-500 hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Mes ({performanceMetrics.monthName})
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-700" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono tracking-tight">
                {formatBs(performanceMetrics.thisMonthTotalBob)}
              </p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8C827A] font-medium text-[11px]">
                  Ticket prom: {formatBs(performanceMetrics.thisMonthAverageTicket)}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                  {performanceMetrics.thisMonthCount} pedidos
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: AÑO ACTUAL */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden border-t-4 border-t-[#D4A359] hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Año {performanceMetrics.currentYear}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#D4A359]/20 text-[#8A6220] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#8A6220]" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl sm:text-3xl font-black text-[#1A1817] font-mono tracking-tight">
                {formatBs(performanceMetrics.thisYearTotalBob)}
              </p>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#8C827A] font-medium">Acumulado {performanceMetrics.currentYear}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4A359]/20 text-[#8A6220]">
                  {performanceMetrics.thisYearCount} pedidos
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= GRÁFICO DE BARRAS DE RENDIMIENTO ================= */}
        <div className="bg-[#FAF8F5] rounded-3xl p-4 sm:p-6 border border-[#E2DCD3] shadow-sm space-y-5 w-full max-w-full overflow-hidden">
          {/* Cabecera del Gráfico con Controles */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E2DCD3]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {chartViewMode === 'HORIZONTAL' ? (
                  <BarChart2 className="w-4 h-4 text-[#D4A359]" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-[#D4A359]" />
                )}
                <span className="text-xs font-black uppercase tracking-wider text-[#D4A359]">
                  {chartViewMode === 'HORIZONTAL'
                    ? 'Gráfico de Barras Horizontales · Rendimiento en Colores'
                    : 'Gráfico de Barras Verticales · Tendencia de Ingresos'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#1A1817]">
                {activePeriodData.title}
              </h3>
              <p className="text-xs text-[#8C827A] mt-0.5">
                Volumen de facturación expresado en Dólares (USD) y cantidad de pedidos por período.
              </p>
            </div>

            {/* Controles: Tabs de Período + Selector Gráfico/Lista (Desplazamiento horizontal fluido en móviles) */}
            <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2.5 w-full lg:w-auto max-w-full">
              {/* Tabs de Período */}
              <div className="w-full sm:w-auto overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 touch-pan-x">
                <div className="inline-flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPeriodTab('OVERVIEW')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${periodTab === 'OVERVIEW'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    Comparativa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab('WEEK')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${periodTab === 'WEEK'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    Por Semana
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab('MONTH')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${periodTab === 'MONTH'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    Por Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab('DAY')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${periodTab === 'DAY'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    Por Día
                  </button>
                  <button
                    type="button"
                    onClick={() => setPeriodTab('YEAR')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${periodTab === 'YEAR'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    Por Año
                  </button>
                </div>
              </div>

              {/* View Switcher: Barras Horizontales vs Barras Verticales */}
              <div className="overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 touch-pan-x">
                <div className="inline-flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setChartViewMode('HORIZONTAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${chartViewMode === 'HORIZONTAL'
                      ? 'bg-[#D4A359] text-[#161311] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                    title="Ver Gráfico de Barras Horizontales con Colores"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>Barras Horiz.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartViewMode('VERTICAL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${chartViewMode === 'VERTICAL'
                      ? 'bg-[#D4A359] text-[#161311] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                    title="Ver Gráfico de Barras Verticales con Colores"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Barras Vert.</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CUERPO DEL GRÁFICO / LISTA */}
          {chartItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#8C827A] bg-white rounded-2xl border border-[#E2DCD3]">
              No se registran ventas para este período seleccionado.
            </div>
          ) : chartViewMode === 'HORIZONTAL' ? (
            /* ================= GRÁFICO DE BARRAS HORIZONTALES ================= */
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2DCD3] shadow-2xs space-y-3.5">
              {chartItems.map((item, idx) => {
                const maxVal = Math.max(...chartItems.map((c) => c.totalBob), 1);
                const barWidthPercent = Math.max(Math.round((item.totalBob / maxVal) * 100), item.totalBob > 0 ? 8 : 2);
                const colorStyle = getItemColor(item.rawKey, idx, periodTab === 'OVERVIEW');

                return (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5]/80 border border-[#E2DCD3] hover:border-[#D4A359] hover:bg-[#FAF8F5] transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`w-3 h-3 rounded-full shrink-0 shadow-xs ${colorStyle.dot}`} />
                        <span className="font-black text-sm text-[#1A1817]">
                          {item.label}
                        </span>
                        {item.subLabel && (
                          <span className="text-[11px] text-[#8C827A] font-medium">
                            · {item.subLabel}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorStyle.badge}`}>
                          {item.orderCount} {item.orderCount === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </div>

                      <div className="text-right shrink-0 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                        <span className="font-mono font-black text-sm sm:text-base text-[#1A1817]">
                          {formatBs(item.totalBob)}
                        </span>
                        <span className="font-mono text-[11px] text-[#8C827A]">
                          {formatUsd(exchangeRate > 0 ? item.totalBob / exchangeRate : 0)}
                        </span>
                      </div>
                    </div>

                    {/* Pista y Barra Horizontal Rellena con Color */}
                    <div className="w-full h-8 bg-white rounded-xl p-1 border border-[#E2DCD3] relative overflow-hidden flex items-center shadow-2xs">
                      <div
                        className={`h-full rounded-lg bg-gradient-to-r ${colorStyle.gradient} transition-all duration-700 ease-out flex items-center justify-end px-3 shadow-xs ${colorStyle.shadow}`}
                        style={{ width: `${barWidthPercent}%` }}
                        title={`${item.label} · ${formatBs(item.totalBob)} (${barWidthPercent}%)`}
                      >
                        {barWidthPercent >= 16 && (
                          <span className="text-[11px] font-mono font-black text-white drop-shadow-xs">
                            {Math.round((item.totalBob / maxVal) * 100)}%
                          </span>
                        )}
                      </div>
                      {barWidthPercent < 16 && item.totalBob > 0 && (
                        <span className="text-[11px] font-mono font-black text-[#5C5650] ml-2.5">
                          {Math.round((item.totalBob / maxVal) * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= GRÁFICO DE BARRAS VERTICALES CON COLORES ================= */
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#E2DCD3] shadow-2xs">
              <div className="relative pt-6 pb-2">
                {/* Líneas Guía del Eje Y */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-6 pl-14 sm:pl-18">
                  <div className="border-b border-dashed border-[#E2DCD3] w-full relative">
                    <span className="text-[10px] font-mono text-[#8C827A] -translate-y-2.5 absolute left-[-56px] sm:left-[-72px] w-12 sm:w-16 text-right">
                      {formatBs(maxChartBob)}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-[#E2DCD3] w-full relative">
                    <span className="text-[10px] font-mono text-[#8C827A] -translate-y-2.5 absolute left-[-56px] sm:left-[-72px] w-12 sm:w-16 text-right">
                      {formatBs(maxChartBob * 0.75)}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-[#E2DCD3] w-full relative">
                    <span className="text-[10px] font-mono text-[#8C827A] -translate-y-2.5 absolute left-[-56px] sm:left-[-72px] w-12 sm:w-16 text-right">
                      {formatBs(maxChartBob * 0.5)}
                    </span>
                  </div>
                  <div className="border-b border-dashed border-[#E2DCD3] w-full relative">
                    <span className="text-[10px] font-mono text-[#8C827A] -translate-y-2.5 absolute left-[-56px] sm:left-[-72px] w-12 sm:w-16 text-right">
                      {formatBs(maxChartBob * 0.25)}
                    </span>
                  </div>
                  <div className="border-b-2 border-[#1A1817] w-full relative">
                    <span className="text-[10px] font-mono text-[#1A1817] font-bold -translate-y-2.5 absolute left-[-56px] sm:left-[-72px] w-12 sm:w-16 text-right">
                      $0 USD
                    </span>
                  </div>
                </div>

                {/* Columnas de Barras Verticales */}
                <div className="pl-14 sm:pl-18 overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex items-end justify-around gap-3 sm:gap-6 min-w-[520px] h-72 sm:h-80 pt-6 pb-12">
                    {chartItems.map((item, idx) => {
                      const barHeightPercent = maxChartBob > 0 ? Math.round((item.totalBob / maxChartBob) * 100) : 0;
                      const maxVal = Math.max(...chartItems.map((c) => c.totalBob), 1);
                      const colorStyle = getItemColor(item.rawKey, idx, periodTab === 'OVERVIEW');

                      return (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[70px] sm:min-w-[90px]"
                        >
                          {/* Floating Info on Top */}
                          <div className="mb-2 text-center transition-transform group-hover:-translate-y-1 z-10">
                            <span className="font-mono font-black text-xs sm:text-sm text-[#1A1817] block whitespace-nowrap">
                              {formatBs(item.totalBob)}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap shadow-2xs ${colorStyle.badge}`}>
                              {item.orderCount} {item.orderCount === 1 ? 'pedido' : 'pedidos'}
                            </span>
                          </div>

                          {/* Columna Vertical de la Barra */}
                          <div
                            className="w-full max-w-[56px] sm:max-w-[74px] bg-[#FAF8F5] border border-[#E2DCD3] rounded-t-2xl relative overflow-hidden flex items-end justify-center shadow-2xs group-hover:border-[#D4A359] group-hover:shadow-md transition-all cursor-pointer"
                            style={{ height: '100%' }}
                            title={`${item.label} · ${formatBs(item.totalBob)} en ${item.orderCount} pedido(s)`}
                          >
                            {/* Barra Rellena con Gradiente de Color */}
                            <div
                              className={`w-full rounded-t-2xl transition-all duration-700 ease-out flex flex-col justify-between items-center py-2 bg-gradient-to-t ${colorStyle.gradient} shadow-md ${colorStyle.shadow}`}
                              style={{ height: `${Math.max(barHeightPercent, item.totalBob > 0 ? 8 : 2)}%` }}
                            >
                              {barHeightPercent >= 22 && (
                                <span className="text-[10px] font-mono font-black text-white drop-shadow-xs">
                                  {Math.round((item.totalBob / maxVal) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Etiquetas del Eje X */}
                          <div className="mt-3 text-center w-full px-1">
                            <p className="font-black text-xs text-[#1A1817] truncate" title={item.label}>
                              {item.shortLabel}
                            </p>
                            {item.subLabel && (
                              <p className="text-[10px] text-[#8C827A] truncate font-medium mt-0.5">
                                {item.subLabel}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= BANNER: TOTAL FACTURADO HISTÓRICO ================= */}
      <div className="bg-[#183522] text-[#FAF8F5] rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-emerald-900/40">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <div className="w-6 h-6 rounded-md bg-emerald-800/60 flex items-center justify-center shrink-0 text-emerald-300">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <span>
            Total Facturado Histórico: <strong className="text-white font-mono font-black">{formatBs(salesSummary.totalAccumulatedSalesBob)}</strong> en <strong className="text-emerald-300">{salesSummary.totalOrdersCount} pedidos</strong> procesados con éxito.
          </span>
        </div>

        <Link
          href="/admin/quotes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors shrink-0 group"
        >
          <span>Ver reporte de transacciones</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ================= SECCIÓN 2: ESTADO OPERATIVO & DESPACHO ================= */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 pb-1">
          <Clock className="w-5 h-5 text-[#8C827A]" />
          <h2 className="text-lg font-black text-[#1A1817] tracking-tight">
            Estado Operativo & Despacho
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Op Card 1: POR DESPACHAR */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Por Despachar
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#1A1817] tracking-tight font-mono">
                {salesSummary.toDispatchCount}
              </p>
              <p className="text-xs text-[#8C827A] pt-1">
                En preparación en almacén Hobby Bolivia
              </p>
            </div>
          </div>

          {/* Op Card 2: EN RUTA / ENTREGAS */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                En Ruta / Entregas
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#1A1817] tracking-tight font-mono">
                {salesSummary.dispatchedCount}
              </p>
              <p className="text-xs text-[#8C827A] pt-1">
                {salesSummary.dispatchedCount === 1 ? '1 pedido en tránsito a destino' : `${salesSummary.dispatchedCount} pedidos en tránsito a destino`}
              </p>
            </div>
          </div>

          {/* Op Card 3: PEDIDOS ENTREGADOS */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Pedidos Entregados
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#1A1817] tracking-tight font-mono">
                {salesSummary.deliveredCount}
              </p>
              <p className="text-xs text-[#3E7B44] font-medium pt-1">
                {salesSummary.deliverySuccessRate}% efectividad de entrega
              </p>
            </div>
          </div>

          {/* Op Card 4: CATÁLOGO ACTIVO */}
          <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#E2DCD3] shadow-sm relative overflow-hidden group hover:border-[#D4A359]/60 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10.5px] font-black uppercase tracking-wider text-[#5C5650]">
                Catálogo Activo
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#211E1C] text-[#D4A359] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#D4A359]" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-[#1A1817] tracking-tight font-mono">
                {performanceMetrics.activeProductsCount} / {performanceMetrics.totalProductsCount}
              </p>
              <div className="flex items-center justify-between gap-1 pt-1">
                <span className="text-xs text-[#8C827A]">Productos en catálogo</span>
                {stagnantProducts.length > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    ⚠️ {stagnantProducts.length} estancados
                  </span>
                )}
              </div>
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

            {/* Producto Adquirido */}
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

      {/* 4. DOS COLUMNAS: REPORTE DE CLIENTES QUE COMPRARON MÁS Y CONTROL DE ROTACIÓN DE STOCK */}
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
                        className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${idx === 0
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

        {/* COLUMNA 2: ROTACIÓN DE INVENTARIO (MÁS VENDIDOS & STOCK ESTANCADO) */}
        <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-[#E2DCD3] shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DCD3]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A359] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>Control de Inventario & Rotación</span>
                </span>
                <h3 className="text-lg font-black text-[#1A1817] mt-0.5">
                  {productTab === 'BEST_SELLERS' ? 'Productos Más Vendidos' : 'Stock Estancado / Menor Rotación'}
                </h3>
              </div>

              {/* Tabs Más Vendidos vs Stock Estancado (Desplazamiento fluido en móviles) */}
              <div className="w-full sm:w-auto overflow-x-auto whitespace-nowrap scrollbar-none py-0.5 touch-pan-x">
                <div className="inline-flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E2DCD3] shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setProductTab('BEST_SELLERS')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${productTab === 'BEST_SELLERS'
                      ? 'bg-[#211E1C] text-[#D4A359] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Más Vendidos ({topProducts.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductTab('STAGNANT_STOCK')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${productTab === 'STAGNANT_STOCK'
                      ? 'bg-amber-500 text-[#161311] shadow-xs'
                      : 'text-[#8C827A] hover:text-[#1A1817]'
                      }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Stock Estancado ({stagnantProducts.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Banner de Diagnóstico para Stock Estancado */}
            {productTab === 'STAGNANT_STOCK' && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">
                    Alerta de Baja Rotación: {stagnantProducts.length} productos sin ventas o con rotación mínima.
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Capital inmovilizado en almacén: <strong className="font-mono font-black">{formatBs(totalImmobilizedCapitalBob)}</strong>. Considera aplicar promociones o liquidaciones para liberar inventario.
                  </p>
                </div>
              </div>
            )}

            {/* Buscador de Productos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#8C827A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  productTab === 'BEST_SELLERS'
                    ? "Buscar por nombre, SKU o marca..."
                    : "Buscar producto con stock estancado..."
                }
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#E2DCD3] rounded-xl text-[#1A1817] placeholder:text-[#8C827A] focus:border-[#D4A359] outline-none font-medium"
              />
            </div>

            {/* Lista: Más Vendidos vs Stock Estancado */}
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {productTab === 'BEST_SELLERS' ? (
                filteredProductsReport.length === 0 ? (
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
                )
              ) : (
                filteredStagnantProducts.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8C827A]">
                    No se encontraron productos estancados con este criterio.
                  </div>
                ) : (
                  filteredStagnantProducts.map((prod, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-2xl border border-amber-200/80 hover:border-amber-400 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-amber-50/50 p-1 border border-amber-200 flex items-center justify-center shrink-0">
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
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${prod.isZeroSales ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {prod.isZeroSales ? 'Sin Ventas' : 'Baja Rotación'}
                            </span>
                          </div>
                          <p className="font-black text-xs text-[#1A1817] truncate" title={prod.name}>
                            {prod.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-[#5C5650] pt-0.5">
                            <span>Stock retenido: <strong className="text-amber-800 font-bold">{prod.currentStock} unid.</strong></span>
                            <span>·</span>
                            <span>Precio: <strong className="font-mono">{formatBs(prod.price)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs block ${prod.isZeroSales ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                          {prod.totalUnitsSold} vendidas
                        </span>
                        <div className="mt-1">
                          <span className="text-[10px] text-[#8C827A] block leading-none">Inmovilizado:</span>
                          <span className="font-mono font-black text-xs text-[#1A1817]">
                            {formatBs(prod.immobilizedCapitalBob)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
