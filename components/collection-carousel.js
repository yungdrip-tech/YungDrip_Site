"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

function ScrollControls({ onPrevious, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
        aria-label="Scroll previous"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
        aria-label="Scroll next"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function CollectionCarousel({ title, items }) {
  const railRef = useRef(null);

  function scrollRail(direction) {
    if (!railRef.current) {
      return;
    }

    railRef.current.scrollBy({
      left: direction * 360,
      behavior: "smooth"
    });
  }

  return (
    <section id="collections" className="shell pt-12 md:pt-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="muted-label mb-3">Collections</p>
          <h2 className="font-serif text-5xl font-semibold">{title}</h2>
        </div>
        <ScrollControls onPrevious={() => scrollRail(-1)} onNext={() => scrollRail(1)} />
      </div>

      <div ref={railRef} className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className="min-w-[82vw] snap-start sm:min-w-[420px] lg:min-w-[31%]"
          >
            <Link href="/shop" className="group block overflow-hidden rounded-[2rem] border border-black/10 bg-white">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover grayscale transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 82vw, (max-width: 1280px) 420px, 31vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-white/70">{item.eyebrow}</p>
                  <h3 className="mt-2 font-serif text-4xl font-semibold">{item.title}</h3>
                  <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-white/80">
                    {item.count} pieces
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
