"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  UserCheck,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  doctorProfile?: { specialty?: string };
}

interface Appointment {
  id: string;
  date: string;
  notes?: string;
  status: string;
  doctor?: Doctor;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/patient/appointments");
      const json = await res.json();
      if (json.success) {
        setAppointments(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch("/api/doctors");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDoctors(json.data);
        if (json.data.length > 0) {
          setSelectedDoctorId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !appointmentDate) {
      setError("Please select a doctor and date.");
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const fullIsoDate = new Date(`${appointmentDate}T${appointmentTime}:00`).toISOString();
      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date: fullIsoDate,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setNotes("");
        fetchAppointments();
      } else {
        setError(json.message || "Failed to book appointment.");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`/api/patient/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      const json = await res.json();
      if (json.success) {
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
      case "CONFIRMED":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> {status}
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-400" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-teal-400" />
            Appointments Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Book, view, and manage your dental clinic appointments.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Appointments Found</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You don't have any appointments scheduled right now. Tap "Book Appointment" to schedule a visit with our dental team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((apt) => {
            const aptDate = new Date(apt.date);
            const isFuture = aptDate >= new Date() && apt.status !== "CANCELLED";

            return (
              <div
                key={apt.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        Dr. {apt.doctor?.name || "Dental Specialist"}
                      </h3>
                      <p className="text-xs text-teal-400 font-medium">
                        {apt.doctor?.doctorProfile?.specialty || "General Dentistry"}
                      </p>
                    </div>
                    {statusBadge(apt.status)}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800/80 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-teal-400" />
                      <span>
                        {aptDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>
                        {aptDate.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                        Notes: {apt.notes}
                      </p>
                    )}
                  </div>
                </div>

                {isFuture && (
                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCancel(apt.id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Book Appointment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-teal-400" />
                Book Dental Visit
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-900/80 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                  required
                >
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} {doc.doctorProfile?.specialty ? `(${doc.doctorProfile.specialty})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Notes / Reason for Visit (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular teeth cleaning, Toothache..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 h-24"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 hover:opacity-95 disabled:opacity-50"
                >
                  {booking ? "Scheduling..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
