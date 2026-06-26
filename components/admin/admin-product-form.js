"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import ConfirmModal from "@/components/confirm-modal";
import { useAuth } from "@/components/providers/auth-provider";
import {
  createAdminProduct,
  fetchProductById,
  updateAdminProduct,
  uploadProductImage
} from "@/lib/api-client";
import { DEFAULT_SIZES, PRODUCT_CATEGORIES, PRODUCT_GENDERS, SEASONS } from "@/lib/catalog/constants";
import { extractGoogleDriveFileId, isGoogleDriveUrl, normalizeImageUrl, normalizeImageUrls } from "@/lib/image-url";
import { adminBodyTypes, adminStyleTags, skinTones } from "@/lib/style-me-options";
import { buildStockBySizeForSizes, sumStockBySize } from "@/lib/stock";
import { calculateSellingPrice, sellingPriceMatchesCalculation } from "@/lib/pricing";
import { cn } from "@/lib/utils";

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
  mrp: "",
  description: "",
  season: "",
  gender: "",
  saveTag: "",
  category: "",
  images: "",
  sizes: [],
  stockBySize: {},
  colors: [],
  featured: false,
  outOfStock: false,
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

function AdminImagePreview({ src, alt }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-black/50">
        <p>Preview unavailable</p>
        <p className="text-xs leading-5 text-black/40">
          For Google Drive links, set sharing to &quot;Anyone with the link&quot; or upload the image instead.
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setHasError(true)}
    />
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
  const [enableSkinToneTags, setEnableSkinToneTags] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, count: 0 });
  const [isPriceManual, setIsPriceManual] = useState(false);

  const imageList = inputToArray(form.images);
  const sizeOptions = mergeOptions(DEFAULT_SIZES, form.sizes);
  const totalStock = sumStockBySize(form.stockBySize);
  const calculatedSellingPrice = calculateSellingPrice(form.mrp, form.saveTag);
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
          const sizes = Array.isArray(product.sizes) ? product.sizes : [];
          const stockBySize = buildStockBySizeForSizes(
            sizes,
            product.stockBySize,
            product.stock ?? 0
          );

          setForm({
            name: product.name || "",
            price: String(product.price ?? ""),
            mrp: product.mrp ? String(product.mrp) : "",
            description: product.description || "",
            season: product.season || "",
            gender: product.gender || "",
            saveTag: product.saveTag ? String(product.saveTag) : "",
            category: product.category || "",
            images: arrayToInput(normalizeImageUrls(product.images || [])),
            sizes,
            stockBySize: Object.fromEntries(
              sizes.map((size) => [size, String(stockBySize[size] ?? 0)])
            ),
            colors: Array.isArray(product.colors) ? product.colors : [],
            featured: Boolean(product.featured),
            outOfStock: Boolean(product.outOfStock),
            tagsBodyType: Array.isArray(product.tags?.bodyType) ? product.tags.bodyType : [],
            tagsSkinTone: Array.isArray(product.tags?.skinTone) ? product.tags.skinTone : [],
            tagsStyle: Array.isArray(product.tags?.style) ? product.tags.style : []
          });
          setIsPriceManual(
            !sellingPriceMatchesCalculation(product.price, product.mrp, product.saveTag)
          );
          setEnableSkinToneTags(Array.isArray(product.tags?.skinTone) && product.tags.skinTone.length > 0);
          setSelectedImages([]);
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

  function updateMrp(value) {
    setForm((current) => {
      const next = { ...current, mrp: value };

      if (!isPriceManual) {
        const nextPrice = calculateSellingPrice(value, current.saveTag);
        next.price = nextPrice === null ? "" : String(nextPrice);
      }

      return next;
    });
  }

  function updateSaveTag(value) {
    setForm((current) => {
      const next = { ...current, saveTag: value };

      if (!isPriceManual) {
        const nextPrice = calculateSellingPrice(current.mrp, value);
        next.price = nextPrice === null ? "" : String(nextPrice);
      }

      return next;
    });
  }

  function updateSellingPrice(value) {
    setIsPriceManual(true);
    updateField("price", value);
  }

  function applyCalculatedSellingPrice() {
    const nextPrice = calculateSellingPrice(form.mrp, form.saveTag);

    if (nextPrice === null) {
      setError("Enter MRP first to calculate the selling price.");
      return;
    }

    setError("");
    setIsPriceManual(false);
    updateField("price", String(nextPrice));
  }

  function updateSizes(nextSizes) {
    setForm((current) => {
      const nextStockBySize = { ...current.stockBySize };

      for (const size of nextSizes) {
        if (nextStockBySize[size] === undefined) {
          nextStockBySize[size] = "0";
        }
      }

      for (const size of Object.keys(nextStockBySize)) {
        if (!nextSizes.includes(size)) {
          delete nextStockBySize[size];
        }
      }

      return {
        ...current,
        sizes: nextSizes,
        stockBySize: nextStockBySize
      };
    });
  }

  function updateSizeStock(size, value) {
    setForm((current) => ({
      ...current,
      stockBySize: {
        ...current.stockBySize,
        [size]: value
      }
    }));
  }

  function setImageList(nextImages) {
    updateField("images", arrayToInput(nextImages));
    setSelectedImages((current) => current.filter((image) => nextImages.includes(image)));
  }

  function toggleImageSelection(image) {
    setSelectedImages((current) =>
      current.includes(image) ? current.filter((item) => item !== image) : [...current, image]
    );
  }

  function selectAllImages() {
    setSelectedImages([...imageList]);
  }

  function clearImageSelection() {
    setSelectedImages([]);
  }

  function requestBulkImageDelete() {
    if (!selectedImages.length) {
      return;
    }

    if (imageList.length - selectedImages.length < 1) {
      setError("Keep at least one product image.");
      return;
    }

    setConfirmModal({ open: true, count: selectedImages.length });
  }

  function confirmBulkImageDelete() {
    const imagesToRemove = new Set(selectedImages);
    setImageList(imageList.filter((image) => !imagesToRemove.has(image)));
    setSelectedImages([]);
    setConfirmModal({ open: false, count: 0 });
  }

  function addImageUrl(url) {
    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    const normalized = normalizeImageUrl(trimmed);

    if (isGoogleDriveUrl(trimmed) && !extractGoogleDriveFileId(trimmed)) {
      setError("Could not read that Google Drive link. Use a share link or upload the image instead.");
      return;
    }

    setError("");
    setImageList([...imageList, normalized]);
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

    if (!form.gender) {
      setError("Select a gender (Male, Female, or Unisex).");
      return;
    }

    if (form.saveTag) {
      const parsedSaveTag = Number(form.saveTag);

      if (!Number.isInteger(parsedSaveTag) || parsedSaveTag < 0 || parsedSaveTag > 100) {
        setError("Save tag must be a whole number between 0 and 100.");
        return;
      }
    }

    const parsedMrp = Number(form.mrp);

    if (!Number.isFinite(parsedMrp) || parsedMrp <= 0) {
      setError("Enter a valid MRP.");
      return;
    }

    const parsedPrice = form.price
      ? Number(form.price)
      : calculateSellingPrice(form.mrp, form.saveTag);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid selling price or provide MRP and save tag to calculate it.");
      return;
    }

    if (parsedMrp < parsedPrice) {
      setError("MRP must be greater than or equal to the selling price.");
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

    for (const size of form.sizes) {
      const parsedStock = Number(form.stockBySize[size] ?? 0);

      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        setError(`Enter a valid stock quantity for size ${size}.`);
        return;
      }
    }

    if (!form.colors.length) {
      setError("Add at least one color.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: form.name,
      price: parsedPrice,
      mrp: parsedMrp,
      description: form.description,
      season: form.season,
      gender: form.gender,
      saveTag: form.saveTag ? Number(form.saveTag) : undefined,
      category: form.category,
      images: inputToArray(form.images),
      sizes: form.sizes,
      stockBySize: Object.fromEntries(
        form.sizes.map((size) => [size, Number(form.stockBySize[size] ?? 0)])
      ),
      colors: form.colors,
      featured: form.featured,
      outOfStock: form.outOfStock,
      tags: {
        bodyType: form.tagsBodyType,
        skinTone: enableSkinToneTags ? form.tagsSkinTone : [],
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

          <div className="md:col-span-2 grid gap-5 rounded-[1.5rem] border border-black/10 bg-black/[0.02] p-5 md:grid-cols-3">
            <p className="md:col-span-3 text-sm font-medium text-black/70">Pricing</p>

            <label className={labelClass}>
              <span>MRP</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.mrp}
                onChange={(e) => updateMrp(e.target.value)}
                className={inputClass}
                placeholder="e.g. 2669"
                required
              />
            </label>

            <label className={labelClass}>
              <span>Save tag (% off)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.saveTag}
                onChange={(e) => updateSaveTag(e.target.value)}
                className={inputClass}
                placeholder="e.g. 51"
              />
            </label>

            <label className={labelClass}>
              <span>Selling price</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => updateSellingPrice(e.target.value)}
                className={inputClass}
                placeholder={calculatedSellingPrice ? String(calculatedSellingPrice) : "Auto-calculated"}
                required
              />
              <span className="text-xs text-black/45">
                {isPriceManual
                  ? "Manual override active."
                  : calculatedSellingPrice !== null
                    ? `Auto-calculated: ₹${calculatedSellingPrice}`
                    : "Calculated from MRP and save tag."}
              </span>
              {isPriceManual && calculatedSellingPrice !== null ? (
                <button
                  type="button"
                  onClick={applyCalculatedSellingPrice}
                  className="text-left text-xs font-medium text-black/60 underline-offset-2 hover:underline"
                >
                  Use calculated price (₹{calculatedSellingPrice})
                </button>
              ) : null}
            </label>
          </div>

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
            <span>Gender</span>
            <select
              value={form.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select gender</option>
              {PRODUCT_GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
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
            ) : null}
            {imageMode === "url" ? (
              <p className="text-xs leading-5 text-black/45">
                Google Drive share links are converted automatically. The file must be shared as{" "}
                <span className="font-medium text-black/60">&quot;Anyone with the link&quot;</span>.
                Upload is more reliable for production.
              </p>
            ) : null}

            {imageMode === "upload" ? (
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
            ) : null}

            {imageList.length ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={selectAllImages}>
                    Select all
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={clearImageSelection}
                    disabled={!selectedImages.length}
                  >
                    Clear selection
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={requestBulkImageDelete}
                    disabled={!selectedImages.length}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete selected ({selectedImages.length})
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {imageList.map((image, index) => {
                    const isSelected = selectedImages.includes(image);

                    return (
                      <div
                        key={`${image}-${index}`}
                        className={`overflow-hidden rounded-[1.25rem] border bg-black/[0.02] transition ${
                          isSelected ? "border-black ring-2 ring-black/10" : "border-black/10"
                        }`}
                      >
                        <label className="relative block aspect-[4/5] cursor-pointer bg-black/5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleImageSelection(image)}
                            className="absolute left-3 top-3 z-10 h-4 w-4 rounded border-black/20"
                          />
                          <AdminImagePreview src={image} alt={`Product image ${index + 1}`} />
                        </label>
                        <div className="space-y-2 p-3">
                          <p className="truncate text-xs text-black/50">{image}</p>
                          <Button type="button" variant="secondary" onClick={() => removeImage(index)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="rounded-[1.25rem] border border-dashed border-black/10 px-4 py-6 text-sm text-black/45">
                Add at least one image using a URL or upload.
              </p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-5">
              <ChipSelect
                label="Sizes"
                hint="(select all that apply)"
                options={sizeOptions}
                selected={form.sizes}
                onChange={updateSizes}
                tabClass={tabClass}
              />

              {form.sizes.length ? (
                <div className="block space-y-3 text-sm text-black/60">
                  <label className="flex items-start gap-3 rounded-[1.25rem] border border-black/10 bg-black/[0.02] p-4">
                    <input
                      type="checkbox"
                      checked={form.outOfStock}
                      onChange={(event) => updateField("outOfStock", event.target.checked)}
                      className="mt-1 h-4 w-4 rounded"
                    />
                    <span>
                      <span className="block font-medium text-black/75">Mark out of stock</span>
                      <span className="mt-1 block text-xs leading-5 text-black/45">
                        Hides this product from purchase on the storefront. Size stock counts are kept so you can
                        restock later without re-entering them.
                      </span>
                    </span>
                  </label>

                  <div className="flex items-center justify-between gap-3">
                    <span>Stock by size</span>
                    <span className="text-xs text-black/45">
                      {form.outOfStock ? "Unavailable for sale" : `Total: ${totalStock} units`}
                    </span>
                  </div>
                  <div className={cn("grid gap-3 sm:grid-cols-2", form.outOfStock && "opacity-60")}>
                    {form.sizes.map((size) => (
                      <label key={size} className="block space-y-2">
                        <span>{size}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.stockBySize[size] ?? "0"}
                          onChange={(event) => updateSizeStock(size, event.target.value)}
                          className={inputClass}
                          placeholder="0"
                          disabled={form.outOfStock}
                          required
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-black/45">Select sizes to set stock quantities.</p>
              )}
            </div>

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
        <p className="mb-6 text-sm text-black/45">
          Used for the Style Me recommendation engine. Body type and style are recommended; skin tone is optional.
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          <ChipSelect
            label="Body type"
            options={bodyTypeOptions}
            selected={form.tagsBodyType}
            onChange={(tagsBodyType) => updateField("tagsBodyType", tagsBodyType)}
            tabClass={tabClass}
          />

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-black/60">
              <input
                type="checkbox"
                checked={enableSkinToneTags}
                onChange={(event) => {
                  const enabled = event.target.checked;
                  setEnableSkinToneTags(enabled);
                  if (!enabled) {
                    updateField("tagsSkinTone", []);
                  }
                }}
                className="h-4 w-4 rounded"
              />
              <span>Include skin tone tags (optional)</span>
            </label>
            {enableSkinToneTags ? (
              <ChipSelect
                label="Skin tone"
                hint="(select all that apply)"
                options={skinToneOptions}
                selected={form.tagsSkinTone}
                onChange={(tagsSkinTone) => updateField("tagsSkinTone", tagsSkinTone)}
                tabClass={tabClass}
              />
            ) : (
              <p className="text-sm text-black/45">Skin tone tags will not be saved for this product.</p>
            )}
          </div>

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

      <ConfirmModal
        open={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, count: 0 })}
        onConfirm={confirmBulkImageDelete}
        title="Delete selected images?"
        description={`Remove ${confirmModal.count} selected image${confirmModal.count === 1 ? "" : "s"} from this product? This cannot be undone.`}
        confirmLabel="Delete images"
        cancelLabel="Keep images"
        variant="danger"
      />
    </form>
  );
}
