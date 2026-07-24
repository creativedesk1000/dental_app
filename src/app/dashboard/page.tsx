"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardCards } from "@/components/dashboard/DashboardCards";
import DoctorsTab from "@/components/dashboard/DoctorsTab";
import PatientsTab from "@/components/dashboard/PatientsTab";
import AppointmentsTab from "@/components/dashboard/AppointmentsTab";

type Tab = "overview" | "doctors" | "patients" | "appointments";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (res.ok) {
          const payload = await res.json();
          if (mounted) setUserRole(payload.data?.user?.role || null);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingRole(false);
      }
    }
    loadUser();
    return () => { mounted = false; };
  }, []);

  const isDoctor = userRole === "DOCTOR";

  // Build tabs based on role
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    ...(isDoctor ? [] : [{ id: "doctors" as Tab, label: "Doctors" }]),
    { id: "patients", label: "Patients" },
    { id: "appointments", label: "Appointments" },
  ];

  // If doctor tries to view the doctors tab, redirect to overview
  if (isDoctor && activeTab === "doctors") {
    setActiveTab("overview");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="space-y-6 p-6 md:p-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isDoctor ? "My Dashboard" : "Clinic Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isDoctor
              ? "Manage your patients and appointments from one place."
              : "Manage your clinic&apos;s doctors, patients, and appointments from one place."}
          </p>
        </div>

        {/* Tab Navigation */}
        {!loadingRole && (
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <DashboardCards />
          </div>
        )}

        {activeTab === "doctors" && <DoctorsTab />}
        {activeTab === "patients" && <PatientsTab userRole={userRole} />}
        {activeTab === "appointments" && <AppointmentsTab userRole={userRole} />}
      </main>
    </div>
  );
}

