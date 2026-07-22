import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { HeartPulse, Stethoscope, CalendarDays } from "lucide-react";

export default function DoctorsPage() {
  return (
    <AdminPageShell title="Doctors" description="Review doctor availability and clinic coverage.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <HeartPulse className="h-4 w-4" />
            <span className="text-sm font-semibold">Active doctors</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">36</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-cyan-50 p-4">
          <div className="flex items-center gap-2 text-cyan-700">
            <Stethoscope className="h-4 w-4" />
            <span className="text-sm font-semibold">Specialties</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">12</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Schedules</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">94</p>
        </div>
      </div>
    </AdminPageShell>
  );
}
