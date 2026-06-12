"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import Button from "@/components/button";
import StyleAIModal from "@/components/style-ai-modal";
import { useCart } from "@/components/providers/cart-provider";
import { cn, formatCurrency } from "@/lib/utils";

export default function ProductPurchasePanel({ product }) {
  const availableSizes = Array.isArray(product.sizes) ? product.sizes : [];
  const availableColors = Array.isArray(product.colors) ? product.colors : [];
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(availableColors[0] || "");
  const [isAdding, setIsAdding] = useState(false);
  const [styleAIOpen, setStyleAIOpen] = useState(false);
  const { addItem } = useCart();
  const canAddToCart = Boolean(selectedSize && selectedColor);

  async function handleAddToCart() {
    if (!canAddToCart) {
      return;
    }

    setIsAdding(true);
    const didAddItem = addItem(product, { size: selectedSize, color: selectedColor });

    if (!didAddItem) {
      setIsAdding(false);
      return;
    }

    window.setTimeout(() => setIsAdding(false), 700);
  }

  return (
    <div className="panel p-6 lg:p-8">
      <p className="muted-label">{product.category}</p>
      <h1 className="mt-3 text-5xl font-semibold text-balance">{product.name}</h1>
      <p className="mt-4 text-2xl font-semibold">{formatCurrency(product.price)}</p>
      <p className="mt-5 leading-7 text-black/65">{product.description}</p>

      <div className="mt-8 space-y-6">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-black/55">Size</p>
          <div className="flex flex-wrap gap-3">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  selectedSize === size
                    ? "border-ink bg-ink text-white"
                    : "border-black/10 bg-white hover:border-black/20"
                )}
              >
                {size}
              </button>
            ))}
            {availableSizes.length === 0 ? (
              <p className="text-sm text-black/55">Size information is currently unavailable.</p>
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-black/55">Color</p>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition",
                  selectedColor === color
                    ? "border-clay bg-clay text-white"
                    : "border-black/10 bg-white hover:border-black/20"
                )}
              >
                {color}
              </button>
            ))}
            {availableColors.length === 0 ? (
              <p className="text-sm text-black/55">Color information is currently unavailable.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleAddToCart} className="min-w-[220px]" disabled={!canAddToCart || isAdding}>
          {isAdding ? (
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" />
              Added
            </span>
          ) : (
            "Add to Cart"
          )}
        </Button>
        <div className="rounded-[1.5rem] border border-black/10 bg-mist px-5 py-3 text-sm text-black/65">
          Selected: {selectedSize} / {selectedColor}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStyleAIOpen(true)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition hover:-translate-y-0.5 hover:border-black/30 hover:shadow-sm"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Style.AI ✨
      </button>

      <StyleAIModal
        open={styleAIOpen}
        onClose={() => setStyleAIOpen(false)}
        currentProduct={product}
      />
    </div>
  );
}
