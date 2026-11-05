import { NextRequest, NextResponse } from 'next/server';
import { getQuoteOrders, getAllProductsAdmin, getExchangeRateDb } from '@/lib/db';
import { getOrderAmounts } from '@/lib/order-utils';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdmin(request);
    if (authCheck instanceof NextResponse) return authCheck;

    const [orders, products, rateData] = await Promise.all([
      getQuoteOrders().catch(() => []),
      getAllProductsAdmin().catch(() => []),
      getExchangeRateDb().catch(() => ({ exchangeRate: 12.10, autoUpdate: true, lastChecked: new Date().toISOString() }))
    ]);

    const exchangeRate = Number(rateData?.exchangeRate) || 12.10;

    // Filtrar pedidos válidos (excluyendo cancelados)
    const validOrders = orders.filter(
      (o) => o.status !== 'CANCELLED' && (o.status as any) !== 'CANCELADO'
    );

    const now = new Date();
    const todayStr = now.toDateString();

    // 1. Ventas del Día (Hoy: 00:00 a 23:59)
    const todayOrders = validOrders.filter(
      (o) => o.createdAt && new Date(o.createdAt).toDateString() === todayStr
    );
    let todayTotalBob = 0;
    let todayTotalUsd = 0;
    for (const o of todayOrders) {
      const amt = getOrderAmounts(o, exchangeRate);
      todayTotalBob += amt.bob;
      todayTotalUsd += amt.usd;
    }
    const todayCount = todayOrders.length;

    // 2. Esta Semana (Lunes a Domingo)
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
    let thisWeekTotalBob = 0;
    let thisWeekTotalUsd = 0;
    for (const o of thisWeekOrders) {
      const amt = getOrderAmounts(o, exchangeRate);
      thisWeekTotalBob += amt.bob;
      thisWeekTotalUsd += amt.usd;
    }
    const thisWeekCount = thisWeekOrders.length;

    // 3. Mes Actual
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    const thisMonthOrders = validOrders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonthIndex;
    });
    let thisMonthTotalBob = 0;
    let thisMonthTotalUsd = 0;
    for (const o of thisMonthOrders) {
      const amt = getOrderAmounts(o, exchangeRate);
      thisMonthTotalBob += amt.bob;
      thisMonthTotalUsd += amt.usd;
    }
    const thisMonthCount = thisMonthOrders.length;
    const thisMonthAverageTicketBob = thisMonthCount > 0 ? thisMonthTotalBob / thisMonthCount : 0;
    const thisMonthAverageTicketUsd = thisMonthCount > 0 ? thisMonthTotalUsd / thisMonthCount : 0;

    // 4. Año Actual
    const thisYearOrders = validOrders.filter((o) => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear;
    });
    let thisYearTotalBob = 0;
    let thisYearTotalUsd = 0;
    for (const o of thisYearOrders) {
      const amt = getOrderAmounts(o, exchangeRate);
      thisYearTotalBob += amt.bob;
      thisYearTotalUsd += amt.usd;
    }
    const thisYearCount = thisYearOrders.length;

    // Totales históricos acumulados
    let totalAccumulatedSalesBob = 0;
    let totalAccumulatedSalesUsd = 0;
    for (const o of validOrders) {
      const amt = getOrderAmounts(o, exchangeRate);
      totalAccumulatedSalesBob += amt.bob;
      totalAccumulatedSalesUsd += amt.usd;
    }

    return NextResponse.json({
      success: true,
      exchangeRate,
      metrics: {
        today: {
          totalUsd: Number(todayTotalUsd.toFixed(2)),
          totalBob: Number(todayTotalBob.toFixed(2)),
          orderCount: todayCount
        },
        thisWeek: {
          totalUsd: Number(thisWeekTotalUsd.toFixed(2)),
          totalBob: Number(thisWeekTotalBob.toFixed(2)),
          orderCount: thisWeekCount
        },
        thisMonth: {
          totalUsd: Number(thisMonthTotalUsd.toFixed(2)),
          totalBob: Number(thisMonthTotalBob.toFixed(2)),
          orderCount: thisMonthCount,
          averageTicketUsd: Number(thisMonthAverageTicketUsd.toFixed(2)),
          averageTicketBob: Number(thisMonthAverageTicketBob.toFixed(2)),
          monthName: now.toLocaleDateString('es-BO', { month: 'long' }).toUpperCase()
        },
        thisYear: {
          totalUsd: Number(thisYearTotalUsd.toFixed(2)),
          totalBob: Number(thisYearTotalBob.toFixed(2)),
          orderCount: thisYearCount,
          year: currentYear
        },
        accumulated: {
          totalUsd: Number(totalAccumulatedSalesUsd.toFixed(2)),
          totalBob: Number(totalAccumulatedSalesBob.toFixed(2)),
          totalOrdersCount: validOrders.length
        },
        productsCount: {
          active: products.filter((p) => p.is_active !== false && p.isActive !== false).length,
          total: products.length
        }
      }
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/metrics:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error al calcular métricas' },
      { status: 500 }
    );
  }
}

