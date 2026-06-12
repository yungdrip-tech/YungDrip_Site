import CheckoutShell from "@/components/checkout-shell";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Checkout | YungDrip"
};

export default function CheckoutPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Secure checkout</p>
        <h1 className="text-5xl font-semibold">Complete your order</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <CheckoutShell />
      </Reveal>
    </div>
  );
}
