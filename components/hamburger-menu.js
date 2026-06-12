"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Button from "@/components/button";

const menuColumns = [
  {
    title: "Categories",
    links: [
      { label: "Hoodies", href: "/shop?category=Hoodies" },
      { label: "T-Shirts", href: "/shop?category=T-Shirts" },
      { label: "Bottoms", href: "/shop?category=Bottoms" },
      { label: "Outerwear", href: "/shop?category=Outerwear" }
    ]
  },
  {
    title: "Collections",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Account", href: "/account" },
      { label: "Cart", href: "/cart" }
    ]
  },
  {
    title: "Shop by Color",
    links: [
      { label: "Jet Black", href: "/shop?search=Black" },
      { label: "Optic White", href: "/shop?search=White" },
      { label: "Soft Grey", href: "/shop?search=Grey" },
      { label: "Charcoal", href: "/shop?search=Charcoal" }
    ]
  },
  {
    title: "Accessories",
    links: [
      { label: "Style Me", href: "/shop" },
      { label: "Checkout", href: "/checkout" },
      { label: "Orders", href: "/account/orders" },
      { label: "Support", href: "/account" }
    ]
  }
];

export default function HamburgerMenu({ open, onClose, cartCount }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (!open) {
      return undefined;
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-[70] w-full bg-white text-black lg:max-w-[78vw]"
          >
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="shell flex h-20 items-center justify-between border-b border-black/10">
                <p className="font-serif text-3xl font-semibold tracking-[0.08em]">YungDrip</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="shell grid flex-1 gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
                <div className="grid gap-10 md:grid-cols-2">
                  {menuColumns.map((column, index) => (
                    <motion.div
                      key={column.title}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ duration: 0.35, delay: 0.08 + index * 0.06 }}
                    >
                      <p className="muted-label mb-4">{column.title}</p>
                      <div className="space-y-4">
                        {column.links.map((link) => (
                          <Link
                            key={link.label}
                            href={link.href}
                            onClick={onClose}
                            className="group flex items-center justify-between border-b border-black/10 pb-4 text-2xl font-medium"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                  className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-mist p-8"
                >
                  <div>
                    <p className="muted-label mb-3">Current Edit</p>
                    <h2 className="font-serif text-5xl font-semibold leading-none">
                      Precision silhouettes for a quieter wardrobe.
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-7 text-black/60">
                      Explore monochrome layering pieces, tailored essentials, and clean everyday forms designed for a
                      premium brand feel.
                    </p>
                  </div>

                  <div className="mt-10 space-y-5">
                    <div className="border-t border-black/10 pt-5 text-sm text-black/60">
                      Cart: {cartCount} item{cartCount === 1 ? "" : "s"}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button href="/shop" asChild onClick={onClose}>
                        Browse shop
                      </Button>
                      <Button href="/cart" asChild variant="secondary" onClick={onClose}>
                        View cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
