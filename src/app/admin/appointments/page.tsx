import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CalendarDays, Clock3, CheckCircle2 } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <AdminPageShell title="Appointments" description="Review upcoming appointments and scheduling activity.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Today</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">24</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Pending confirmations</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">11</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Completed</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">182</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
