import AdminProductList from "@/components/admin/admin-product-list";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Admin Products | YungDrip"
};

export default function AdminProductsPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin</p>
        <h1 className="text-5xl font-semibold">Products</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminProductList />
      </Reveal>
    </div>
  );
}
