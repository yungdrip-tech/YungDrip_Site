import AdminStatsDashboard from "@/components/admin/admin-stats-dashboard";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Admin Dashboard | YungDrip"
};

export default function AdminDashboardPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin</p>
        <h1 className="text-5xl font-semibold">Dashboard</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminStatsDashboard />
      </Reveal>
    </div>
  );
}
