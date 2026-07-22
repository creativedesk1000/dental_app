import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Users, CalendarDays, HeartPulse } from "lucide-react";

export default function PatientsPage() {
  return (
    <AdminPageShell title="Patients" description="Track clinic patients and care activity.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Patients</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">4,218</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Appointments today</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">87</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <HeartPulse className="h-4 w-4" />
            <span className="text-sm font-semibold">Care plans</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">312</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
