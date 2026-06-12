import CartShell from "@/components/cart-shell";
import Reveal from "@/components/reveal";

export const metadata = {
  title: "Cart | YungDrip"
};

export default function CartPage() {
  return (
    <div className="shell py-12">
      <Reveal className="mb-8">
        <p className="muted-label mb-2">Your selections</p>
        <h1 className="text-5xl font-semibold">Shopping cart</h1>
      </Reveal>
      <Reveal delay={0.08}>
        <CartShell />
      </Reveal>
    </div>
  );
}
