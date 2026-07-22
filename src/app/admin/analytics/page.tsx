import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Activity, TrendingUp, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <AdminPageShell title="Analytics" description="Track platform growth metrics and system health.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-700">
            <BarChart3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Weekly growth</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">+12.3%</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-semibold">Retention</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">94.2%</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-semibold">Uptime</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">99.99%</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
