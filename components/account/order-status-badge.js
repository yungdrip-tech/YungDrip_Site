import { cn } from "@/lib/utils";

const statusClasses = {
  payment_pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-black/10 bg-black text-white",
  packed: "border-blue-200 bg-blue-50 text-blue-700",
  shipped: "border-indigo-200 bg-indigo-50 text-indigo-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700"
};

export default function OrderStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
        statusClasses[status] || "border-black/10 bg-white text-black"
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
