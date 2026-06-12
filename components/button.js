import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Button({
  asChild = false,
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium uppercase tracking-[0.18em] transition duration-300 disabled:pointer-events-none disabled:opacity-50",
    size === "sm" && "px-4 py-2 text-[10px]",
    size === "md" && "px-5 py-3 text-[11px]",
    size === "lg" && "px-7 py-3.5 text-xs",
    variant === "primary" &&
      "bg-ink text-white hover:-translate-y-0.5 hover:bg-black",
    variant === "secondary" &&
      "border border-black/15 bg-white text-ink hover:-translate-y-0.5 hover:border-black/30",
    variant === "ghost" && "text-ink hover:bg-black/5",
    variant === "light" &&
      "border border-white/35 bg-white/10 text-white backdrop-blur hover:-translate-y-0.5 hover:bg-white hover:text-black",
    className
  );

  if (asChild && href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
