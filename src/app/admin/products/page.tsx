import React from 'react';
import { AdminProductsClient } from '@/components/admin/AdminProductsClient';

export const metadata = {
  title: 'Productos y Stock | Hobby Bolivia Admin',
  description: 'Gestión de catálogo, edición de precios y control de inventario de repuestos de aeromodelismo.'
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
