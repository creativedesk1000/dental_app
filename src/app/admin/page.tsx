import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, CreditCard, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 mt-1">Monitor the performance and growth of the DentalSaaS platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Clinics", value: "142", icon: Building2, trend: "+12% from last month", color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Active Subscriptions", value: "$45,200", icon: CreditCard, trend: "+8% from last month", color: "text-green-600", bg: "bg-green-100" },
          { title: "Total Users", value: "1,204", icon: Users, trend: "+24% from last month", color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Platform Health", value: "99.9%", icon: Activity, trend: "All systems operational", color: "text-amber-600", bg: "bg-amber-100" },
        ].map((stat, index) => (
          <Card key={index} className="border-none shadow-sm shadow-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-none shadow-sm shadow-gray-200">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center border-t border-gray-100 bg-gray-50/50">
            <p className="text-gray-500 text-sm">Chart Component Placeholder</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm shadow-gray-200">
          <CardHeader>
            <CardTitle>Recent Clinics Registered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {[
              { name: "Smile Bright Dental", location: "New York, NY", date: "2 hours ago" },
              { name: "Family Oral Care", location: "Austin, TX", date: "5 hours ago" },
              { name: "Advanced Endodontics", location: "Seattle, WA", date: "1 day ago" },
              { name: "Pediatric Smiles", location: "Chicago, IL", date: "2 days ago" },
            ].map((clinic, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{clinic.name}</p>
                  <p className="text-xs text-gray-500">{clinic.location}</p>
                </div>
                <div className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">
                  {clinic.date}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
