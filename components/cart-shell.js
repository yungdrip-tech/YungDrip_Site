"use client";

import Link from "next/link";
import CartItem from "@/components/cart-item";
import Button from "@/components/button";
import { useCart } from "@/components/providers/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartShell() {
  const { items, cartTotal, cartCount, updateQuantity, removeItem, isHydrated } = useCart();
  const tax = cartTotal * 0.12;
  const shipping = cartTotal >= 200 ? 0 : 12;
  const grandTotal = cartTotal + tax + shipping;

  if (!isHydrated) {
    return (
      <div className="panel p-10">
        <div className="h-24 animate-pulse rounded-[1.5rem] bg-white/70" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <p className="muted-label mb-3">Cart</p>
        <h1 className="text-5xl font-semibold">Your cart is empty.</h1>
        <p className="mx-auto mt-4 max-w-xl text-black/60">
          Build your lineup with elevated essentials and your selections will stay saved locally.
        </p>
        <Button href="/shop" asChild className="mt-8">
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_0.8fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.cartKey}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <aside className="panel h-fit p-6">
        <p className="muted-label mb-3">Summary</p>
        <h2 className="text-3xl font-semibold">Order overview</h2>
        <div className="mt-6 space-y-3 text-sm text-black/65">
          <div className="flex items-center justify-between">
            <span>Items</span>
            <span>{cartCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Estimated tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
          </div>
        </div>

        <div className="mt-6 border-t border-black/10 pt-6">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <Button href="/checkout" asChild className="mt-6 w-full">
          Proceed to Checkout
        </Button>
        <Link href="/shop" className="mt-6 inline-flex text-sm text-black/55 underline-offset-4 hover:underline">
          Add more pieces
        </Link>
      </aside>
    </div>
  );
}
