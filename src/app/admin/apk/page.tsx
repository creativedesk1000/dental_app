import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Smartphone, Download, ShieldCheck } from "lucide-react";

export default function ApkPage() {
  return (
    <AdminPageShell title="APK Management" description="Manage app builds, downloads, and release status.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-indigo-50 p-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-semibold">Latest build</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">v2.4.1</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Download className="h-4 w-4" />
            <span className="text-sm font-semibold">Downloads</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">8.4k</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Security status</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">Healthy</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
