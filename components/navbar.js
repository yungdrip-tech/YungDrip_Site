"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Menu, Package2, Search, ShoppingBag, Sparkles, User } from "lucide-react";
import HamburgerMenu from "@/components/hamburger-menu";
import StyleMeModal from "@/components/style-me-modal";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/shop", label: "New In" },
  { href: "/collection", label: "Collection" }
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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 hidden border-b transition-all duration-500 md:block",
          isSolid
            ? "border-black/10 bg-white/92 text-black backdrop-blur-xl"
            : "border-transparent bg-transparent text-white"
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
                  isSolid ? "text-black/70 hover:text-black" : "text-white/80 hover:text-white"
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
                isSolid ? "text-black/70 hover:text-black" : "text-white/80 hover:text-white"
              )}
            >
              Style Me
            </button>
          </nav>

          <Link href="/" className="justify-self-center font-serif text-3xl font-semibold tracking-[0.08em]">
            YungDrip
          </Link>

          <div className="flex items-center justify-self-end gap-2">
            <Link
              href="/shop"
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              )}
              aria-label="Search products"
            >
              <Search className="h-4 w-4" />
            </Link>

            <Link
              href={user ? "/account" : "/login"}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              )}
              aria-label={user ? "Account" : "Sign in"}
            >
              <User className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "relative inline-flex h-10 w-10 items-center justify-center rounded-full border transition",
                isSolid
                  ? "border-black/10 bg-white text-black hover:border-black/20"
                  : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              )}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <motion.nav
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 pt-2 md:hidden"
      >
        <div
          className={cn(
            "mx-auto grid max-w-md grid-cols-5 items-center rounded-[1.75rem] border border-black/10 bg-white px-2 py-2 shadow-soft"
          )}
        >
          <Link
            href="/shop"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/75 transition hover:bg-black/5"
          >
            <Package2 className="h-4 w-4" />
            <span>New In</span>
          </Link>

          <Link
            href="/collection"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/75 transition hover:bg-black/5"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Collection</span>
          </Link>

          <Link
            href="/cart"
            className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/75 transition hover:bg-black/5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Cart</span>
            {cartCount > 0 ? (
              <span className="absolute right-3 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-medium text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={() => setStyleMeOpen(true)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/75 transition hover:bg-black/5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Style Me</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.25rem] px-2 text-center text-[10px] uppercase tracking-[0.18em] text-black/75 transition hover:bg-black/5"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
        </div>
      </motion.nav>

      <HamburgerMenu open={menuOpen} onClose={() => setMenuOpen(false)} cartCount={cartCount} />
      <StyleMeModal open={styleMeOpen} onClose={() => setStyleMeOpen(false)} />
    </>
  );
}
