"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { fetchAdminUsers, updateAdminUserRole } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";

export default function AdminUserList() {
  const { user: currentUser, isLoading: isLoadingAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    if (!currentUser?.isAdmin) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      try {
        const payload = await fetchAdminUsers();

        if (!cancelled) {
          setUsers(payload.users || []);
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

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.isAdmin]);

  async function handleRoleToggle(userId, currentRole) {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    const confirm = window.confirm(
      `Change this user's role to "${nextRole}"?`
    );

    if (!confirm) return;

    try {
      setUpdatingId(userId);
      setError("");
      const payload = await updateAdminUserRole(userId, { role: nextRole });
      setUsers((current) =>
        current.map((u) => (u._id === userId ? payload.user : u))
      );
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId("");
    }
  }

  if (isLoadingAuth || isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="panel h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="panel p-10 text-center">
        <h1 className="text-4xl font-semibold">Admin access required.</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-black/55">{users.length} registered users</p>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">{error}</div>
      ) : null}

      <div className="space-y-3">
        {users.map((u) => {
          const isSelf = u._id === currentUser._id;

          return (
            <div key={u._id} className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{u.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] ${
                      u.role === "admin"
                        ? "bg-black text-white"
                        : "border border-black/15 text-black/55"
                    }`}
                  >
                    {u.role}
                  </span>
                  {isSelf ? (
                    <span className="text-xs text-black/40">(you)</span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-black/55">{u.email}</p>
                {u.phone ? <p className="text-sm text-black/40">{u.phone}</p> : null}
                <p className="mt-1 text-xs text-black/35">Joined {formatDate(u.createdAt)}</p>
              </div>

              {!isSelf ? (
                <button
                  type="button"
                  onClick={() => handleRoleToggle(u._id, u.role)}
                  disabled={updatingId === u._id}
                  className="flex-shrink-0 rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-[0.18em] transition hover:border-black/20 hover:bg-black/5 disabled:opacity-50"
                >
                  {updatingId === u._id
                    ? "Updating..."
                    : u.role === "admin"
                    ? "Remove admin"
                    : "Make admin"}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
