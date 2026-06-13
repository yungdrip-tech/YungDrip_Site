import Link from "next/link";

const footerLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/collection", label: "Collection" },
  { href: "/account", label: "Account" },
  { href: "/account/orders", label: "My Orders" }
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/refund-policy", label: "Refund & Return Policy" }
];

const socialLinks = [
  { href: "https://www.instagram.com/yungdrip.in/", label: "Instagram" }
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white py-14">
      <div className="shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="muted-label mb-3">YungDrip</p>
          <p className="font-serif text-4xl font-semibold">Minimal forms. Maximum presence.</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
            Premium everyday essentials crafted for those who wear silence. Monochrome. Minimal. Uncompromising.
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
          <p className="muted-label mb-3">Legal</p>
          <div className="space-y-3 text-sm text-black/65">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block">
                {link.label}
              </Link>
            ))}
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
      <div className="shell mt-10 border-t border-black/10 pt-6">
        <p className="text-xs text-black/35">
          &copy; {new Date().getFullYear()} YungDrip. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
