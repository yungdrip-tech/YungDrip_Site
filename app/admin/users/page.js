import AdminUserList from "@/components/admin/admin-user-list";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Admin Users | YungDrip"
};

export default function AdminUsersPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Admin</p>
        <h1 className="text-5xl font-semibold">Users</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <AdminUserList />
      </Reveal>
    </div>
  );
}
