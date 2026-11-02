import React from 'react';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import { getAllProductsAdmin, getQuoteOrders, getExchangeRateDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [products, orders, rateData] = await Promise.all([
    getAllProductsAdmin().catch(() => []),
    getQuoteOrders().catch(() => []),
    getExchangeRateDb().catch(() => ({ exchangeRate: 6.96, autoUpdate: true, lastChecked: new Date().toISOString() }))
  ]);

  return (
    <AdminDashboardClient
      initialProducts={products}
      initialOrders={orders}
      initialExchangeRate={rateData?.exchangeRate || 6.96}
      initialAutoUpdate={rateData?.autoUpdate !== false}
      initialLastUpdatedStr={rateData?.lastChecked ? new Date(rateData.lastChecked).toLocaleString('es-BO') : ''}
    />
  );
}
