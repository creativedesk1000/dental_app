"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, CreditCard, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminStats = {
  totalPatients: number;
  todayAppointments: number;
  doctors: number;
  revenue: number;
  activeUsers: number;
  totalClinics: number;
  activeClinics: number;
  suspendedClinics: number;
  totalUsers: number;
  activeSubscriptions: number;
};

const statCardClass = "border-none shadow-sm shadow-gray-200";

export function AdminDashboardCards() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats", {
          credentials: "same-origin",
        });
        if (!response.ok) {
          throw new Error("Unable to load dashboard stats");
        }
        const payload = await response.json();
        if (mounted) {
          setStats(payload.data as AdminStats);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard stats");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Total Patients",
        value: stats.totalPatients.toLocaleString(),
        trend: "Across all clinics",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      {
        title: "Today's Appointments",
        value: stats.todayAppointments.toLocaleString(),
        trend: "Scheduled for today",
        icon: CalendarDays,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      {
        title: "Doctors",
        value: stats.doctors.toLocaleString(),
        trend: "Active care providers",
        icon: Activity,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      {
        title: "Revenue",
        value: `$${stats.revenue.toLocaleString()}`,
        trend: "From active subscriptions",
        icon: Wallet,
        color: "text-amber-600",
        bg: "bg-amber-100",
      },
      {
        title: "Active Users",
        value: stats.activeUsers.toLocaleString(),
        trend: "Currently online",
        icon: CreditCard,
        color: "text-rose-600",
        bg: "bg-rose-100",
      },
    ];
  }, [stats]);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading dashboard stats...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className={statCardClass}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
              <div className={`rounded-xl p-2 ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              <p className="mt-1 text-xs text-gray-500 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
