import AdminProductForm from "@/components/admin/admin-product-form";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Edit Product | YungDrip Admin"
};

export default function EditProductPage({ params }) {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin / Products</p>
        <h1 className="text-5xl font-semibold">Edit product</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminProductForm productId={params.id} />
      </Reveal>
    </div>
  );
}
