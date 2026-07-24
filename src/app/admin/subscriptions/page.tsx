"use client";

import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CreditCard, TrendingUp } from "lucide-react";

type ClinicWithSubscription = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  createdAt: string;
  subscription: {
    id: string;
    plan: string;
    status: string;
    startDate?: string;
  } | null;
};

type Subscription = {
  id: string;
  clinicId: string;
  clinic: { name: string; subdomain: string; status: string };
  plan: string;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/clinics", { credentials: "same-origin" });
        if (!res.ok) throw new Error("Failed to load data");
        const payload = await res.json();
        if (mounted) {
          const clinics = payload.data as ClinicWithSubscription[];
          const subs: Subscription[] = [];
          for (const c of clinics) {
            if (c.subscription) {
              subs.push({
                id: c.subscription.id,
                clinicId: c.id,
                clinic: { name: c.name, subdomain: c.subdomain, status: c.status },
                plan: c.subscription.plan,
                status: c.subscription.status,
                startDate: c.subscription.startDate || c.createdAt,
                endDate: null,
                createdAt: c.createdAt,
              });
            }
          }
          setSubscriptions(subs);
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load subscriptions");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, []);

  const planCounts: Record<string, number> = {};
  const planRevenue: Record<string, number> = { STARTER: 149, GROWTH: 299, ENTERPRISE: 499 };
  let totalRevenue = 0;

  for (const sub of subscriptions) {
    if (sub.status === "ACTIVE") {
      planCounts[sub.plan] = (planCounts[sub.plan] || 0) + 1;
      totalRevenue += planRevenue[sub.plan] || 0;
    }
  }

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const inactiveSubs = subscriptions.filter((s) => s.status !== "ACTIVE").length;

  if (loading) {
    return (
      <AdminPageShell title="Subscriptions" description="Review plan adoption, renewals, and revenue health.">
        <p className="text-sm text-gray-500">Loading subscriptions...</p>
      </AdminPageShell>
    );
  }

  if (error) {
    return (
      <AdminPageShell title="Subscriptions" description="Review plan adoption, renewals, and revenue health.">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title="Subscriptions"
      description="Review plan adoption, renewals, and revenue health."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {["STARTER", "GROWTH", "ENTERPRISE"].map((plan) => (
          <div key={plan} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-semibold">{plan}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{planCounts[plan] || 0}</p>
            <p className="mt-1 text-sm text-gray-500">
              Revenue ${((planCounts[plan] || 0) * (planRevenue[plan] || 0)).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-700">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">Subscription overview</span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
            {activeSubs} active
          </span>
          <span className="text-gray-400">|</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold text-gray-700">
            {inactiveSubs} inactive
          </span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold text-gray-700">
            ${totalRevenue.toLocaleString()}/mo projected
          </span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Clinic</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No subscriptions yet.
                </td>
              </tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{sub.clinic.name}</td>
                <td className="px-4 py-3 text-gray-600">{sub.plan}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      sub.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {sub.status}
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
