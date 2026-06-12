"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Sparkles, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { fetchProductsWithFallback } from "@/lib/products-with-fallback";
import {
  getOutfitRecommendations,
  getProductColorHex,
} from "@/lib/style-ai-recommendation";
import { cn, formatCurrency } from "@/lib/utils";

// Load Three.js mannequin only on client to avoid SSR issues
const StyleAIMannequin = dynamic(
  () => import("@/components/style-ai-mannequin"),
  { ssr: false }
);

// ─── Config ──────────────────────────────────────────────────────────────────

const GENDERS = [
  { value: "Male", label: "Male", icon: "♂" },
  { value: "Female", label: "Female", icon: "♀" },
  { value: "Non-binary", label: "Non-binary", icon: "⚥" },
];

const BODY_TYPES = [
  { value: "Slim", label: "Slim", image: "/style-me/body-slim.svg" },
  { value: "Athletic", label: "Athletic", image: "/style-me/body-athletic.svg" },
  { value: "Average", label: "Average", image: "/style-me/body-regular.svg" },
  { value: "Plus Size", label: "Plus Size", image: "/style-me/body-plus-size.svg" },
];

const COLOR_PREFERENCES = [
  {
    value: "any",
    label: "No Preference",
    swatch: "bg-gradient-to-br from-black via-stone-400 to-white",
  },
  {
    value: "dark",
    label: "Dark Tones",
    swatch: "bg-[#3d3d3d]",
    hint: "Graphite, Midnight, Charcoal",
  },
  {
    value: "light",
    label: "Light Tones",
    swatch: "bg-[#e8dfd4] border border-black/10",
    hint: "Bone, Stone, Cream",
  },
  {
    value: "earth",
    label: "Earth Tones",
    swatch: "bg-[#6b7c3f]",
    hint: "Olive, Forest, Khaki",
  },
  {
    value: "blue",
    label: "Blues & Denim",
    swatch: "bg-[#2b4070]",
    hint: "Indigo, Navy, Raw Denim",
  },
];

const STEPS = ["gender", "body", "color", "outfit"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectionCard({ selected, onClick, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[1.25rem] border p-4 text-left transition focus:outline-none",
        selected
          ? "border-black bg-black text-white"
          : "border-black/10 bg-white hover:border-black/25",
        className
      )}
    >
      {children}
    </button>
  );
}

function GenderStep({ selected, onSelect }) {
  return (
    <motion.section
      key="gender"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28 }}
    >
      <p className="muted-label mb-5">Select Gender</p>
      <div className="grid grid-cols-3 gap-4 max-w-lg">
        {GENDERS.map((g) => (
          <SelectionCard
            key={g.value}
            selected={selected === g.value}
            onClick={() => onSelect(g.value)}
          >
            <span className="block text-3xl mb-2">{g.icon}</span>
            <p className="text-sm font-medium uppercase tracking-[0.18em]">{g.label}</p>
          </SelectionCard>
        ))}
      </div>
    </motion.section>
  );
}

function BodyTypeStep({ selected, onSelect }) {
  return (
    <motion.section
      key="body"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28 }}
    >
      <p className="muted-label mb-5">Select Body Type</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-2xl">
        {BODY_TYPES.map((bt) => (
          <SelectionCard
            key={bt.value}
            selected={selected === bt.value}
            onClick={() => onSelect(bt.value)}
          >
            <div className="mb-3 overflow-hidden rounded-[1rem] border border-black/10 bg-sand">
              <Image
                src={bt.image}
                alt={bt.label}
                width={160}
                height={160}
                className="h-28 w-full object-cover"
              />
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.18em]">{bt.label}</p>
          </SelectionCard>
        ))}
      </div>
    </motion.section>
  );
}

function ColorStep({ selected, onSelect }) {
  return (
    <motion.section
      key="color"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.28 }}
    >
      <p className="muted-label mb-5">Select Preferred Color</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 max-w-3xl">
        {COLOR_PREFERENCES.map((cp) => (
          <SelectionCard
            key={cp.value}
            selected={selected === cp.value}
            onClick={() => onSelect(cp.value)}
          >
            <div className={cn("mb-3 h-16 rounded-[1rem]", cp.swatch)} />
            <p className="text-sm font-medium uppercase tracking-[0.15em]">{cp.label}</p>
            {cp.hint ? (
              <p
                className={cn(
                  "mt-1 text-[10px] tracking-wide truncate",
                  selected === cp.value ? "text-white/60" : "text-black/40"
                )}
              >
                {cp.hint}
              </p>
            ) : null}
          </SelectionCard>
        ))}
      </div>
    </motion.section>
  );
}

function OutfitProductCard({ product, isHero, onAddToCart }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAddToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-[1.25rem] border p-3 transition",
        isHero ? "border-black bg-black text-white" : "border-black/10 bg-white"
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.75rem] bg-sand">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : null}
        {isHero ? (
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-black">
              Selected
            </span>
          </div>
        ) : null}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p
            className={cn(
              "truncate text-xs font-semibold uppercase tracking-[0.14em]",
              isHero ? "text-white" : "text-black"
            )}
          >
            {product.name}
          </p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold",
              isHero ? "text-white/80" : "text-black/70"
            )}
          >
            {formatCurrency(product.price)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            "mt-2 self-start rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition",
            added
              ? "bg-green-500 text-white"
              : isHero
              ? "bg-white text-black hover:bg-white/90"
              : "border border-black/15 bg-white text-black hover:border-black/30"
          )}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function StyleAIModal({ open, onClose, currentProduct }) {
  const [step, setStep] = useState("gender");
  const [gender, setGender] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [colorPreference, setColorPreference] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { addItem } = useCart();

  // Reset + fetch products when modal opens
  useEffect(() => {
    if (!open) {
      setStep("gender");
      setGender("");
      setBodyType("");
      setColorPreference("");
      return undefined;
    }

    document.body.style.overflow = "hidden";
    setIsLoadingProducts(true);

    fetchProductsWithFallback()
      .then((items) => setProducts(items))
      .finally(() => setIsLoadingProducts(false));

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Derive outfit from recommendations
  const outfit = useMemo(() => {
    if (step !== "outfit" || !currentProduct || !products.length) return null;
    return getOutfitRecommendations(products, currentProduct, { bodyType, colorPreference });
  }, [step, products, currentProduct, bodyType, colorPreference]);

  // Derive per-section colors for the mannequin
  const outfitColors = useMemo(() => {
    if (!outfit) return {};
    return {
      top: getProductColorHex(outfit.top),
      bottom: getProductColorHex(outfit.bottom),
      footwear: getProductColorHex(outfit.footwear),
    };
  }, [outfit]);

  const outfitItems = useMemo(() => {
    if (!outfit) return [];
    return [
      { type: "top", label: "Top", product: outfit.top },
      { type: "bottom", label: "Bottom", product: outfit.bottom },
      { type: "footwear", label: "Footwear", product: outfit.footwear },
    ].filter((slot) => slot.product !== null);
  }, [outfit]);

  const outfitTotal = useMemo(
    () => outfitItems.reduce((sum, slot) => sum + (slot.product?.price ?? 0), 0),
    [outfitItems]
  );

  // Step navigation helpers
  function handleGenderSelect(value) {
    setGender(value);
    setStep("body");
  }
  function handleBodyTypeSelect(value) {
    setBodyType(value);
    setStep("color");
  }
  function handleColorSelect(value) {
    setColorPreference(value);
    setStep("outfit");
  }
  function goBack() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  // Add a single outfit item to cart (use first size+color)
  const addOutfitItemToCart = useCallback(
    (product) => {
      if (!product) return;
      addItem(product, {
        size: product.sizes?.[0] ?? "",
        color: product.colors?.[0] ?? "",
      });
    },
    [addItem]
  );

  function handleAddAllToCart() {
    outfitItems.forEach((slot) => addOutfitItemToCart(slot.product));
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close Style.AI"
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className={cn(
                "relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-soft",
                "w-full max-w-5xl",
                step === "outfit" ? "h-[85vh]" : "max-h-[85vh]"
              )}
            >
              {/* ── Header ───────────────────────────────────────── */}
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black/8 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black">
                      Style.AI
                    </p>
                    {currentProduct ? (
                      <p className="text-[11px] text-black/45 truncate max-w-[240px]">
                        Styling: {currentProduct.name}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Step breadcrumb */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.22em]">
                  {STEPS.map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      {i > 0 ? <span className="text-black/20">/</span> : null}
                      <span
                        className={cn(
                          "transition",
                          i < stepIndex
                            ? "text-black/35 line-through"
                            : i === stepIndex
                            ? "text-black font-semibold"
                            : "text-black/20"
                        )}
                      >
                        {s === "gender"
                          ? "Gender"
                          : s === "body"
                          ? "Body"
                          : s === "color"
                          ? "Color"
                          : "Outfit"}
                      </span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {stepIndex > 0 && step !== "outfit" ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 px-3 text-[10px] font-medium uppercase tracking-[0.18em] transition hover:border-black/20"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition hover:border-black/25"
                    aria-label="Close"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Body ─────────────────────────────────────────── */}
              <div className={cn("flex-1 overflow-hidden", step !== "outfit" && "overflow-y-auto")}>
                <AnimatePresence mode="wait">
                  {/* ── GENDER step ──────────────────────────────── */}
                  {step === "gender" ? (
                    <div key="gender" className="p-6">
                      <GenderStep selected={gender} onSelect={handleGenderSelect} />
                    </div>
                  ) : null}

                  {/* ── BODY TYPE step ───────────────────────────── */}
                  {step === "body" ? (
                    <div key="body" className="p-6">
                      <BodyTypeStep selected={bodyType} onSelect={handleBodyTypeSelect} />
                    </div>
                  ) : null}

                  {/* ── COLOR step ───────────────────────────────── */}
                  {step === "color" ? (
                    <div key="color" className="p-6">
                      <ColorStep selected={colorPreference} onSelect={handleColorSelect} />
                    </div>
                  ) : null}

                  {/* ── OUTFIT step ──────────────────────────────── */}
                  {step === "outfit" ? (
                    <motion.div
                      key="outfit"
                      className="flex h-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Left panel — product list (40%) */}
                      <div className="flex w-2/5 shrink-0 flex-col border-r border-black/8">
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                          <p className="muted-label mb-1">Your Outfit</p>

                          {isLoadingProducts ? (
                            Array.from({ length: 3 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-[88px] animate-pulse rounded-[1.25rem] bg-black/5"
                              />
                            ))
                          ) : outfitItems.length > 0 ? (
                            outfitItems.map((slot) => (
                              <OutfitProductCard
                                key={slot.type}
                                product={slot.product}
                                isHero={slot.product._id === currentProduct?._id}
                                onAddToCart={addOutfitItemToCart}
                              />
                            ))
                          ) : (
                            <p className="text-sm text-black/45 pt-4">
                              No matching items found for this combination.
                            </p>
                          )}
                        </div>

                        {/* Add Entire Outfit footer */}
                        {outfitItems.length > 0 ? (
                          <div className="shrink-0 border-t border-black/8 p-5">
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/55">
                                Outfit Total
                              </p>
                              <p className="text-sm font-semibold">{formatCurrency(outfitTotal)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleAddAllToCart}
                              className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/85"
                            >
                              <ShoppingBag className="h-3.5 w-3.5" />
                              Add Entire Outfit to Cart
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Right panel — 3D mannequin (60%) */}
                      <div className="flex w-3/5 flex-col">
                        <div className="flex shrink-0 items-center justify-between px-5 py-3 border-b border-black/8">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                            {bodyType} · Drag to rotate
                          </p>
                        </div>
                        <div className="flex-1">
                          <StyleAIMannequin
                            bodyType={bodyType}
                            outfitColors={outfitColors}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
