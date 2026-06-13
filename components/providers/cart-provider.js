"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Toast from "@/components/toast";
import { useAuth } from "@/components/providers/auth-provider";
import { mergeCart, saveCart } from "@/lib/api-client";

const CartContext = createContext(null);
const STORAGE_KEY = "yungdrip-cart";

function isValidCartItem(item) {
  return Boolean(
    item &&
      typeof item.cartKey === "string" &&
      typeof item.productId === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(item.price) &&
      typeof item.image === "string" &&
      typeof item.size === "string" &&
      typeof item.color === "string" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
  );
}

function isValidProductForCart(product, selection) {
  return Boolean(
    product &&
      typeof product._id === "string" &&
      typeof product.name === "string" &&
      Number.isFinite(product.price) &&
      Array.isArray(product.images) &&
      typeof product.images[0] === "string" &&
      Array.isArray(product.sizes) &&
      product.sizes.includes(selection.size) &&
      Array.isArray(product.colors) &&
      product.colors.includes(selection.color)
  );
}

function getAvailableStock(product) {
  return Number.isInteger(product?.stock) ? product.stock : null;
}

export function CartProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [toast, setToast] = useState(null);
  const syncedUserIdRef = useRef(null);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);

    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart);
        setItems(Array.isArray(parsedItems) ? parsedItems.filter(isValidCartItem) : []);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!isHydrated || authLoading) {
      return;
    }

    if (!user) {
      syncedUserIdRef.current = null;
      return;
    }

    if (syncedUserIdRef.current === user._id) {
      return;
    }

    let cancelled = false;

    async function syncCartWithServer() {
      try {
        const localItems = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        const payload = await mergeCart({ items: Array.isArray(localItems) ? localItems : [] });

        if (!cancelled) {
          skipNextSaveRef.current = true;
          setItems(Array.isArray(payload.items) ? payload.items.filter(isValidCartItem) : []);
          syncedUserIdRef.current = user._id;
        }
      } catch {
        if (!cancelled) {
          syncedUserIdRef.current = user._id;
        }
      }
    }

    syncCartWithServer();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isHydrated, user]);

  useEffect(() => {
    if (!isHydrated || authLoading || !user) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      saveCart({ items }).catch(() => {});
    }, 400);

    return () => window.clearTimeout(timer);
  }, [authLoading, isHydrated, items, user]);

  const showToast = useCallback((message) => {
    setToast(message);
  }, []);

  const addItem = useCallback((product, selection) => {
    if (!isValidProductForCart(product, selection)) {
      showToast("This product is unavailable for cart.");
      return false;
    }

    const availableStock = getAvailableStock(product);

    if (availableStock !== null && availableStock <= 0) {
      showToast(`${product.name} is out of stock.`);
      return false;
    }

    const cartItem = {
      cartKey: `${product._id}-${selection.size}-${selection.color}`,
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selection.size,
      color: selection.color,
      quantity: 1
    };

    let didAdd = false;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartKey === cartItem.cartKey);
      const nextQuantity = existingItem ? existingItem.quantity + 1 : 1;

      if (availableStock !== null && nextQuantity > availableStock) {
        showToast(`Only ${availableStock} left in stock.`);
        return currentItems;
      }

      didAdd = true;

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartItem.cartKey
            ? { ...item, quantity: nextQuantity }
            : item
        );
      }

      return [...currentItems, cartItem];
    });

    if (didAdd) {
      showToast(`${product.name} added to cart`);
    }

    return didAdd;
  }, [showToast]);

  const removeItem = useCallback(
    (cartKey) => {
      setItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
      showToast("Item removed from cart");
    },
    [showToast]
  );

  const updateQuantity = useCallback((cartKey, nextQuantity) => {
    if (nextQuantity <= 0) {
      removeItem(cartKey);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: nextQuantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    showToast("Cart cleared");
  }, [showToast]);

  const value = useMemo(
    () => ({
      items,
      isHydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      cartTotal: items.reduce((total, item) => total + item.price * item.quantity, 0)
    }),
    [addItem, clearCart, isHydrated, items, removeItem, updateQuantity]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast message={toast} onClose={() => setToast(null)} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
