import ProductDetailClient from "@/components/product-detail-client";

export async function generateMetadata() {
  return {
    title: "Product | YungDrip",
    description: "Product detail page"
  };
}

export default function ProductDetailPage({ params }) {
  return (
    <div className="shell py-12">
      <ProductDetailClient productId={params.id} />
    </div>
  );
}
