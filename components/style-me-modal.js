"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import ProductCard from "@/components/product-card";
import { fetchProductsWithFallback } from "@/lib/products-with-fallback";
import { getRecommendations } from "@/lib/recommendation";
import { bodyTypes, skinTones } from "@/lib/style-me-options";
import { cn } from "@/lib/utils";

function StepCard({ selected, className, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[1.5rem] border p-4 text-left transition sm:p-5",
        selected ? "border-black bg-black text-white" : "border-black/10 bg-white hover:border-black/25",
        className
      )}
    >
      {children}
    </button>
  );
}

function BodyTypeCard({ option, selected, onSelect }) {
  return (
    <StepCard selected={selected} onClick={() => onSelect(option.value)}>
      <div className="mb-4 overflow-hidden rounded-[1.25rem] border border-black/10 bg-sand">
        <Image
          src={option.image}
          alt={option.label}
          width={240}
          height={240}
          className="h-40 w-full object-cover"
        />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.2em]">{option.label}</p>
    </StepCard>
  );
}

function SkinToneCard({ option, selected, onSelect }) {
  return (
    <StepCard selected={selected} onClick={() => onSelect(option.value)}>
      <div className="mb-4 flex items-center justify-center rounded-[1.25rem] border border-black/10 bg-sand py-6">
        <div className={cn("h-24 w-24 rounded-full border border-black/10", option.swatch)} />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.2em]">{option.label}</p>
    </StepCard>
  );
}

function ResultsRail({ items }) {
  return (
    <div className="no-scrollbar mt-6 flex gap-5 overflow-x-auto pb-2">
      {items.map((item) => (
        <div key={item._id} className="w-[260px] shrink-0 sm:w-[280px]">
          <ProductCard product={item} />
        </div>
      ))}
    </div>
  );
}

export default function StyleMeModal({ open, onClose, currentProduct = null }) {
  const [step, setStep] = useState("body");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedSkinTone, setSelectedSkinTone] = useState("");
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("body");
      setSelectedBodyType("");
      setSelectedSkinTone("");
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

  const recommendationState = useMemo(() => {
    return getRecommendations(
      products,
      {
        bodyType: selectedBodyType,
        skinTone: selectedSkinTone
      },
      currentProduct?._id
    );
  }, [currentProduct?._id, products, selectedBodyType, selectedSkinTone]);

  function handleBodyTypeSelect(value) {
    setSelectedBodyType(value);
    setStep("skin");
  }

  function handleSkinToneSelect(value) {
    setSelectedSkinTone(value);
    setStep("results");
  }

  function goBack() {
    if (step === "results") {
      setStep("skin");
      return;
    }

    if (step === "skin") {
      setStep("body");
    }
  }

  const title = currentProduct ? `Style ${currentProduct.name}` : "Discover your look";
  const description = currentProduct
    ? "Choose your profile to see curated pairings for this product."
    : "Choose your profile to explore outfit recommendations across the collection.";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label="Close style modal"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[90] overflow-y-auto bg-white"
          >
            <div className="shell min-h-screen py-8">
              <div className="mb-10 flex items-start justify-between gap-4 border-b border-black/10 pb-6">
                <div>
                  <p className="muted-label mb-3 inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Style Me
                  </p>
                  <h2 className="font-serif text-5xl font-semibold">{title}</h2>
                  <p className="mt-3 max-w-2xl text-sm text-black/60">{description}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
                  aria-label="Close style modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-black/45">
                  <span className={cn(step === "body" && "text-black")}>Body Type</span>
                  <span>/</span>
                  <span className={cn(step === "skin" && "text-black")}>Skin Tone</span>
                  <span>/</span>
                  <span className={cn(step === "results" && "text-black")}>Results</span>
                </div>

                {step !== "body" ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-black/60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : null}
              </div>

              <AnimatePresence mode="wait">
                {step === "body" ? (
                  <motion.section
                    key="body"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="muted-label mb-4">Select Body Type</p>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {bodyTypes.map((option) => (
                        <BodyTypeCard
                          key={option.value}
                          option={option}
                          selected={selectedBodyType === option.value}
                          onSelect={handleBodyTypeSelect}
                        />
                      ))}
                    </div>
                  </motion.section>
                ) : null}

                {step === "skin" ? (
                  <motion.section
                    key="skin"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="muted-label mb-4">Select Skin Tone</p>
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                      {skinTones.map((option) => (
                        <SkinToneCard
                          key={option.value}
                          option={option}
                          selected={selectedSkinTone === option.value}
                          onSelect={handleSkinToneSelect}
                        />
                      ))}
                    </div>
                  </motion.section>
                ) : null}

                {step === "results" ? (
                  <motion.section
                    key="results"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.3 }}
                    className="panel p-6 lg:p-8"
                  >
                    <p className="muted-label mb-3">Recommendation Result</p>
                    <h3 className="text-3xl font-semibold">Suggested outfit combinations</h3>

                    {/* Future AI layer: replace this result rail with generated outfits or rendered model styling. */}

                    {isLoadingProducts ? (
                      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="h-72 animate-pulse rounded-[1.75rem] bg-black/5" />
                        ))}
                      </div>
                    ) : null}

                    {!isLoadingProducts && recommendationState.items?.length > 0 ? (
                      <>
                        <p className="mt-4 text-sm text-black/60">
                          {recommendationState.isFallback
                            ? "Showing similar styles"
                            : "Based on your selected profile"}
                        </p>
                        <ResultsRail items={recommendationState.items.slice(0, 5)} />
                      </>
                    ) : null}

                    {!isLoadingProducts && recommendationState.items?.length === 0 ? (
                      <div className="mt-6 rounded-[1.5rem] border border-dashed border-black/15 p-8 text-sm text-black/55">
                        Showing similar styles. No exact matches were found, so browse the full <Link href="/shop" className="underline">collection</Link>.
                      </div>
                    ) : null}
                  </motion.section>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
