"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/button";
import MenuToggleIcon from "@/components/menu-toggle-icon";

const categoryLinks = [
  { label: "Hoodies", href: "/shop?category=Hoodies" },
  { label: "T-Shirts", href: "/shop?category=T-Shirts" },
  { label: "Bottoms", href: "/shop?category=Bottoms" },
  { label: "Outerwear", href: "/shop?category=Outerwear" },
];

const menuColumns = [
  {
    title: "Collections",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collection" },
      { label: "Account", href: "/account" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "Shop by Color",
    links: [
      { label: "Jet Black", href: "/shop?search=Black" },
      { label: "Optic White", href: "/shop?search=White" },
      { label: "Soft Grey", href: "/shop?search=Grey" },
      { label: "Charcoal", href: "/shop?search=Charcoal" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Account", href: "/account" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Contact", href: "mailto:support@yungdrip.in" },
    ],
  },
];

function MenuLink({ link, onClose }) {
  const className =
    "group flex items-center justify-between border-b border-black/10 pb-4 text-xl font-medium transition hover:text-black/70 sm:text-2xl";

  if (link.href.startsWith("mailto:")) {
    return (
      <a key={link.label} href={link.href} className={className}>
        <span>{link.label}</span>
        <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
    );
  }

  return (
    <Link
      key={link.label}
      href={link.href}
      onClick={onClose}
      className={className}
    >
      <span>{link.label}</span>
      <ArrowUpRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
    </Link>
  );
}

export default function HamburgerMenu({ open, onClose, cartCount, onStyleMe }) {
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
            className="fixed inset-x-0 bottom-0 top-14 z-[60] bg-black/35 backdrop-blur-sm md:top-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 right-0 top-14 z-[70] flex w-full flex-col bg-white text-black md:top-20 lg:max-w-[78vw]"
          >
            <div className="hidden h-20 shrink-0 items-center justify-between border-b border-black/10 px-6 md:flex">
              <p className="font-serif text-3xl font-semibold tracking-[0.08em]">
                Menu
              </p>
              {/* <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition hover:border-black/20"
                aria-label="Close menu"
              >
                <MenuToggleIcon open />
              </button> */}
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="shell flex-1 py-6 sm:py-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:py-14">
                <div className="space-y-8 sm:space-y-10">
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.35, delay: 0.08 }}
                  >
                    <p className="muted-label mb-4">Categories</p>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {categoryLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={onClose}
                          className="group flex items-center justify-between rounded-[1.25rem] border border-black/10 bg-mist px-4 py-4 text-sm font-medium uppercase tracking-[0.18em] transition hover:border-black/20 hover:bg-white sm:px-5 sm:py-5 sm:text-base"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>

                  <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
                    {menuColumns.map((column, index) => (
                      <motion.div
                        key={column.title}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.14 + index * 0.06,
                        }}
                      >
                        <p className="muted-label mb-4">{column.title}</p>
                        <div className="space-y-4">
                          {column.links.map((link) => (
                            <MenuLink
                              key={link.label}
                              link={link}
                              onClose={onClose}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                  className="mt-8 flex flex-col justify-between rounded-[2rem] border border-black/10 bg-mist p-6 sm:p-8 lg:mt-0"
                >
                  <div>
                    <p className="muted-label mb-3">Current Edit</p>
                    <h2 className="font-serif text-3xl font-semibold leading-none sm:text-5xl">
                      Precision silhouettes for a quieter wardrobe.
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-7 text-black/60">
                      Explore monochrome layering pieces, tailored essentials,
                      and clean everyday forms designed for a premium brand
                      feel.
                    </p>
                  </div>

                  <div className="mt-8 space-y-5 sm:mt-10">
                    <div className="border-t border-black/10 pt-5 text-sm text-black/60">
                      Cart: {cartCount} item{cartCount === 1 ? "" : "s"}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button href="/shop" asChild onClick={onClose}>
                        Browse shop
                      </Button>
                      <Button
                        asChild={false}
                        variant="secondary"
                        onClick={() => {
                          onClose();
                          onStyleMe?.();
                        }}
                      >
                        Style Me
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
