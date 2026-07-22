import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Building2, CheckCircle2, Clock3, AlertCircle } from "lucide-react";

const clinics = [
  { name: "Smile Bright Dental", city: "New York", status: "Active", owner: "Dr. Maya Khan" },
  { name: "Oak Park Family Dentistry", city: "Chicago", status: "Pending", owner: "Alicia Reed" },
  { name: "Sunset Oral Care", city: "Austin", status: "Suspended", owner: "John Patel" },
];

export default function ClinicsPage() {
  return (
    <AdminPageShell
      title="Clinics"
      description="Monitor multi-clinic onboarding, account status, and operations."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Total Clinics</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">142</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-green-50 p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Active</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">128</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Pending Review</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">14</p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Clinic</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Owner</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">City</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {clinics.map((clinic) => (
              <tr key={clinic.name}>
                <td className="px-4 py-3 font-medium text-gray-900">{clinic.name}</td>
                <td className="px-4 py-3 text-gray-600">{clinic.owner}</td>
                <td className="px-4 py-3 text-gray-600">{clinic.city}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${clinic.status === "Active" ? "bg-green-100 text-green-700" : clinic.status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {clinic.status === "Suspended" ? <AlertCircle className="h-3.5 w-3.5" /> : null}
                    {clinic.status}
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
