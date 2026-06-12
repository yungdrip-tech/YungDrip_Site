import OrdersList from "@/components/account/orders-list";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Orders | YungDrip"
};

export default function OrdersPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Account</p>
        <h1 className="text-5xl font-semibold">Your orders</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <OrdersList />
      </Reveal>
    </div>
  );
}
