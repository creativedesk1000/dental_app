import { AdminDashboardCards } from "@/components/admin/AdminDashboardCards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Monitor the performance and growth of the DentalSaaS platform.</p>
      </div>

      <AdminDashboardCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-none shadow-sm shadow-gray-200">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-t border-gray-100 bg-gray-50/50">
            <p className="text-gray-500 text-sm">Live chart data will be wired in the next iteration.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-gray-200">
          <CardHeader>
            <CardTitle>Recent Clinics Registered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500">
              Recent clinic activity is supplied by the admin stats API.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
