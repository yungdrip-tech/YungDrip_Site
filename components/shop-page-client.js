"use client";

import { useDeferredValue, useEffect, useState } from "react";
import ProductGrid from "@/components/product-grid";
import Reveal from "@/components/reveal";
import { fetchProducts } from "@/lib/api-client";
import { getCategories } from "@/lib/product-utils";

export default function ShopPageClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let isCancelled = false;

    async function loadCategories() {
      try {
        const allProducts = await fetchProducts();

        if (!isCancelled) {
          setCategories(getCategories(allProducts));
        }
      } catch {
        if (!isCancelled) {
          setCategories(["All"]);
        }
      }
    }

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const nextProducts = await fetchProducts({
          category: selectedCategory === "All" ? "" : selectedCategory,
          sort: selectedSort === "default" ? "" : selectedSort,
          search: deferredSearch
        });

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
  }, [deferredSearch, selectedCategory, selectedSort]);

  return (
    <div className="shell py-12">
      <Reveal>
        <ProductGrid
          products={products}
          categories={categories}
          heading="The full collection"
          search={search}
          selectedCategory={selectedCategory}
          selectedSort={selectedSort}
          onSearchChange={setSearch}
          onCategoryChange={setSelectedCategory}
          onSortChange={setSelectedSort}
          isLoading={isLoading}
          error={error}
          onRetry={() => window.location.reload()}
        />
      </Reveal>
    </div>
  );
}
