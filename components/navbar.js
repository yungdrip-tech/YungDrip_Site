"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Package2,
  Search,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import HamburgerMenu from "@/components/hamburger-menu";
import MenuToggleIcon from "@/components/menu-toggle-icon";
import StyleMeModal from "@/components/style-me-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/shop", label: "New In" },
  { href: "/collection", label: "Collection" },
];

const mobileNavItems = [
  {
    href: "/shop",
    label: "New In",
    icon: Package2,
    match: (path) => path.startsWith("/shop"),
  },
  {
    href: "/collection",
    label: "Collection",
    icon: LayoutGrid,
    match: (path) => path.startsWith("/collection"),
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingBag,
    match: (path) => path.startsWith("/cart"),
    showBadge: true,
  },
  { href: null, label: "Style Me", icon: Sparkles, action: "styleMe" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [styleMeOpen, setStyleMeOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 32);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = !isHome || scrolled || menuOpen;

  function handleMenuToggle() {
    setMenuOpen((current) => !current);
  }

  return (
    <>
      {/* Desktop header */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] hidden border-b transition-all duration-500 md:block",
          isSolid
            ? "border-black/10 bg-white/92 text-black backdrop-blur-xl"
            : "border-transparent bg-transparent text-white",
        )}
      >
        <div className="shell grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.24em] transition",
                  isSolid
                    ? "text-black/70 hover:text-black"
                    : "text-white/80 hover:text-white",
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setStyleMeOpen(true)}
              className={cn(
                "text-[11px] uppercase tracking-[0.24em] transition",
                isSolid
                  ? "text-black/70 hover:text-black"
                  : "text-white/80 hover:text-white",
              )}
            >
              Style Me
            </button>
          </nav>

          <Link
            href="/"
            className="justify-self-center font-serif text-3xl font-semibold tracking-[0.08em]"
          >
            YungDrip
          </Link>

          <div className="flex items-center justify-self-end gap-2">
            <Link
              href="/shop"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href="/cart"
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label={user ? "Account" : "Sign in"}
            >
              <User className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={handleMenuToggle}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <MenuToggleIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] border-b transition-all duration-500 md:hidden",
          isSolid
            ? "border-black/10 bg-white/92 text-black backdrop-blur-xl"
            : "border-transparent bg-transparent text-white",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 pt-[env(safe-area-inset-top,0px)]">
          <Link
            href="/"
            className="font-serif text-2xl font-semibold tracking-[0.08em]"
          >
            YungDrip
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={handleMenuToggle}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20",
              )}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <MenuToggleIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <motion.nav
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 items-stretch gap-1 rounded-[1.75rem] border border-black/10 bg-white/95 p-1.5 shadow-soft backdrop-blur-xl">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.match?.(pathname);

            const itemClassName = cn(
              "relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-[1.25rem] px-1 text-center transition",
              isActive
                ? "bg-black text-white"
                : "text-black/70 hover:bg-black/5",
            );

            const labelClassName = cn(
              "max-w-full truncate text-[9px] uppercase leading-tight tracking-[0.16em]",
              isActive ? "text-white" : "text-black/70",
            );

            if (item.action === "styleMe") {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setStyleMeOpen(true)}
                  className={itemClassName}
                >
                  <Icon
                    className="h-[18px] w-[18px] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span className={labelClassName}>{item.label}</span>
                </button>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={itemClassName}>
                <Icon
                  className="h-[18px] w-[18px] shrink-0"
                  strokeWidth={1.75}
                />
                <span className={labelClassName}>{item.label}</span>
                {item.showBadge && cartCount > 0 ? (
                  <span
                    className={cn(
                      "absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-medium",
                      isActive ? "bg-white text-black" : "bg-black text-white",
                    )}
                  >
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </motion.nav>

      <HamburgerMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        cartCount={cartCount}
        onStyleMe={() => setStyleMeOpen(true)}
      />
      <StyleMeModal open={styleMeOpen} onClose={() => setStyleMeOpen(false)} />
    </>
  );
}
