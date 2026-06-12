"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { createCheckoutOrder, verifyCheckoutOrder } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutShell() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { items, cartCount, cartTotal, isHydrated, clearCart } = useCart();
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setShippingAddress((current) => ({
      ...current,
      fullName: current.fullName || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || ""
    }));
  }, [user]);

  const pricing = useMemo(() => {
    const tax = cartTotal * 0.12;
    const shipping = cartTotal >= 200 ? 0 : 12;
    const total = cartTotal + tax + shipping;

    return { tax, shipping, total };
  }, [cartTotal]);

  function updateField(field, value) {
    setShippingAddress((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const createdCheckout = await createCheckoutOrder({
        items,
        shippingAddress
      });

      if (!createdCheckout.keyId) {
        throw new Error("Razorpay public key is missing. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to continue.");
      }

      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        throw new Error("Razorpay checkout could not be loaded.");
      }

      const razorpay = new window.Razorpay({
        key: createdCheckout.keyId,
        amount: createdCheckout.razorpay.amount,
        currency: createdCheckout.razorpay.currency,
        name: "YungDrip",
        description: `Order ${createdCheckout.order.orderNumber}`,
        order_id: createdCheckout.razorpay.id,
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#111111"
        },
        modal: {
          ondismiss: () => setIsSubmitting(false)
        },
        handler: async (response) => {
          try {
            const verification = await verifyCheckoutOrder({
              orderId: createdCheckout.order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });

            clearCart();
            router.push(`/account/orders/${verification.order._id}?success=1`);
            router.refresh();
          } catch (verificationError) {
            setError(verificationError.message);
            setIsSubmitting(false);
          }
        }
      });

      razorpay.open();
    } catch (checkoutError) {
      setError(checkoutError.message);
      setIsSubmitting(false);
    }
  }

  if (isLoadingAuth || !isHydrated) {
    return <div className="panel h-80 animate-pulse" />;
  }

  if (!isAuthenticated) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Sign in before checkout.</h1>
        <p className="mt-3 text-sm text-black/60">Your account keeps your orders and delivery updates in one place.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/login?next=/checkout" asChild>
            Sign In
          </Button>
          <Button href="/register?next=/checkout" asChild variant="secondary">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Your cart is empty.</h1>
        <p className="mt-3 text-sm text-black/60">Add a few pieces to continue to checkout.</p>
        <Button href="/shop" asChild className="mt-6">
          Browse Shop
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCheckout} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="panel p-8">
        <p className="muted-label mb-4">Delivery details</p>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["fullName", "Full name"],
            ["email", "Email"],
            ["phone", "Phone number"],
            ["line1", "Address line 1"],
            ["line2", "Address line 2"],
            ["city", "City"],
            ["state", "State"],
            ["postalCode", "Postal code"],
            ["country", "Country"]
          ].map(([field, label]) => (
            <label key={field} className={`space-y-2 text-sm text-black/60 ${field === "line1" || field === "line2" ? "md:col-span-2" : ""}`}>
              <span>{label}</span>
              <input
                type={field === "email" ? "email" : "text"}
                value={shippingAddress[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="w-full rounded-[1.25rem] border border-black/10 px-4 py-3 outline-none transition focus:border-black/30"
                required={field !== "line2"}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="panel p-8">
          <p className="muted-label mb-4">Order summary</p>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.cartKey} className="flex items-start justify-between gap-4 border-b border-black/10 pb-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-black/55">
                    {item.size} / {item.color} • Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm text-black/60">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{cartCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax</span>
              <span>{formatCurrency(pricing.tax)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>{pricing.shipping === 0 ? "Free" : formatCurrency(pricing.shipping)}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-black/10 pt-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatCurrency(pricing.total)}</span>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Opening Razorpay..." : "Pay with Razorpay"}
          </Button>
          <p className="mt-3 text-xs text-black/45">
            Your payment is secured through Razorpay. Orders will appear in your account immediately after confirmation.
          </p>
        </div>

        <Link href="/cart" className="inline-flex text-sm text-black/55 underline-offset-4 hover:underline">
          Back to cart
        </Link>
      </div>
    </form>
  );
}
