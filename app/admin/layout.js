import AdminNav from "@/components/admin/admin-nav";

export default function AdminLayout({ children }) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  );
}
