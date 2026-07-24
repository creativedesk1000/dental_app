"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  patient: { id: string; firstName: string; lastName: string };
  doctor: { id: string; name: string | null; email: string | null };
};

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
};

type Doctor = {
  id: string;
  name: string | null;
  email: string | null;
  doctorProfile: { specialty: string | null } | null;
};

type AppointmentFormData = {
  patientId: string;
  doctorId: string;
  date: string;
  notes: string;
  status: string;
};

const emptyForm: AppointmentFormData = {
  patientId: "",
  doctorId: "",
  date: "",
  notes: "",
  status: "SCHEDULED",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load appointments
  const loadAppointments = useCallback(async (searchTerm = "") => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/appointments?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to load appointments");
      const payload = await res.json();
      setAppointments(payload.data as Appointment[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load patients for dropdown
  const loadPatients = useCallback(async () => {
    setLoadingPatients(true);
    try {
      const res = await fetch("/api/patients", { credentials: "same-origin" });
      if (res.ok) {
        const payload = await res.json();
        setPatients(payload.data as Patient[]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  // Load doctors for dropdown
  const loadDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const params = new URLSearchParams({ includeInactive: "false" });
      const res = await fetch(`/api/doctors?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (res.ok) {
        const payload = await res.json();
        setDoctors(payload.data as Doctor[]);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        void loadAppointments(search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadAppointments, loading]);

  function openCreateModal() {
    setEditingAppointment(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowModal(true);
    loadPatients();
    loadDoctors();
  }

  function openEditModal(appointment: Appointment) {
    setEditingAppointment(appointment);
    setFormData({
      patientId: appointment.patient.id,
      doctorId: appointment.doctor.id,
      date: new Date(appointment.date).toISOString().slice(0, 16),
      notes: appointment.notes || "",
      status: appointment.status,
    });
    setFormError(null);
    setShowModal(true);
    loadPatients();
    loadDoctors();
  }

  function closeModal() {
    setShowModal(false);
    setEditingAppointment(null);
    setFormError(null);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const body: Record<string, unknown> = {
        patientId: formData.patientId,
        doctorId: formData.doctorId,
        date: formData.date,
      };

      if (formData.notes.trim()) body.notes = formData.notes.trim();

      let res: Response;
      if (editingAppointment) {
        body.status = formData.status;
        res = await fetch(`/api/appointments/${editingAppointment.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      } else {
        res = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      }

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to save appointment");
      }

      await loadAppointments(search);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save appointment");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to delete appointment");
      }
      await loadAppointments(search);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete appointment");
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to update appointment");
      }
      await loadAppointments(search);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update appointment");
    }
  }

  const today = new Date().toDateString();
  const todayAppts = appointments.filter((a) => new Date(a.date).toDateString() === today);
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const pending = appointments.filter((a) => a.status === "SCHEDULED").length;

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      COMPLETED: "bg-green-100 text-green-700",
      SCHEDULED: "bg-blue-100 text-blue-700",
      CANCELLED: "bg-red-100 text-red-700",
      NO_SHOW: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  }

  return (
    <AdminPageShell
      title="Appointments"
      description="Review and manage upcoming appointments and scheduling activity."
      actions={
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Appointment
        </button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-sky-50 p-4">
          <div className="flex items-center gap-2 text-sky-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Today</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{todayAppts.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock3 className="h-4 w-4" />
            <span className="text-sm font-semibold">Scheduled</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{pending}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Completed</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{completed}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search appointments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500 text-center py-8">Loading appointments...</p>
      )}

      {/* Empty state */}
      {!loading && !error && appointments.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No appointments found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try adjusting your search terms."
              : "Schedule your first appointment to get started."}
          </p>
        </div>
      )}

      {/* Appointments table */}
      {!loading && !error && appointments.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Doctor</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Date & Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {appointments.map((apt) => (
                <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {apt.patient.firstName} {apt.patient.lastName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
                      {apt.doctor.name || apt.doctor.email || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(apt.date)}</td>
                  <td className="px-4 py-3">{getStatusBadge(apt.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {apt.status === "SCHEDULED" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(apt.id, "COMPLETED")}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                            title="Mark as completed"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Complete
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt.id, "CANCELLED")}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                            title="Cancel appointment"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancel
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => openEditModal(apt)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(apt.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingAppointment ? "Edit Appointment" : "Add Appointment"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient <span className="text-red-500">*</span>
                </label>
                {loadingPatients ? (
                  <p className="text-sm text-gray-400">Loading patients...</p>
                ) : (
                  <select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Doctor select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor <span className="text-red-500">*</span>
                </label>
                {loadingDoctors ? (
                  <p className="text-sm text-gray-400">Loading doctors...</p>
                ) : (
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select a doctor...</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.email || "Unnamed"} {d.doctorProfile?.specialty ? `(${d.doctorProfile.specialty})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status (edit only) */}
              {editingAppointment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Appointment notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {saving ? "Saving..." : editingAppointment ? "Update Appointment" : "Create Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Appointment</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}

