import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Database, Cpu, HardDrive } from "lucide-react";

export default function DatabasePage() {
  return (
    <AdminPageShell title="Database" description="Inspect storage, performance, and data health.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <HardDrive className="h-4 w-4" />
            <span className="text-sm font-semibold">Storage</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">2.1 TB</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-cyan-50 p-4">
          <div className="flex items-center gap-2 text-cyan-700">
            <Cpu className="h-4 w-4" />
            <span className="text-sm font-semibold">CPU load</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">31%</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Database className="h-4 w-4" />
            <span className="text-sm font-semibold">Connections</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">148</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
