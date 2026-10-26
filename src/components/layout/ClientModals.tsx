'use client';

import React, { useEffect, useState } from 'react';
import { CartQuoteDrawer } from '@/components/catalog/CartQuoteDrawer';
import { ProductOptionsModal } from '@/components/catalog/ProductOptionsModal';
import { CustomArrangementModal } from '@/components/catalog/CustomArrangementModal';

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
