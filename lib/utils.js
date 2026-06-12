export function formatCurrency(value) {
  const currency = process.env.NEXT_PUBLIC_STORE_CURRENCY || "INR";
  const locale = currency === "INR" ? "en-IN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}
