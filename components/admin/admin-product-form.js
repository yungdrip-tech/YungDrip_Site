"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { createAdminProduct, fetchProductById, updateAdminProduct } from "@/lib/api-client";

function arrayToInput(arr) {
  return Array.isArray(arr) ? arr.join(", ") : "";
}

function inputToArray(str) {
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  category: "",
  images: "",
  sizes: "",
  colors: "",
  featured: false,
  tagsBodyType: "",
  tagsSkinTone: "",
  tagsStyle: ""
};

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    async function loadProduct() {
      try {
        const product = await fetchProductById(productId);

        if (!cancelled && product) {
          setForm({
            name: product.name || "",
            price: String(product.price ?? ""),
            description: product.description || "",
            category: product.category || "",
            images: arrayToInput(product.images),
            sizes: arrayToInput(product.sizes),
            colors: arrayToInput(product.colors),
            featured: Boolean(product.featured),
            tagsBodyType: arrayToInput(product.tags?.bodyType),
            tagsSkinTone: arrayToInput(product.tags?.skinTone),
            tagsStyle: arrayToInput(product.tags?.style)
          });
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProduct(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [isEdit, productId]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      images: inputToArray(form.images),
      sizes: inputToArray(form.sizes),
      colors: inputToArray(form.colors),
      featured: form.featured,
      tags: {
        bodyType: inputToArray(form.tagsBodyType),
        skinTone: inputToArray(form.tagsSkinTone),
        style: inputToArray(form.tagsStyle)
      }
    };

    try {
      if (isEdit) {
        await updateAdminProduct(productId, payload);
      } else {
        await createAdminProduct(payload);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
      setIsSubmitting(false);
    }
  }

  if (isLoadingAuth || isLoadingProduct) {
    return <div className="panel h-96 animate-pulse" />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30";
  const labelClass = "block space-y-2 text-sm text-black/60";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="panel p-8">
        <p className="muted-label mb-6">Basic info</p>
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClass}>
            <span>Product name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Oversized Cargo Tee"
              required
            />
          </label>

          <label className={labelClass}>
            <span>Price</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className={inputClass}
              placeholder="e.g. 1499"
              required
            />
          </label>

          <label className={labelClass}>
            <span>Category</span>
            <input
              type="text"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className={inputClass}
              placeholder="e.g. T-Shirts"
              required
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-black/60">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <span>Featured product (shown on homepage)</span>
          </label>

          <label className={`${labelClass} md:col-span-2`}>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Describe the product..."
              required
            />
          </label>
        </div>
      </div>

      <div className="panel p-8">
        <p className="muted-label mb-6">Images, sizes & colors</p>
        <div className="grid gap-5">
          <label className={labelClass}>
            <span>Image URLs <span className="text-black/40">(comma-separated)</span></span>
            <textarea
              value={form.images}
              onChange={(e) => updateField("images", e.target.value)}
              className={`${inputClass} min-h-20 resize-none`}
              placeholder="https://images.unsplash.com/..., https://..."
              required
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              <span>Sizes <span className="text-black/40">(comma-separated)</span></span>
              <input
                type="text"
                value={form.sizes}
                onChange={(e) => updateField("sizes", e.target.value)}
                className={inputClass}
                placeholder="XS, S, M, L, XL"
                required
              />
            </label>

            <label className={labelClass}>
              <span>Colors <span className="text-black/40">(comma-separated)</span></span>
              <input
                type="text"
                value={form.colors}
                onChange={(e) => updateField("colors", e.target.value)}
                className={inputClass}
                placeholder="Black, White, Stone"
                required
              />
            </label>
          </div>
        </div>
      </div>

      <div className="panel p-8">
        <p className="muted-label mb-2">Style tags</p>
        <p className="mb-6 text-sm text-black/45">Used for the Style Me recommendation engine. Comma-separated.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <label className={labelClass}>
            <span>Body type</span>
            <input
              type="text"
              value={form.tagsBodyType}
              onChange={(e) => updateField("tagsBodyType", e.target.value)}
              className={inputClass}
              placeholder="slim, athletic, curvy"
            />
          </label>

          <label className={labelClass}>
            <span>Skin tone</span>
            <input
              type="text"
              value={form.tagsSkinTone}
              onChange={(e) => updateField("tagsSkinTone", e.target.value)}
              className={inputClass}
              placeholder="fair, medium, dark"
            />
          </label>

          <label className={labelClass}>
            <span>Style</span>
            <input
              type="text"
              value={form.tagsStyle}
              onChange={(e) => updateField("tagsStyle", e.target.value)}
              className={inputClass}
              placeholder="streetwear, minimal, casual"
            />
          </label>
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </Button>
        <Button href="/admin/products" asChild variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}
