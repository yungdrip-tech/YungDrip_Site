"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchOrders } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import OrderStatusBadge from "@/components/account/order-status-badge";

export default function AccountDashboard() {
  const { user, isLoading: isLoadingAuth, isAuthenticated, logout } = useAuth();
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
        setIsLoadingOrders(true);
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

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      totalSpend: orders.reduce((total, order) => total + order.pricing.total, 0)
    };
  }, [orders]);

  if (isLoadingAuth) {
    return (
      <div className="panel p-10">
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-black/5" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="panel p-10 text-center">
        <p className="muted-label mb-3">Account</p>
        <h1 className="text-5xl font-semibold">Sign in to view your account.</h1>
        <p className="mx-auto mt-4 max-w-xl text-black/60">
          Keep track of your orders, checkout faster, and manage your profile from one place.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/login" asChild>
            Sign In
          </Button>
          <Button href="/register" asChild variant="secondary">
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="panel p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="muted-label mb-3">Your profile</p>
            <h1 className="text-5xl font-semibold">{user.name}</h1>
            <p className="mt-3 text-sm text-black/60">{user.email}</p>
            {user.phone ? <p className="mt-1 text-sm text-black/60">{user.phone}</p> : null}
          </div>

          <div className="flex gap-3">
            {user.isAdmin ? (
              <Button href="/admin/orders" asChild variant="secondary">
                Admin Orders
              </Button>
            ) : null}
            <Button href="/account/orders" asChild variant="secondary">
              View Orders
            </Button>
            <Button onClick={logout} variant="ghost">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="panel p-6">
          <p className="muted-label mb-2">Orders</p>
          <p className="text-4xl font-semibold">{stats.totalOrders}</p>
        </div>
        <div className="panel p-6">
          <p className="muted-label mb-2">Active</p>
          <p className="text-4xl font-semibold">{stats.activeOrders}</p>
        </div>
        <div className="panel p-6">
          <p className="muted-label mb-2">Spend</p>
          <p className="text-4xl font-semibold">{formatCurrency(stats.totalSpend)}</p>
        </div>
      </div>

      <div className="panel p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="muted-label mb-2">Recent activity</p>
            <h2 className="text-3xl font-semibold">Latest orders</h2>
          </div>
          <Link href="/account/orders" className="text-sm uppercase tracking-[0.22em] text-black/55">
            See all
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[1.5rem] bg-black/5" />
            ))}
          </div>
        ) : null}

        {!isLoadingOrders && error ? (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
        ) : null}

        {!isLoadingOrders && !error && orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-black/15 p-8 text-center">
            <h3 className="text-2xl font-semibold">No orders yet</h3>
            <p className="mt-3 text-sm text-black/60">Start shopping and your orders will appear here.</p>
            <Button href="/shop" asChild className="mt-6">
              Browse Shop
            </Button>
          </div>
        ) : null}

        {!isLoadingOrders && !error && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-black/10 p-5 transition hover:border-black/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-black/55">{formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-semibold">{formatCurrency(order.pricing.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
