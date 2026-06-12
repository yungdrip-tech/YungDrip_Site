"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, alt }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      <div className="panel relative aspect-[4/5] overflow-hidden">
        <Image
          src={activeImage}
          alt={alt}
          fill
          priority
          className="object-cover transition duration-500"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveImage(image)}
            className={cn(
              "panel relative aspect-square overflow-hidden border-2 transition",
              activeImage === image ? "border-clay" : "border-transparent"
            )}
          >
            <Image
              src={image}
              alt={`${alt} thumbnail`}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
