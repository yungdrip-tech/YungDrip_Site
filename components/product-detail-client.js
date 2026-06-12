"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import ProductGallery from "@/components/product-gallery";
import ProductPurchasePanel from "@/components/product-purchase-panel";
import OutfitRecommendationModal from "@/components/outfit-recommendation-modal";
import Reveal from "@/components/reveal";
import Button from "@/components/button";
import { fetchProductById, fetchProducts } from "@/lib/api-client";
import { getFallbackProducts } from "@/lib/fallback-products";

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="h-[640px] animate-pulse rounded-[2rem] bg-black/5" />
      <div className="h-[640px] animate-pulse rounded-[2rem] bg-black/5" />
    </div>
  );
}

export default function ProductDetailClient({ productId }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setError("");

        let nextProduct;
        try {
          nextProduct = await fetchProductById(productId);
        } catch {
          // DB unavailable — serve from seed data so the page works offline
          const fallbacks = getFallbackProducts();
          nextProduct = fallbacks.find((p) => p._id === productId) ?? null;
          if (!nextProduct) throw new Error("Product not found");
        }

        if (isCancelled) {
          return;
        }

        setProduct(nextProduct);

        let nextRelatedProducts = [];
        try {
          nextRelatedProducts = await fetchProducts({ category: nextProduct.category });
        } catch {
          nextRelatedProducts = getFallbackProducts().filter(
            (p) => p.category === nextProduct.category
          );
        }

        if (!isCancelled) {
          setRelatedProducts(nextRelatedProducts.filter((item) => item._id !== nextProduct._id).slice(0, 3));
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

    loadProduct();

    return () => {
      isCancelled = true;
    };
  }, [productId]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="panel p-10 text-center">
        <p className="muted-label mb-3">Unavailable</p>
        <h1 className="font-serif text-5xl font-semibold">This product could not be loaded.</h1>
        <p className="mx-auto mt-4 max-w-xl text-black/60">{error || "The requested product does not exist."}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button href="/shop" asChild variant="secondary">
            Back to shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <ProductGallery images={product.images} alt={product.name} />
        </Reveal>
        <Reveal delay={0.08}>
          <div className="space-y-4">
            <ProductPurchasePanel product={product} />
            <OutfitRecommendationModal product={product} />
          </div>
        </Reveal>
      </div>

      {relatedProducts.length > 0 ? (
        <section className="pt-20">
          <Reveal className="mb-8">
            <p className="muted-label mb-2">More like this</p>
            <h2 className="text-5xl font-semibold">From the same edit</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((item, index) => (
              <Reveal key={item._id} delay={index * 0.08}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <div className="pt-10">
        <Link href="/shop" className="text-sm uppercase tracking-[0.22em] text-black/55">
          Back to shop
        </Link>
      </div>
    </>
  );
}
