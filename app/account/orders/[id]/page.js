import OrderDetail from "@/components/account/order-detail";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Order Details | YungDrip"
};

export default function OrderDetailPage({ params }) {
  return (
    <div className="shell py-12">
      <Reveal>
        <OrderDetail orderId={params.id} />
      </Reveal>
    </div>
  );
}
