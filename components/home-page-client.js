"use client";

import { useEffect, useMemo, useState } from "react";
import CategorySection from "@/components/category-section";
import CollectionCarousel from "@/components/collection-carousel";
import FullScreenCarousel from "@/components/full-screen-carousel";
import HeroSection from "@/components/hero-section";
import Button from "@/components/button";
import { SEASONS } from "@/lib/catalog/constants";
import { fetchProducts } from "@/lib/api-client";
import { getFeaturedProducts } from "@/lib/product-utils";

function HomePageSkeleton() {
  return (
    <div className="shell space-y-10 pt-16">
      <div className="h-12 w-56 animate-pulse rounded-full bg-black/5" />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[360px] animate-pulse rounded-[2rem] bg-black/5" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-[420px] animate-pulse rounded-[2rem] bg-black/5" />
        ))}
      </div>
    </div>
  );
}

export default function HomePageClient() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const nextProducts = await fetchProducts();

        if (!isCancelled) {
          setProducts(nextProducts);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, []);

  const { hoodies, sweatshirts, tshirts, bottoms, featuredProducts, collectionItems, showcaseSlides } =
    useMemo(() => {
      const nextFeaturedProducts = getFeaturedProducts(products);
      const nextHoodies = products.filter((product) => product.category === "Hoodies");
      const nextSweatshirts = products.filter((product) => product.category === "Sweatshirts");
      const nextTshirts = products.filter((product) => product.category === "T-Shirts");
      const nextBottoms = products.filter((product) => product.category === "Bottoms");

      return {
        hoodies: nextHoodies,
        sweatshirts: nextSweatshirts,
        tshirts: nextTshirts,
        bottoms: nextBottoms,
        featuredProducts: nextFeaturedProducts,
        collectionItems: [
          {
            eyebrow: "Winter Edit",
            title: "Hoodies",
            category: "Hoodies",
            season: SEASONS.WINTER,
            image: nextHoodies[0]?.images?.[0],
            count: nextHoodies.length
          },
          {
            eyebrow: "Winter Edit",
            title: "Sweatshirts",
            category: "Sweatshirts",
            season: SEASONS.WINTER,
            image: nextSweatshirts[0]?.images?.[0],
            count: nextSweatshirts.length
          },
          {
            eyebrow: "Summer Edit",
            title: "T-Shirts",
            category: "T-Shirts",
            season: SEASONS.SUMMER,
            image: nextTshirts[0]?.images?.[0],
            count: nextTshirts.length
          },
          {
            eyebrow: "Essentials",
            title: "Bottoms",
            category: "Bottoms",
            image: nextBottoms[0]?.images?.[0],
            count: nextBottoms.length
          }
        ].filter((item) => item.image),
        showcaseSlides: products
          .slice(0, 3)
          .map((product) => ({
            title: product.name,
            description: [product.category, product.season].filter(Boolean).join(" · "),
            image: product.images?.[0]
          }))
          .filter((slide) => slide.image)
      };
    }, [products]);

  return (
    <div className="-mt-14 pb-24 md:-mt-20">
      <HeroSection image="/hero/site-image.jpg" />

      {isLoading ? <HomePageSkeleton /> : null}

      {!isLoading && error ? (
        <div className="shell pt-16">
          <div className="panel p-8">
            <p className="muted-label mb-3">Data unavailable</p>
            <h2 className="font-serif text-4xl font-semibold">Products could not be loaded.</h2>
            <p className="mt-3 text-sm text-black/60">{error}</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error ? (
        products.length === 0 ? (
          <div className="shell pt-16">
            <div className="panel p-8">
              <p className="muted-label mb-3">Catalog empty</p>
              <h2 className="font-serif text-4xl font-semibold">No products are in the database yet.</h2>
              <p className="mt-3 text-sm text-black/60">
                Run <code className="rounded bg-black/5 px-2 py-1">npm run seed</code> to load the winter and summer
                catalog into MongoDB.
              </p>
            </div>
          </div>
        ) : (
          <>
            <CollectionCarousel title="Collection" items={collectionItems} />

            <div className="space-y-20 pt-20">
              <CategorySection label="Winter Edit" title="Hoodies" products={hoodies.slice(0, 6)} />
              <CategorySection label="Winter Edit" title="Sweatshirts" products={sweatshirts.slice(0, 6)} />
              <CategorySection label="Summer Edit" title="T-Shirts" products={tshirts.slice(0, 6)} />
              <CategorySection label="Essentials" title="Bottoms" products={bottoms.slice(0, 6)} />
            </div>

            {showcaseSlides.length > 0 ? <FullScreenCarousel slides={showcaseSlides} /> : null}

            <div className="pt-24">
              <CategorySection label="Featured Edit" title="Trending Now" products={featuredProducts} />
            </div>
          </>
        )
      ) : null}
    </div>
  );
}
