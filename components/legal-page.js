import Link from "next/link";

export default function LegalPage({ eyebrow, title, updatedAt, children }) {
  return (
    <div className="shell py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <p className="muted-label mb-3">{eyebrow}</p>
          <h1 className="text-5xl font-semibold">{title}</h1>
          {updatedAt ? (
            <p className="mt-4 text-sm text-black/50">Last updated: {updatedAt}</p>
          ) : null}
        </div>

        <div className="panel space-y-10 p-8 md:p-10">{children}</div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-black/55">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-black">
            Privacy Policy
          </Link>
          <Link href="/terms" className="underline underline-offset-4 hover:text-black">
            Terms of Service
          </Link>
          <Link href="/refund-policy" className="underline underline-offset-4 hover:text-black">
            Refund & Return Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-black/65">{children}</div>
    </section>
  );
}
