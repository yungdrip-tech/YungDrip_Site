import { getDisplayDiscount, getProductMrp } from "@/lib/pricing";
import { cn, formatCurrency } from "@/lib/utils";

const sizeStyles = {
  sm: {
    price: "text-xs uppercase tracking-[0.2em] text-black/55",
    mrp: "text-xs text-black/40 line-through",
    discount: "text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
  },
  md: {
    price: "text-2xl font-semibold",
    mrp: "text-lg text-black/45 line-through",
    discount: "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
  },
  lg: {
    price: "text-3xl font-semibold",
    mrp: "text-xl text-black/45 line-through",
    discount: "text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700"
  }
};

export default function ProductPrice({
  product,
  size = "md",
  className,
  showDiscount = false,
  inline = true
}) {
  const styles = sizeStyles[size] || sizeStyles.md;
  const mrp = getProductMrp(product);
  const discount = showDiscount ? getDisplayDiscount(product) : null;

  return (
    <div className={cn(inline ? "flex flex-wrap items-baseline gap-x-3 gap-y-1" : "space-y-1", className)}>
      <span className={styles.price}>{formatCurrency(product.price)}</span>
      {mrp ? <span className={styles.mrp}>{formatCurrency(mrp)}</span> : null}
      {discount ? <span className={styles.discount}>{discount}% off</span> : null}
    </div>
  );
}
