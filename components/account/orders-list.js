"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchOrders } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/account/order-status-badge";

export default function OrdersList() {
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingOrders(false);
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      try {
        const payload = await fetchOrders();

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
  }, [isAuthenticated]);

  if (isLoadingAuth || isLoadingOrders) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="panel h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Sign in to track your orders.</h1>
        <Button href="/login?next=/account/orders" asChild className="mt-6">
          Sign In
        </Button>
      </div>
    );
  }

  if (error) {
    return <div className="panel p-8 text-sm text-red-600">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">No orders placed yet.</h1>
        <p className="mt-3 text-sm text-black/60">Once you checkout, your order timeline will show up here.</p>
        <Button href="/shop" asChild className="mt-6">
          Start Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order._id}
          href={`/account/orders/${order._id}`}
          className="panel flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:border-black/20 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-lg font-semibold">{order.orderNumber}</p>
            <p className="mt-1 text-sm text-black/55">
              {order.items.length} item{order.items.length === 1 ? "" : "s"} • {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm font-semibold">{formatCurrency(order.pricing.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
