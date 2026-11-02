'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const CartQuoteDrawer = dynamic(
  () => import('@/components/catalog/CartQuoteDrawer').then((m) => m.CartQuoteDrawer),
  { ssr: false }
);
const ProductOptionsModal = dynamic(
  () => import('@/components/catalog/ProductOptionsModal').then((m) => m.ProductOptionsModal),
  { ssr: false }
);
const CustomArrangementModal = dynamic(
  () => import('@/components/catalog/CustomArrangementModal').then((m) => m.CustomArrangementModal),
  { ssr: false }
);

export function ClientModals() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CartQuoteDrawer />
      <ProductOptionsModal />
      <CustomArrangementModal />
    </>
  );
}
