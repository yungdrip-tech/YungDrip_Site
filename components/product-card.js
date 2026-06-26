"use client";

import StoreImage from "@/components/store-image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ProductBadges from "@/components/product-badges";
import ProductPrice from "@/components/product-price";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, priority = false, className }) {
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={cn("group overflow-hidden rounded-[1.75rem] border border-black/10 bg-white", className)}
    >
      <Link href={`/product/${product._id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <div className="absolute left-3 top-3 z-10">
            <ProductBadges product={product} variant="overlay" />
          </div>
          <StoreImage
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            className="object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-0"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <StoreImage
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            fill
            className="object-cover opacity-0 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>

        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-black/45">
              {product.category}
              {product.season ? ` · ${product.season}` : ""}
              {product.gender ? ` · ${product.gender}` : ""}
            </p>
            <h3 className="mt-2 text-[1.55rem] font-semibold leading-tight">{product.name}</h3>
            <ProductPrice product={product} size="sm" className="mt-3" />
          </div>
          <div className="rounded-full border border-black/10 p-2 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
