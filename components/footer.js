import Link from "next/link";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/account", label: "Account" }
];

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://pinterest.com", label: "Pinterest" },
  { href: "https://x.com", label: "X" }
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white py-14">
      <div className="shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="muted-label mb-3">YungDrip</p>
          <p className="font-serif text-4xl font-semibold">Minimal forms. Maximum presence.</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
            A refined monochrome storefront built with Next.js, Tailwind CSS, Framer Motion, and MongoDB.
          </p>
        </div>

        <div>
          <p className="muted-label mb-3">Navigate</p>
          <div className="space-y-3 text-sm text-black/65">
            <Link href="/">Home</Link>
            {footerLinks.map((link) =>
              link.href.startsWith("/api") ? (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="block">
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href} className="block">
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div>
          <p className="muted-label mb-3">Social</p>
          <div className="space-y-3 text-sm text-black/65">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="block">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
