"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchAdminOrders, updateAdminOrderStatus } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/account/order-status-badge";

const statusOptions = ["payment_pending", "processing", "packed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersDashboard() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsLoadingOrders(false);
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        setIsLoadingOrders(true);
        const payload = await fetchAdminOrders({
          status: activeStatus === "all" ? "" : activeStatus
        });

        if (!cancelled) {
          setOrders(payload.orders || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrders(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [activeStatus, user?.isAdmin]);

  async function handleStatusChange(orderId, status) {
    try {
      setUpdatingOrderId(orderId);
      setError("");
      const payload = await updateAdminOrderStatus(orderId, { status });

      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === orderId ? payload.order : order))
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingOrderId("");
    }
  }

  if (isLoadingAuth || isLoadingOrders) {
    return <div className="panel h-64 animate-pulse" />;
  }

  if (!user?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
        <p className="mt-3 text-sm text-black/60">Only admin accounts can manage order state.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel p-6">
        <div className="flex flex-wrap gap-3">
          {["all", ...statusOptions].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${activeStatus === status ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/65 hover:border-black/20"}`}
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="panel p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold">{order.orderNumber}</h2>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-2 text-sm text-black/55">
                  {order.shippingAddress.fullName} • {order.shippingAddress.email} • {formatDate(order.createdAt)}
                </p>
                <p className="mt-1 text-sm text-black/55">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"} • {formatCurrency(order.pricing.total)}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={order.status}
                  onChange={(event) => handleStatusChange(order._id, event.target.value)}
                  disabled={updatingOrderId === order._id}
                  className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-black/25"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>

                <Button href={`/admin/orders/${order._id}`} asChild variant="secondary">
                  Open Detail
                </Button>
              </div>
            </div>

            <div className="mt-5 border-t border-black/10 pt-4 text-sm text-black/55">
              Payment: {order.payment.status} {order.payment.razorpayPaymentId ? `• ${order.payment.razorpayPaymentId}` : ""}
            </div>
          </div>
        ))}

        {orders.length === 0 ? (
          <div className="panel p-10 text-center">
            <h2 className="text-3xl font-semibold">No matching orders</h2>
            <p className="mt-3 text-sm text-black/60">Orders will appear here once payments begin flowing in.</p>
            <Link href="/account" className="mt-6 inline-flex text-sm text-black/55 underline-offset-4 hover:underline">
              Back to account
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
