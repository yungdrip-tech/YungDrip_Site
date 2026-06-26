import { getDisplayDiscount } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const genderLabels = {
  Male: "Male",
  Female: "Female",
  Unisex: "Unisex"
};

export default function ProductBadges({
  product,
  variant = "inline",
  showGender = true,
  showSaveTag = true,
  className
}) {
  const gender = genderLabels[product?.gender] ? product.gender : null;
  const saveTag = showSaveTag ? getDisplayDiscount(product) : null;

  if (!showGender && !saveTag) {
    return null;
  }

  if (!gender && !saveTag) {
    return null;
  }

  const badgeClass =
    variant === "overlay"
      ? "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] shadow-sm"
      : "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {showGender && gender ? (
        <span className={cn(badgeClass, "border border-black/10 bg-white/95 text-black/70")}>
          {gender}
        </span>
      ) : null}
      {saveTag ? (
        <span className={cn(badgeClass, "bg-black text-white")}>{saveTag}% off</span>
      ) : null}
    </div>
  );
}
