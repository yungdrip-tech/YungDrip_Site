import { cn } from "@/lib/utils";

export default function MenuToggleIcon({ open = false }) {
  return (
    <span className="relative block h-4 w-[18px]" aria-hidden>
      <span
        className={cn(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out",
          open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-all duration-300 ease-in-out",
          open ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <span
        className={cn(
          "absolute left-0 h-0.5 w-full rounded-full bg-current transition-all duration-300 ease-in-out",
          open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
        )}
      />
    </span>
  );
}
