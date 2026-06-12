"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { deleteAdminProduct, fetchProducts } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductList() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      try {
        const result = await fetchProducts();

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
  }, [user?.isAdmin]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      setDeletingId(id);
      setError("");
      await deleteAdminProduct(id);
      setProducts((current) => current.filter((p) => p._id !== id));
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingId("");
    }
  }

  if (isLoadingAuth || isLoading) {
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-black/55">{products.length} products in catalog</p>
        <Button href="/admin/products/new" asChild>
          Add Product
        </Button>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      ) : null}

      {products.length === 0 ? (
        <div className="panel p-10 text-center">
          <h2 className="text-3xl font-semibold">No products yet</h2>
          <p className="mt-3 text-sm text-black/60">Add your first product to get started.</p>
          <Button href="/admin/products/new" asChild className="mt-6">
            Add Product
          </Button>
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
                  {product.featured ? (
                    <span className="rounded-full bg-black px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-white">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-black/55">
                  {product.category} • {formatCurrency(product.price)}
                </p>
                <p className="mt-0.5 text-xs text-black/40">
                  Sizes: {product.sizes?.join(", ")} · Colors: {product.colors?.join(", ")}
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
