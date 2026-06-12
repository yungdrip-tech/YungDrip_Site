"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/users", label: "Users" }
];

export default function AdminNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user?.isAdmin) {
    return (
      <div className="border-b border-black/10 bg-black px-6 py-3 text-sm text-white/60">
        Admin panel — access restricted
      </div>
    );
  }

  return (
    <div className="border-b border-black/10 bg-black">
      <div className="shell flex items-center gap-1 py-2">
        <span className="mr-4 text-xs uppercase tracking-[0.22em] text-white/40">Admin</span>
        {links.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] transition",
                isActive ? "bg-white text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
