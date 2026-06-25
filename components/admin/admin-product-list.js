"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { deleteAdminProduct, fetchProducts } from "@/lib/api-client";
import { getCategories } from "@/lib/product-utils";
import { formatCurrency } from "@/lib/utils";

const sortOptions = [
  { value: "default", label: "Newest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

const seasonOptions = [
  { value: "All", label: "All seasons" },
  { value: "Winter", label: "Winter" },
  { value: "Summer", label: "Summer" }
];

const filterInputClass =
  "w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30";
const filterLabelClass = "flex flex-col gap-2 text-sm text-black/60";

export default function AdminProductList() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [selectedSort, setSelectedSort] = useState("default");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    if (!user?.isAdmin) {
      return;
    }

    let cancelled = false;

    async function loadCategories() {
      try {
        const allProducts = await fetchProducts();
        if (!cancelled) {
          setCategories(getCategories(allProducts));
          setTotalCount(allProducts.length);
        }
      } catch {
        if (!cancelled) {
          setCategories(["All"]);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [user?.isAdmin]);

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError("");

        const result = await fetchProducts({
          category: selectedCategory === "All" ? "" : selectedCategory,
          season: selectedSeason === "All" ? "" : selectedSeason,
          sort: selectedSort === "default" ? "" : selectedSort,
          search: deferredSearch
        });

        if (!cancelled) {
          setProducts(Array.isArray(result) ? result : []);
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
  }, [user?.isAdmin, deferredSearch, selectedCategory, selectedSeason, selectedSort]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      setDeletingId(id);
      setError("");
      await deleteAdminProduct(id);
      setProducts((current) => current.filter((p) => p._id !== id));
      setTotalCount((current) => Math.max(0, current - 1));
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  }

  const hasActiveFilters =
    search.trim() || selectedCategory !== "All" || selectedSeason !== "All" || selectedSort !== "default";

  if (isLoadingAuth) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-black/55">
          {hasActiveFilters
            ? `${products.length} of ${totalCount} products`
            : `${totalCount} products in catalog`}
        </p>
        <Button href="/admin/products/new" asChild>
          Add Product
        </Button>
      </div>

      <div className="panel p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className={filterLabelClass}>
            Search
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, category, or SKU"
              className={filterInputClass}
            />
          </label>

          <label className={filterLabelClass}>
            Season
            <select
              value={selectedSeason}
              onChange={(event) => setSelectedSeason(event.target.value)}
              className={filterInputClass}
            >
              {seasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={filterLabelClass}>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className={filterInputClass}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className={filterLabelClass}>
            Sort
            <select
              value={selectedSort}
              onChange={(event) => setSelectedSort(event.target.value)}
              className={filterInputClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel h-24 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-3xl font-semibold">
            {hasActiveFilters ? "No products matched your filters" : "No products yet"}
          </h2>
          <p className="mt-3 text-sm text-black/60">
            {hasActiveFilters
              ? "Try a different search term or clear your filters."
              : "Add your first product to get started."}
          </p>
          {!hasActiveFilters ? (
            <Button href="/admin/products/new" asChild className="mt-6">
              Add Product
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product._id} className="panel flex items-center gap-4 p-4">
              <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-[0.875rem] bg-black/5">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-semibold">{product.name}</h2>
                  {product.season ? (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-black/55">
                      {product.season}
                    </span>
                  ) : null}
                  {product.featured ? (
                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-black/55">
                  {product.category} • {formatCurrency(product.price)}
                  {product.sku ? ` • SKU ${product.sku}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-black/40">
                  Sizes: {product.sizes?.join(", ")} · Colors: {product.colors?.join(", ")} · Stock:{" "}
                  {product.stock ?? 0}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <Button href={`/admin/products/${product._id}`} asChild variant="secondary">
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(product._id, product.name)}
                  disabled={deletingId === product._id}
                  className="text-red-600 hover:bg-red-50"
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
