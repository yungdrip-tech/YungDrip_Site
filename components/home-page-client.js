"use client";

import { useEffect, useMemo, useState } from "react";
import CategorySection from "@/components/category-section";
import CollectionCarousel from "@/components/collection-carousel";
import FullScreenCarousel from "@/components/full-screen-carousel";
import HeroSection from "@/components/hero-section";
import Button from "@/components/button";
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

  const { hoodies, tshirts, tailoring, featuredProducts, collectionItems, showcaseSlides } = useMemo(() => {
    const nextFeaturedProducts = getFeaturedProducts(products);
    const nextHoodies = products.filter((product) => product.category === "Hoodies");
    const nextTshirts = products.filter((product) => product.category === "T-Shirts");
    const nextTailoring = products.filter((product) =>
      ["Bottoms", "Jeans", "Outerwear"].includes(product.category)
    );

    return {
      hoodies: nextHoodies,
      tshirts: nextTshirts,
      tailoring: nextTailoring,
      featuredProducts: nextFeaturedProducts,
      collectionItems: [
        {
          eyebrow: "Featured",
          title: "Hoodies",
          image: nextHoodies[0]?.images?.[0],
          count: nextHoodies.length
        },
        {
          eyebrow: "Core",
          title: "T-Shirts",
          image: nextTshirts[0]?.images?.[0],
          count: nextTshirts.length
        },
        {
          eyebrow: "Tailored",
          title: "Trousers",
          image: nextTailoring[0]?.images?.[0],
          count: nextTailoring.length
        }
      ].filter((item) => item.image),
      showcaseSlides: products
        .slice(0, 3)
        .map((product) => ({
          title: product.name,
          description: product.category,
          image: product.images?.[0]
        }))
        .filter((slide) => slide.image)
    };
  }, [products]);

  return (
    <div className="-mt-20 pb-24">
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
                Seed the database and the homepage sections will populate automatically.
              </p>
            </div>
          </div>
        ) : (
          <>
            <CollectionCarousel title="Collection" items={collectionItems} />

            <div className="space-y-20 pt-20">
              <CategorySection label="Category One" title="Hoodies" products={hoodies} />
              <CategorySection label="Category Two" title="T-Shirts" products={tshirts} />
              <CategorySection label="Category Three" title="Trousers / Tailoring" products={tailoring} />
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
