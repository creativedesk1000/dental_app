"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react";

type Clinic = {
  id: string;
  name: string;
  subdomain: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  createdAt: string;
  subscription: { status: string; plan: string } | null;
  _count: { users: number };
};

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/clinics", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Failed to load clinics");
        const payload = await res.json();
        if (mounted) setClinics(payload.data as Clinic[]);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load clinics");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, []);

  const total = clinics.length;
  const active = clinics.filter((c) => c.status === "ACTIVE").length;
  const pending = clinics.filter((c) => c.status === "INACTIVE").length;
  const suspended = clinics.filter((c) => c.status === "SUSPENDED").length;

  if (loading) {
    return (
      <AdminPageShell title="Clinics" description="Monitor multi-clinic onboarding, account status, and operations.">
        <p className="text-sm text-gray-500">Loading clinics...</p>
      </AdminPageShell>
    );
  }

  if (error) {
    return (
      <AdminPageShell title="Clinics" description="Monitor multi-clinic onboarding, account status, and operations.">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Clinics"
      description="Monitor multi-clinic onboarding, account status, and operations."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Total Clinics</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Active</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{active}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Suspended / Pending</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{suspended + pending}</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Clinic</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Subdomain</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Users</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {clinics.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No clinics registered yet.
                </td>
              </tr>
            )}
            {clinics.map((clinic) => (
              <tr key={clinic.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{clinic.name}</td>
                <td className="px-4 py-3 text-gray-600">{clinic.subdomain}</td>
                <td className="px-4 py-3 text-gray-600">{clinic._count.users}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      clinic.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : clinic.status === "INACTIVE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {clinic.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}

