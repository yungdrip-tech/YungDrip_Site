import Button from "@/components/button";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[60vh] items-center justify-center py-20">
      <div className="panel max-w-2xl p-10 text-center">
        <p className="muted-label mb-4">404</p>
        <h1 className="text-5xl font-semibold">That piece is no longer on the rack.</h1>
        <p className="mt-4 text-black/65">
          The page you were looking for could not be found. Head back to the storefront and keep exploring.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/shop" asChild>
            Browse the collection
          </Button>
        </div>
      </div>
    </div>
  );
}
