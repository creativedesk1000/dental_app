import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Settings, BellRing, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <AdminPageShell title="Settings" description="Configure platform defaults, notifications, and security controls.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-semibold">Platform defaults</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-900">Timezone, branding, and templates</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <BellRing className="h-4 w-4" />
            <span className="text-sm font-semibold">Notifications</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-900">Email and SMS alerts enabled</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Security</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-900">MFA and audit logging enabled</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
