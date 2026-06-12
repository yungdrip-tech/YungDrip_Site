"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product-card";

export default function CategorySection({ label, title, products }) {
  const railRef = useRef(null);

  function scrollRail(direction) {
    if (!railRef.current) {
      return;
    }

    railRef.current.scrollBy({
      left: direction * 340,
      behavior: "smooth"
    });
  }

  return (
    <section className="shell pt-4">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="muted-label mb-3">{label}</p>
          <h2 className="font-serif text-5xl font-semibold">{title}</h2>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/shop" className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/60">
            View All
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
              aria-label="Scroll previous"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
              aria-label="Scroll next"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div ref={railRef} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory">
        {products.map((product) => (
          <div key={product._id} className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[360px]">
            <ProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
