"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchAdminOrderById, updateAdminOrderStatus } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/account/order-status-badge";

export default function AdminOrderDetail({ orderId }) {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsLoadingOrder(false);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        const payload = await fetchAdminOrderById(orderId);

        if (!cancelled) {
          setOrder(payload.order || null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, user?.isAdmin]);

  async function handleStatusChange(nextStatus) {
    try {
      setIsUpdating(true);
      setUpdateError("");
      const payload = await updateAdminOrderStatus(orderId, { status: nextStatus });
      setOrder(payload.order);
    } catch (updateErr) {
      setUpdateError(updateErr.message);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoadingAuth || isLoadingOrder) {
    return <div className="panel h-72 animate-pulse" />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">This order could not be loaded.</h1>
        <p className="mt-3 text-sm text-black/60">{error || "Try again in a moment."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="panel p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="muted-label mb-3">Admin order view</p>
            <h1 className="text-4xl font-semibold">{order.orderNumber}</h1>
            <p className="mt-3 text-sm text-black/60">
              {order.shippingAddress.fullName} • {order.shippingAddress.email}
            </p>
            <p className="mt-1 text-sm text-black/60">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <OrderStatusBadge status={order.status} />
            <span className="text-lg font-semibold">{formatCurrency(order.pricing.total)}</span>
          </div>
        </div>
      </div>

      <div className="panel p-6">
        <p className="muted-label mb-4">Update status</p>
        <div className="flex flex-wrap items-center gap-3">
          {["payment_pending", "processing", "packed", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              disabled={isUpdating || order.status === status}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition disabled:cursor-not-allowed ${
                order.status === status
                  ? "border-black bg-black text-white"
                  : "border-black/10 text-black/65 hover:border-black/20 hover:bg-black/5 disabled:opacity-40"
              }`}
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        {updateError ? (
          <p className="mt-3 text-sm text-red-600">{updateError}</p>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-8">
          <p className="muted-label mb-4">Items</p>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4 rounded-[1.5rem] border border-black/10 p-4">
                <div className="relative h-24 w-20 overflow-hidden rounded-[1rem] bg-black/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="mt-1 text-sm text-black/55">
                    {item.size} / {item.color} • Qty {item.quantity}
                  </p>
                  <p className="mt-3 font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="panel p-8">
            <p className="muted-label mb-4">Payment</p>
            <div className="space-y-2 text-sm text-black/60">
              <p>Status: {order.payment.status}</p>
              <p>Provider: {order.payment.provider}</p>
              <p>Razorpay order: {order.payment.razorpayOrderId || "N/A"}</p>
              <p>Payment ID: {order.payment.razorpayPaymentId || "N/A"}</p>
            </div>
          </div>

          <div className="panel p-8">
            <p className="muted-label mb-4">Shipping address</p>
            <div className="space-y-1 text-sm text-black/65">
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 ? <p>{order.shippingAddress.line2}</p> : null}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-3">{order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>

      <Button href="/admin/orders" asChild variant="secondary">
        Back to Admin Orders
      </Button>
    </div>
  );
}
