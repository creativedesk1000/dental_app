"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Activity,
  FileText,
  Bell,
  Clock,
  UserCheck,
  PlusCircle,
  ArrowRight,
  Stethoscope,
  Pill,
} from "lucide-react";

interface DashboardData {
  upcomingAppointment?: {
    id: string;
    date: string;
    notes?: string;
    status: string;
    doctor?: { name: string; doctorProfile?: { specialty?: string } };
  } | null;
  pastAppointmentsCount: number;
  activeTreatment?: {
    id: string;
    title: string;
    description?: string;
    status: string;
    doctor?: { name: string };
  } | null;
  recentPrescriptions: Array<{
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    doctor?: { name: string };
  }>;
  unreadNotificationsCount: number;
  clinicName?: string;
}

export default function PatientDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900/60 via-cyan-900/40 to-slate-900 border border-teal-500/20 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 rounded-full">
            {data?.clinicName || "Dental Clinic"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome to Your Care Portal
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Track your upcoming dental appointments, treatment progress, active prescriptions, and medical records easily in one place.
          </p>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Upcoming Visit</p>
            <p className="text-lg font-bold text-white">
              {data?.upcomingAppointment ? "1 Scheduled" : "None"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Active Treatment</p>
            <p className="text-lg font-bold text-white">
              {data?.activeTreatment ? data.activeTreatment.title : "No Active Plan"}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Prescriptions</p>
            <p className="text-lg font-bold text-white">
              {data?.recentPrescriptions?.length || 0} Active
            </p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Notifications</p>
            <p className="text-lg font-bold text-white">
              {data?.unreadNotificationsCount || 0} Unread
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointment Spotlight */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-400" />
                Next Scheduled Visit
              </h2>
              <Link
                href="/patient/appointments"
                className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.upcomingAppointment ? (
              <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-teal-500/20 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-lg">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {data.upcomingAppointment.doctor?.name || "Assigned Doctor"}
                      </p>
                      <p className="text-xs text-teal-400">
                        {data.upcomingAppointment.doctor?.doctorProfile?.specialty || "Dental Surgeon"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-lg text-right">
                    <p className="text-xs text-slate-400">Status</p>
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                      {data.upcomingAppointment.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-3 border-t border-slate-800 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span>
                      {new Date(data.upcomingAppointment.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    <span>
                      {new Date(data.upcomingAppointment.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl space-y-3">
                <p className="text-slate-400 text-sm">No upcoming appointments scheduled.</p>
                <Link
                  href="/patient/appointments"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold text-xs shadow-lg shadow-teal-500/20 hover:opacity-95"
                >
                  <PlusCircle className="w-4 h-4" /> Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Active Treatment Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                Active Treatment Plan
              </h2>
              <Link
                href="/patient/treatments"
                className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {data?.activeTreatment ? (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">
                    {data.activeTreatment.title}
                  </h3>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {data.activeTreatment.status}
                  </span>
                </div>
                {data.activeTreatment.description && (
                  <p className="text-xs text-slate-400">{data.activeTreatment.description}</p>
                )}
                {data.activeTreatment.doctor?.name && (
                  <p className="text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                    Supervised by Dr. {data.activeTreatment.doctor.name}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                No active treatment plan currently in progress.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col) */}
        <div className="space-y-6">
          {/* Quick Prescriptions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-400" />
                Recent Prescriptions
              </h2>
              <Link
                href="/patient/prescriptions"
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                View All
              </Link>
            </div>

            {data?.recentPrescriptions && data.recentPrescriptions.length > 0 ? (
              <div className="space-y-3">
                {data.recentPrescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                  >
                    <p className="font-semibold text-sm text-white">{rx.medication}</p>
                    <p className="text-xs text-slate-400">
                      {rx.dosage} • {rx.frequency}
                    </p>
                    <p className="text-[11px] text-slate-500">{rx.duration}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs text-center py-4">
                No prescriptions recorded yet.
              </p>
            )}
          </div>

          {/* Action Buttons Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/40 border border-teal-500/20 rounded-2xl p-6 space-y-3 backdrop-blur-xl">
            <h3 className="font-bold text-white text-sm">Quick Portal Actions</h3>
            <Link
              href="/patient/appointments"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Book New Appointment
            </Link>
            <Link
              href="/patient/profile"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs hover:bg-slate-700 transition-all"
            >
              Update Medical Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
