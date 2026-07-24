"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Users, ShieldCheck, Sparkles } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  clinicId: string | null;
  clinic: { id: string; name: string } | null;
  emailVerified: string | null;
  lastLoginAt: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/users", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Failed to load users");
        const payload = await res.json();
        if (mounted) setUsers(payload.data as User[]);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, []);

  const total = users.length;
  const admins = users.filter((u) => u.role === "CLINIC_ADMIN").length;
  const doctors = users.filter((u) => u.role === "DOCTOR").length;
  const receptionists = users.filter((u) => u.role === "RECEPTIONIST").length;

  if (loading) {
    return (
      <AdminPageShell title="Users" description="Manage team access, permissions, and account health.">
        <p className="text-sm text-gray-500">Loading users...</p>
      </AdminPageShell>
    );
  }

  if (error) {
    return (
      <AdminPageShell title="Users" description="Manage team access, permissions, and account health.">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell title="Users" description="Manage team access, permissions, and account health.">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-violet-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Total users</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Clinic Admins</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{admins}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Doctors</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{doctors}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">Receptionists</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{receptionists}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {users.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No users found.</p>
        )}
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
            <div>
              <p className="font-semibold text-gray-900">{user.name || "Unnamed"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">{user.role} {user.clinic ? `• ${user.clinic.name}` : ""}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {user.lastLoginAt ? "Active" : "Never logged in"}
            </span>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}

