import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Users, ShieldCheck, Sparkles } from "lucide-react";

const users = [
  { name: "Ava Brooks", role: "Super Admin", status: "Online" },
  { name: "Noah Kim", role: "Clinic Admin", status: "Away" },
  { name: "Sofia Chen", role: "Doctor", status: "Online" },
];

export default function UsersPage() {
  return (
    <AdminPageShell title="Users" description="Manage team access, permissions, and account health.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-violet-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Active users</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">1,204</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">Admins</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">28</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold">New this week</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">41</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div key={user.name} className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3">
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{user.status}</span>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
