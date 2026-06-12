import AdminProductForm from "@/components/admin/admin-product-form";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Add Product | YungDrip Admin"
};

export default function NewProductPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin / Products</p>
        <h1 className="text-5xl font-semibold">Add product</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminProductForm />
      </Reveal>
    </div>
  );
}
