"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createAdminProduct,
  fetchProductById,
  updateAdminProduct,
  uploadProductImage
} from "@/lib/api-client";
import { DEFAULT_SIZES, PRODUCT_CATEGORIES, SEASONS } from "@/lib/catalog/constants";
import { adminBodyTypes, adminStyleTags, skinTones } from "@/lib/style-me-options";

const SEASON_OPTIONS = [
  { value: "", label: "Select season" },
  { value: SEASONS.WINTER, label: "Winter" },
  { value: SEASONS.SUMMER, label: "Summer" }
];

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
  season: "",
  category: "",
  images: "",
  sizes: [],
  colors: [],
  featured: false,
  stock: "50",
  tagsBodyType: [],
  tagsSkinTone: [],
  tagsStyle: []
};

function toggleSelection(selected, value) {
  return selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];
}

function mergeOptions(preset, selected) {
  const extras = selected.filter((value) => !preset.includes(value));
  return extras.length ? [...preset, ...extras] : preset;
}

function ChipSelect({ label, hint, options, selected, onChange, tabClass }) {
  return (
    <div className="block space-y-2 text-sm text-black/60">
      <span>
        {label}
        {hint ? <span className="text-black/40"> {hint}</span> : null}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;

          return (
            <button
              key={value}
              type="button"
              className={tabClass(selected.includes(value))}
              onClick={() => onChange(toggleSelection(selected, value))}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminProductForm({ productId }) {
  const router = useRouter();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const isEdit = Boolean(productId);

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageMode, setImageMode] = useState("url");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const imageList = inputToArray(form.images);
  const sizeOptions = mergeOptions(DEFAULT_SIZES, form.sizes);
  const bodyTypeOptions = mergeOptions(adminBodyTypes, form.tagsBodyType);
  const skinToneOptions = mergeOptions(
    skinTones.map((tone) => tone.value),
    form.tagsSkinTone
  );
  const styleOptions = mergeOptions(adminStyleTags, form.tagsStyle);

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
            season: product.season || "",
            category: product.category || "",
            images: arrayToInput(product.images),
            sizes: Array.isArray(product.sizes) ? product.sizes : [],
            colors: Array.isArray(product.colors) ? product.colors : [],
            featured: Boolean(product.featured),
            stock: String(product.stock ?? 0),
            tagsBodyType: Array.isArray(product.tags?.bodyType) ? product.tags.bodyType : [],
            tagsSkinTone: Array.isArray(product.tags?.skinTone) ? product.tags.skinTone : [],
            tagsStyle: Array.isArray(product.tags?.style) ? product.tags.style : []
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

  function setImageList(nextImages) {
    updateField("images", arrayToInput(nextImages));
  }

  function addImageUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    setImageList([...imageList, trimmed]);
    setImageUrlInput("");
  }

  function removeImage(index) {
    setImageList(imageList.filter((_, currentIndex) => currentIndex !== index));
  }

  function addColor(color) {
    const trimmed = color.trim();
    if (!trimmed) {
      return;
    }

    if (form.colors.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
      setColorInput("");
      return;
    }

    updateField("colors", [...form.colors, trimmed]);
    setColorInput("");
  }

  function removeColor(index) {
    updateField(
      "colors",
      form.colors.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function handleImageUpload(event) {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    setError("");
    setIsUploadingImage(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const result = await uploadProductImage(file);
        uploadedUrls.push(result.url);
      }

      setImageList([...imageList, ...uploadedUrls]);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!imageList.length) {
      setError("Add at least one product image using a URL or upload.");
      return;
    }

    if (!form.season) {
      setError("Select a season (Winter or Summer).");
      return;
    }

    if (!form.category) {
      setError("Select a product category.");
      return;
    }

    if (!form.sizes.length) {
      setError("Select at least one size.");
      return;
    }

    if (!form.colors.length) {
      setError("Add at least one color.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      season: form.season,
      category: form.category,
      images: inputToArray(form.images),
      sizes: form.sizes,
      colors: form.colors,
      featured: form.featured,
      stock: Number(form.stock),
      tags: {
        bodyType: form.tagsBodyType,
        skinTone: form.tagsSkinTone,
        style: form.tagsStyle
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
  const tabClass = (active) =>
    `rounded-full px-4 py-2 text-sm transition ${
      active ? "bg-black text-white" : "bg-black/5 text-black/60 hover:bg-black/10"
    }`;

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
            <span>Season</span>
            <select
              value={form.season}
              onChange={(e) => updateField("season", e.target.value)}
              className={inputClass}
              required
            >
              {SEASON_OPTIONS.map((option) => (
                <option key={option.value || "empty"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Category</span>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            <span>Stock quantity</span>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => updateField("stock", e.target.value)}
              className={inputClass}
              placeholder="e.g. 50"
              required
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-black/60 md:col-span-2">
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
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-black/60">Product images</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={tabClass(imageMode === "url")} onClick={() => setImageMode("url")}>
                  Image URL
                </button>
                <button
                  type="button"
                  className={tabClass(imageMode === "upload")}
                  onClick={() => setImageMode("upload")}
                >
                  Upload image
                </button>
              </div>
            </div>

            {imageMode === "url" ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className={inputClass}
                  placeholder="https://images.unsplash.com/..."
                />
                <Button type="button" variant="secondary" onClick={() => addImageUrl(imageUrlInput)}>
                  Add URL
                </Button>
              </div>
            ) : (
              <label className={`${labelClass} cursor-pointer`}>
                <span>{isUploadingImage ? "Uploading..." : "Choose one or more images"}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  disabled={isUploadingImage}
                  onChange={handleImageUpload}
                  className={`${inputClass} cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:text-white`}
                />
              </label>
            )}

            {imageList.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {imageList.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-black/[0.02]"
                  >
                    <div className="aspect-[4/5] bg-black/5">
                      <img src={image} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="truncate text-xs text-black/50">{image}</p>
                      <Button type="button" variant="secondary" onClick={() => removeImage(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-[1.25rem] border border-dashed border-black/10 px-4 py-6 text-sm text-black/45">
                Add at least one image using a URL or upload.
              </p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ChipSelect
              label="Sizes"
              hint="(select all that apply)"
              options={sizeOptions}
              selected={form.sizes}
              onChange={(sizes) => updateField("sizes", sizes)}
              tabClass={tabClass}
            />

            <div className="block space-y-2 text-sm text-black/60">
              <span>Colors</span>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addColor(colorInput);
                    }
                  }}
                  className={inputClass}
                  placeholder="e.g. Black, Dark Chocolate Brown"
                />
                <Button type="button" variant="secondary" onClick={() => addColor(colorInput)}>
                  Add color
                </Button>
              </div>
              {form.colors.length ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.colors.map((color, index) => (
                    <span
                      key={`${color}-${index}`}
                      className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-sm text-black/70"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="text-black/40 transition hover:text-black"
                        aria-label={`Remove ${color}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-black/45">Add at least one color.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-8">
        <p className="muted-label mb-2">Style tags</p>
        <p className="mb-6 text-sm text-black/45">Used for the Style Me recommendation engine. Select all that apply.</p>
        <div className="grid gap-5 md:grid-cols-3">
          <ChipSelect
            label="Body type"
            options={bodyTypeOptions}
            selected={form.tagsBodyType}
            onChange={(tagsBodyType) => updateField("tagsBodyType", tagsBodyType)}
            tabClass={tabClass}
          />

          <ChipSelect
            label="Skin tone"
            options={skinToneOptions}
            selected={form.tagsSkinTone}
            onChange={(tagsSkinTone) => updateField("tagsSkinTone", tagsSkinTone)}
            tabClass={tabClass}
          />

          <ChipSelect
            label="Style"
            options={styleOptions}
            selected={form.tagsStyle}
            onChange={(tagsStyle) => updateField("tagsStyle", tagsStyle)}
            tabClass={tabClass}
          />
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
