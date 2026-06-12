"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchAdminStats } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const STATUS_LABELS = {
  payment_pending: "Awaiting Payment",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
};

export default function AdminStatsDashboard() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadStats() {
      try {
        const payload = await fetchAdminStats();

        if (!cancelled) {
          setStats(payload.stats);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [user?.isAdmin]);

  if (isLoadingAuth || isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="panel h-28 animate-pulse" />
          ))}
        </div>
        <div className="panel h-48 animate-pulse" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
      </div>
    );
  }

  if (error) {
    return <div className="panel p-8 text-sm text-red-600">{error}</div>;
  }

  const pendingCount = stats.statusCounts.payment_pending || 0;
  const processingCount = stats.statusCounts.processing || 0;
  const shippedCount = stats.statusCounts.shipped || 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="panel p-6">
          <p className="muted-label mb-2">Total Revenue</p>
          <p className="text-4xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
          <p className="mt-2 text-xs text-black/45">From paid orders</p>
        </div>
        <div className="panel p-6">
          <p className="muted-label mb-2">Total Orders</p>
          <p className="text-4xl font-semibold">{stats.totalOrders}</p>
          <p className="mt-2 text-xs text-black/45">{pendingCount} awaiting payment</p>
        </div>
        <div className="panel p-6">
          <p className="muted-label mb-2">Products</p>
          <p className="text-4xl font-semibold">{stats.totalProducts}</p>
          <Link href="/admin/products" className="mt-2 block text-xs text-black/45 underline-offset-4 hover:underline">
            Manage catalog
          </Link>
        </div>
        <div className="panel p-6">
          <p className="muted-label mb-2">Users</p>
          <p className="text-4xl font-semibold">{stats.totalUsers}</p>
          <Link href="/admin/users" className="mt-2 block text-xs text-black/45 underline-offset-4 hover:underline">
            Manage users
          </Link>
        </div>
      </div>

      <div className="panel p-8">
        <p className="muted-label mb-6">Orders by status</p>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div key={status} className="rounded-[1.5rem] border border-black/10 p-4">
              <p className="text-2xl font-semibold">{stats.statusCounts[status] || 0}</p>
              <p className="mt-1 text-xs text-black/55">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Link
          href="/admin/orders"
          className="panel p-6 transition hover:-translate-y-0.5 hover:border-black/20"
        >
          <p className="muted-label mb-2">Manage Orders</p>
          <p className="text-lg font-semibold">
            {processingCount + shippedCount} active orders
          </p>
          <p className="mt-1 text-sm text-black/55">View and update order status</p>
        </Link>
        <Link
          href="/admin/products"
          className="panel p-6 transition hover:-translate-y-0.5 hover:border-black/20"
        >
          <p className="muted-label mb-2">Manage Products</p>
          <p className="text-lg font-semibold">{stats.totalProducts} in catalog</p>
          <p className="mt-1 text-sm text-black/55">Add, edit, or remove products</p>
        </Link>
        <Link
          href="/admin/users"
          className="panel p-6 transition hover:-translate-y-0.5 hover:border-black/20"
        >
          <p className="muted-label mb-2">Manage Users</p>
          <p className="text-lg font-semibold">{stats.totalUsers} registered</p>
          <p className="mt-1 text-sm text-black/55">View accounts and manage roles</p>
        </Link>
      </div>
    </div>
  );
}
