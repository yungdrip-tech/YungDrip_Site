"use client";

import ProductCard from "@/components/product-card";
import Button from "@/components/button";

const sortOptions = [
  { value: "default", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }
];

export default function ProductGrid({
  products,
  categories,
  heading = "All Products",
  search,
  selectedCategory,
  selectedSort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  isLoading,
  error,
  onRetry
}) {
  return (
    <section className="space-y-8">
      <div className="panel p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="muted-label mb-2">Catalog</p>
            <h1 className="text-4xl font-semibold">{heading}</h1>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-black/60">
              Search
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search pieces"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-clay"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-black/60">
              Category
              <select
                value={selectedCategory}
                onChange={(event) => onCategoryChange(event.target.value)}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-clay"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-black/60">
              Sort
              <select
                value={selectedSort}
                onChange={(event) => onSortChange(event.target.value)}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-ink outline-none transition focus:border-clay"
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
      </div>

      {error ? (
        <div className="panel p-10 text-center">
          <h2 className="text-3xl font-semibold">Products could not be loaded.</h2>
          <p className="mt-2 text-black/60">{error}</p>
          <Button className="mt-6" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}

      {!error && isLoading && products.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-black/5" />
          ))}
        </div>
      ) : null}

      {!error && !isLoading && products.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-3xl font-semibold">No pieces matched your filters.</h2>
          <p className="mt-2 text-black/60">Try another search term or switch to a different category.</p>
        </div>
      ) : null}

      {!error && products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} priority={index < 3} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
