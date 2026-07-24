"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Users, CalendarDays, Plus, Search, Pencil, Trash2, X, Stethoscope } from "lucide-react";

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dob: string | null;
  createdAt: string;
  _count: { appointments: number };
};

type ClinicInfo = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  _count: { users: number };
};

type PatientFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  clinicId: string;
};

const emptyForm: PatientFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  clinicId: "",
};

type DoctorInfo = {
  id: string;
  name: string | null;
  email: string | null;
  doctorProfile: {
    specialty: string | null;
    consultationFee: number | null;
  } | null;
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<PatientFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Current user + clinics (for SUPER_ADMIN)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Doctors list for selected clinic
  const [clinicDoctors, setClinicDoctors] = useState<DoctorInfo[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Load current user info and clinics (for SUPER_ADMIN)
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const meRes = await fetch("/api/me", { credentials: "same-origin" });
        if (meRes.ok) {
          const mePayload = await meRes.json();
          const role = mePayload.data?.user?.role;
          if (mounted) setCurrentUserRole(role || null);

          if (role === "SUPER_ADMIN") {
            const clinicsRes = await fetch("/api/clinics", { credentials: "same-origin" });
            if (clinicsRes.ok) {
              const clinicsPayload = await clinicsRes.json();
              if (mounted) setClinics(clinicsPayload.data || []);
            }
          }
        }
      } catch {
        // Ignore errors
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  // Load doctors for selected clinic
  useEffect(() => {
    if (!formData.clinicId) {
      setClinicDoctors([]);
      return;
    }
    let mounted = true;
    async function loadDoctors() {
      setLoadingDoctors(true);
      try {
        const params = new URLSearchParams({ clinicId: formData.clinicId, includeInactive: "true" });
        const res = await fetch(`/api/doctors?${params.toString()}`, {
          credentials: "same-origin",
        });
        if (res.ok) {
          const payload = await res.json();
          if (mounted) setClinicDoctors(payload.data as DoctorInfo[]);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoadingDoctors(false);
      }
    }
    loadDoctors();
    return () => { mounted = false; };
  }, [formData.clinicId]);

  const loadPatients = useCallback(async (searchTerm = "") => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      const res = await fetch(`/api/patients?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to load patients");
      const payload = await res.json();
      setPatients(payload.data as Patient[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        void loadPatients(search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadPatients, loading]);

  function openCreateModal() {
    setEditingPatient(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(patient: Patient) {
    setEditingPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email || "",
      phone: patient.phone || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      clinicId: "",
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPatient(null);
    setFormError(null);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const { firstName, lastName, email, phone, dob, clinicId } = formData;
      const body: Record<string, unknown> = { firstName, lastName };

      if (email.trim()) body.email = email.trim();
      if (phone.trim()) body.phone = phone.trim();
      if (dob.trim()) body.dob = dob.trim();

      // Include clinicId for SUPER_ADMIN when creating
      if (!editingPatient && clinicId) {
        body.clinicId = clinicId;
      }

      let res: Response;
      if (editingPatient) {
        res = await fetch(`/api/patients/${editingPatient.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      } else {
        res = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      }

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to save patient");
      }

      await loadPatients(search);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save patient");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to delete patient");
      }
      await loadPatients(search);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete patient");
    } finally {
      setDeleting(false);
    }
  }

  const totalAppointments = patients.reduce((sum, p) => sum + p._count.appointments, 0);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <AdminPageShell
      title="Patients"
      description="Track clinic patients and care activity."
      actions={
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Patient
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Patients</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{patients.length}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Total appointments</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{totalAppointments}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
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
        <p className="text-sm text-gray-500 text-center py-8">Loading patients...</p>
      )}

      {/* Empty state */}
      {!loading && !error && patients.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No patients found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try adjusting your search terms."
              : "Get started by adding your first patient."}
          </p>
        </div>
      )}

      {/* Patients table */}
      {!loading && !error && patients.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">DOB</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Appts</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{patient.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{patient.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(patient.dob)}</td>
                  <td className="px-4 py-3 text-gray-600">{patient._count.appointments}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(patient)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(patient.id)}
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
                {editingPatient ? "Edit Patient" : "Add Patient"}
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
              {/* Clinic selector (only for SUPER_ADMIN on create) */}
              {currentUserRole === "SUPER_ADMIN" && !editingPatient && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clinic <span className="text-red-500">*</span>
                  </label>
                  {loadingUser ? (
                    <p className="text-sm text-gray-400">Loading clinics...</p>
                  ) : (
                    <select
                      name="clinicId"
                      value={formData.clinicId}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="">Select a clinic...</option>
                      {clinics.map((clinic) => (
                        <option key={clinic.id} value={clinic.id}>
                          {clinic.name} ({clinic.subdomain})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Doctors list for selected clinic */}
              {formData.clinicId && !editingPatient && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Stethoscope className="h-4 w-4 text-gray-500" />
                    <h4 className="text-sm font-semibold text-gray-700">Clinic Doctors</h4>
                  </div>
                  {loadingDoctors ? (
                    <p className="text-sm text-gray-500">Loading doctors...</p>
                  ) : clinicDoctors.length === 0 ? (
                    <p className="text-sm text-gray-500">No doctors found for this clinic.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {clinicDoctors.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm border border-gray-100">
                          <div>
                            <span className="font-medium text-gray-900">{doc.name || "Unnamed"}</span>
                            {doc.doctorProfile?.specialty && (
                              <span className="ml-2 text-xs text-gray-500">({doc.doctorProfile.specialty})</span>
                            )}
                          </div>
                          {doc.doctorProfile?.consultationFee != null && (
                            <span className="text-xs font-medium text-gray-500">${doc.doctorProfile.consultationFee.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                  {saving ? "Saving..." : editingPatient ? "Update Patient" : "Create Patient"}
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
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Patient</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this patient? This action cannot be undone. All associated
              appointments will also be removed.
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
                {deleting ? "Deleting..." : "Delete Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}

