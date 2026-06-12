import AdminOrdersDashboard from "@/components/account/admin-orders-dashboard";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Admin Orders | YungDrip"
};

export default function AdminOrdersPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin</p>
        <h1 className="text-5xl font-semibold">Order management</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminOrdersDashboard />
      </Reveal>
    </div>
  );
}
