'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CatalogItem, CartItem } from '@/lib/types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CatalogItem, quantity?: number, selectedOptions?: Record<string, string>) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  selectedItemForOptions: CatalogItem | null;
  openOptionsModal: (item: CatalogItem) => void;
  closeOptionsModal: () => void;
  isCustomModalOpen: boolean;
  openCustomModal: () => void;
  closeCustomModal: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<CatalogItem | null>(null);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hb_cart');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem('hb_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const addToCart = (item: CatalogItem, quantity = 1, selectedOptions?: Record<string, string>) => {
    setCartItems((prev) => {
      // Check if existing
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.item.id === item.id &&
          JSON.stringify(ci.selectedOptions || {}) === JSON.stringify(selectedOptions || {})
      );

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += quantity;
        return copy;
      } else {
        return [...prev, { item, quantity, selectedOptions }];
      }
    });
    setIsDrawerOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prev) => {
      const copy = [...prev];
      copy[index].quantity = quantity;
      return copy;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const openOptionsModal = (item: CatalogItem) => setSelectedItemForOptions(item);
  const closeOptionsModal = () => setSelectedItemForOptions(null);

  const openCustomModal = () => setIsCustomModalOpen(true);
  const closeCustomModal = () => setIsCustomModalOpen(false);

  const totalCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
  const subtotal = cartItems.reduce((acc, ci) => acc + ci.item.price * ci.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        selectedItemForOptions,
        openOptionsModal,
        closeOptionsModal,
        isCustomModalOpen,
        openCustomModal,
        closeCustomModal,
        totalCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
