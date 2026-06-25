"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { COLLECTION_META } from "@/lib/catalog/constants";
import { fetchProducts } from "@/lib/api-client";

export default function CollectionPageClient() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        const nextProducts = await fetchProducts();
        if (!cancelled) {
          setProducts(nextProducts);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const collections = useMemo(() => {
    return COLLECTION_META.map((entry) => {
      const categoryProducts = products.filter((product) => {
        if (product.category !== entry.category) {
          return false;
        }

        if (entry.season) {
          return product.season === entry.season;
        }

        return true;
      });

      return {
        ...entry,
        count: categoryProducts.length,
        image: categoryProducts[0]?.images?.[0] || null
      };
    }).filter((entry) => entry.count > 0);
  }, [products]);

  return (
    <div className="shell py-12 md:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="muted-label mb-3">Collections</p>
        <h1 className="font-serif text-5xl font-semibold">Shop by collection</h1>
        <p className="mt-4 text-sm leading-7 text-black/60">
          Curated category edits from the YungDrip catalog. Pick a collection to explore the full range.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="aspect-[4/5] animate-pulse rounded-[2rem] bg-black/5" />
          ))}
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="panel p-8">
          <h2 className="text-3xl font-semibold">Collections could not be loaded.</h2>
          <p className="mt-3 text-sm text-black/60">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((collection) => {
            const href = collection.season
              ? `/shop?category=${encodeURIComponent(collection.category)}&season=${encodeURIComponent(collection.season)}`
              : `/shop?category=${encodeURIComponent(collection.category)}`;

            return (
              <Link
                key={`${collection.category}-${collection.season || "all"}`}
                href={href}
                className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover grayscale transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/70">{collection.eyebrow}</p>
                    <h2 className="mt-2 font-serif text-4xl font-semibold">{collection.title}</h2>
                    <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-white/80">
                      {collection.count} piece{collection.count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
