import { Suspense } from "react";
import ShopPageClient from "@/components/shop-page-client";

export const metadata = {
  title: "Shop | YungDrip"
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="shell py-12"><div className="h-80 animate-pulse rounded-[2rem] bg-black/5" /></div>}>
      <ShopPageClient />
    </Suspense>
  );
}
