import AdminOrderDetail from "@/components/account/admin-order-detail";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Admin Order Detail | YungDrip"
};

export default function AdminOrderDetailPage({ params }) {
  return (
    <div className="shell py-12">
      <Reveal>
        <AdminOrderDetail orderId={params.id} />
      </Reveal>
    </div>
  );
}
