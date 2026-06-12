"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FullScreenCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="shell pt-24">
      <div className="relative h-[72vh] overflow-hidden rounded-[2.5rem] bg-black text-white md:h-[84vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.image}
              alt={activeSlide.title}
              fill
              className="object-cover grayscale"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-12">
          <p className="muted-label mb-4 text-white/60">Brand Narrative</p>
          <h2 className="max-w-3xl font-serif text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
            {activeSlide.title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/75">{activeSlide.description}</p>

          <div className="mt-8 flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition ${
                  index === activeIndex ? "w-10 bg-white" : "w-6 bg-white/35"
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
