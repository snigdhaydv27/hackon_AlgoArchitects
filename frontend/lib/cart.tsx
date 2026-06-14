"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    category: string;
    brand?: string;
    originalPrice: number;
    images: string[];
  };
  variant: string;
  quantity: number;
}

interface CartData {
  _id: string;
  items: CartItem[];
}

interface CartCtx {
  cart: CartData | null;
  loading: boolean;
  itemCount: number;
  totalAmount: number;
  addToCart: (productId: string, variant?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try {
      const data = await api<CartData>("/cart");
      setCart(data);
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addToCart(productId: string, variant?: string) {
    setLoading(true);
    try {
      const data = await api<CartData>("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, variant: variant || "" }),
      });
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(itemId: string) {
    const data = await api<CartData>(`/cart/item/${itemId}`, { method: "DELETE" });
    setCart(data);
  }

  async function updateQuantity(itemId: string, quantity: number) {
    const data = await api<CartData>(`/cart/item/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
  }

  const itemCount = cart?.items.reduce((sum, i) => sum + (i.quantity || 1), 0) ?? 0;
  const totalAmount = cart?.items.reduce((sum, i) => sum + (i.productId?.originalPrice || 0) * (i.quantity || 1), 0) ?? 0;

  return (
    <Ctx.Provider value={{ cart, loading, itemCount, totalAmount, addToCart, removeItem, updateQuantity, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be inside CartProvider");
  return v;
}
