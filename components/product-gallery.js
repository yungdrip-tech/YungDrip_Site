"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import StoreImage from "@/components/store-image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

const PIN_HEIGHT_CLASS = "h-[min(85vh,720px)]";
const SCROLL_STEP_VH = 45;

function MobileGallery({ images, alt, activeIndex, onSelect }) {
  return (
    <div className="space-y-4 lg:hidden">
      <div className={cn("panel relative overflow-hidden", PIN_HEIGHT_CLASS)}>
        <StoreImage
          src={images[activeIndex]}
          alt={alt}
          fill
          priority
          className="object-cover transition-opacity duration-500"
        />
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => onSelect(index)}
              className={cn(
                "panel relative aspect-square overflow-hidden border-2 transition",
                activeIndex === index ? "border-clay" : "border-transparent",
              )}
            >
              <StoreImage
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ProductGallery({ images, alt }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safeImages = useMemo(() => (images?.length ? images : []), [images]);
  const secondaryImages = safeImages.slice(1);
  const scrollSteps = Math.max(0, Math.min(safeImages.length - 1, 2));
  const useScrollGallery = safeImages.length > 1;

  useLayoutEffect(() => {
    if (!useScrollGallery || scrollSteps === 0) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;

    if (!section || !pin || !track) {
      return undefined;
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const getStepHeight = () => {
        const slides = track.querySelectorAll("[data-slide]");
        if (!slides.length) {
          return window.innerHeight * (SCROLL_STEP_VH / 100);
        }

        const gap = 12;
        return slides[0].offsetHeight + gap;
      };

      const getPinScroll = () => getStepHeight() * scrollSteps;
      const trackScrollSteps = Math.min(
        Math.max(secondaryImages.length - 2, 0),
        scrollSteps,
      );

      const tween = gsap.to(track, {
        y: () => -getStepHeight() * trackScrollSteps,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top+=80",
          end: () => `+=${getPinScroll()}`,
          pin: pin,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextIndex = Math.min(
              safeImages.length - 1,
              Math.round(self.progress * scrollSteps),
            );
            setActiveIndex(nextIndex);
          },
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    return () => {
      mm.revert();
    };
  }, [safeImages, secondaryImages.length, scrollSteps, useScrollGallery]);

  if (!safeImages.length) {
    return null;
  }

  if (!useScrollGallery) {
    return (
      <div className={cn("panel relative overflow-hidden", PIN_HEIGHT_CLASS)}>
        <StoreImage
          src={safeImages[0]}
          alt={alt}
          fill
          priority
          className="object-cover"
        />
      </div>
    );
  }

  const sectionHeight =
    scrollSteps > 0
      ? `calc(min(85vh, 720px) + ${scrollSteps * SCROLL_STEP_VH}vh)`
      : "min(85vh, 720px)";

  return (
    <>
      <MobileGallery
        images={safeImages}
        alt={alt}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
      />

      <div
        ref={sectionRef}
        className="relative hidden lg:block"
        style={{ height: sectionHeight }}
      >
        <div
          ref={pinRef}
          className={cn(
            "grid grid-cols-[1.12fr_0.88fr] items-stretch gap-3",
            PIN_HEIGHT_CLASS,
          )}
        >
          <div className="panel relative overflow-hidden">
            {safeImages.map((image, index) => (
              <StoreImage
                key={image}
                src={image}
                alt={alt}
                fill
                priority={index === 0}
                className={cn(
                  "object-cover transition-opacity duration-500",
                  activeIndex === index ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>

          <div className="relative overflow-hidden rounded-[2rem]">
            <div ref={trackRef} className="flex h-full flex-col gap-3">
              {secondaryImages.map((image, index) => (
                <div
                  key={image}
                  data-slide
                  className="panel relative min-h-0 flex-1 overflow-hidden"
                >
                  <StoreImage
                    src={image}
                    alt={`${alt} detail ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 32vw, 100vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
