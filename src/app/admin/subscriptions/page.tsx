import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CreditCard, TrendingUp, ArrowRightLeft } from "lucide-react";

const plans = [
  { name: "Starter", count: 96, revenue: "$18.2k" },
  { name: "Growth", count: 34, revenue: "$14.6k" },
  { name: "Enterprise", count: 12, revenue: "$9.8k" },
];

export default function SubscriptionsPage() {
  return (
    <AdminPageShell
      title="Subscriptions"
      description="Review plan adoption, renewals, and revenue health."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-gray-700">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm font-semibold">{plan.name}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{plan.count}</p>
            <p className="mt-1 text-sm text-gray-500">Revenue {plan.revenue}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-700">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">Retention trend</span>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">+8.4%</span>
          <span className="flex items-center gap-1">
            <ArrowRightLeft className="h-4 w-4" />
            92% renewal rate this quarter
          </span>
        </div>
      </div>
    </AdminPageShell>
  );
}
