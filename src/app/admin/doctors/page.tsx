"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  HeartPulse,
  Stethoscope,
  CalendarDays,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  CalendarCheck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DoctorProfile = {
  id: string;
  specialty: string | null;
  qualification: string | null;
  experienceYears: number | null;
  consultationFee: number | null;
  licenseNumber: string | null;
  bio: string | null;
  isActive: boolean;
};

type Doctor = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  clinicId: string | null;
  doctorProfile: DoctorProfile | null;
  _count: { appointments: number };
};

type ClinicInfo = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  _count: { users: number };
};

type DoctorFormData = {
  name: string;
  email: string;
  password: string;
  specialty: string;
  qualification: string;
  experienceYears: string;
  consultationFee: string;
  licenseNumber: string;
  bio: string;
  isActive: boolean;
  clinicId: string;
};

const emptyForm: DoctorFormData = {
  name: "",
  email: "",
  password: "",
  specialty: "",
  qualification: "",
  experienceYears: "",
  consultationFee: "",
  licenseNumber: "",
  bio: "",
  isActive: true,
  clinicId: "",
};

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

type DaySchedule = {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  slotDuration: number;
};

type Leave = {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  type: string;
  status: string;
  user: { id: string; name: string | null };
  approvedBy: { id: string; name: string | null } | null;
  createdAt: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Working hours state
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<Record<string, DaySchedule[]>>({});
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Leave management state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveDoctorId, setLeaveDoctorId] = useState<string | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [newLeave, setNewLeave] = useState({ startDate: "", endDate: "", reason: "", type: "OTHER" });
  const [savingLeave, setSavingLeave] = useState(false);
  const [leaveActionLoading, setLeaveActionLoading] = useState<string | null>(null);

  // Current user (for role-based clinic selection)
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);

  // Load current user info and clinics (for SUPER_ADMIN)
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        // Fetch current user
        const meRes = await fetch("/api/me", { credentials: "same-origin" });
        if (meRes.ok) {
          const mePayload = await meRes.json();
          const role = mePayload.data?.user?.role;
          if (mounted) setCurrentUserRole(role || null);

          // If SUPER_ADMIN, fetch clinics list for the dropdown
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

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadDoctors = useCallback(async (searchTerm = "") => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      params.set("includeInactive", "true");
      const res = await fetch(`/api/doctors?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to load doctors");
      const payload = await res.json();
      setDoctors(payload.data as Doctor[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        void loadDoctors(search);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, loadDoctors, loading]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  function openCreateModal() {
    setEditingDoctor(null);
    setFormData(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(doctor: Doctor) {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      email: doctor.email || "",
      password: "",
      specialty: doctor.doctorProfile?.specialty || "",
      qualification: doctor.doctorProfile?.qualification || "",
      experienceYears: doctor.doctorProfile?.experienceYears?.toString() || "",
      consultationFee: doctor.doctorProfile?.consultationFee?.toString() || "",
      licenseNumber: doctor.doctorProfile?.licenseNumber || "",
      bio: doctor.doctorProfile?.bio || "",
      isActive: doctor.doctorProfile?.isActive ?? true,
      clinicId: "",
    });
    setFormError(null);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingDoctor(null);
    setFormError(null);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const body: Record<string, unknown> = {
        name: formData.name,
        email: formData.email,
        specialty: formData.specialty || null,
        qualification: formData.qualification || null,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears, 10) : null,
        consultationFee: formData.consultationFee ? parseFloat(formData.consultationFee) : null,
        licenseNumber: formData.licenseNumber || null,
        bio: formData.bio || null,
        isActive: formData.isActive,
      };

      if (!editingDoctor && formData.password) {
        body.password = formData.password;
      }

      // Include clinicId for SUPER_ADMIN when creating
      if (!editingDoctor && formData.clinicId) {
        body.clinicId = formData.clinicId;
      }

      let res: Response;
      if (editingDoctor) {
        res = await fetch(`/api/doctors/${editingDoctor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      } else {
        res = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });
      }

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to save doctor");
      }

      await loadDoctors(search);
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save doctor");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to delete doctor");
      }
      await loadDoctors(search);
      setDeletingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete doctor");
    } finally {
      setDeleting(false);
    }
  }

  // ── Working Hours ─────────────────────────────────────────────────────────

  async function loadSchedule(doctorId: string) {
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/doctors/working-hours?doctorId=${doctorId}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to load schedule");
      const payload = await res.json();
      const data = payload.data as DaySchedule[];

      // Ensure all 7 days are present
      const fullSchedule: DaySchedule[] = DAYS_OF_WEEK.map((day) => {
        const existing = data.find((s) => s.dayOfWeek === day);
        return existing || {
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: false,
          slotDuration: 30,
        };
      });

      setSchedules((prev) => ({ ...prev, [doctorId]: fullSchedule }));
    } catch {
      // ignore
    } finally {
      setLoadingSchedule(false);
    }
  }

  function toggleExpand(doctorId: string) {
    if (expandedDoctorId === doctorId) {
      setExpandedDoctorId(null);
    } else {
      setExpandedDoctorId(doctorId);
      if (!schedules[doctorId]) {
        loadSchedule(doctorId);
      }
    }
  }

  function updateScheduleDay(doctorId: string, index: number, field: string, value: string | boolean | number) {
    setSchedules((prev) => {
      const copy = { ...prev };
      const days = [...(copy[doctorId] || [])];
      days[index] = { ...days[index], [field]: value };
      copy[doctorId] = days;
      return copy;
    });
  }

  async function saveSchedule(doctorId: string) {
    setSavingSchedule(true);
    try {
      const days = schedules[doctorId] || [];
      const res = await fetch("/api/doctors/working-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, schedules: days }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to save schedule");
      }
      // Reload to confirm
      await loadSchedule(doctorId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setSavingSchedule(false);
    }
  }

  // ── Leave Management ──────────────────────────────────────────────────────

  async function openLeaveModal(doctorId: string) {
    setLeaveDoctorId(doctorId);
    setNewLeave({ startDate: "", endDate: "", reason: "", type: "OTHER" });
    setLoadingLeaves(true);
    setShowLeaveModal(true);

    try {
      const res = await fetch(`/api/doctors/${doctorId}/leave`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Failed to load leaves");
      const payload = await res.json();
      setLeaves(payload.data as Leave[]);
    } catch {
      setLeaves([]);
    } finally {
      setLoadingLeaves(false);
    }
  }

  function closeLeaveModal() {
    setShowLeaveModal(false);
    setLeaveDoctorId(null);
    setLeaves([]);
  }

  async function handleCreateLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveDoctorId) return;
    setSavingLeave(true);

    try {
      const res = await fetch(`/api/doctors/${leaveDoctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeave),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to create leave");
      }
      // Reload leaves
      const reload = await fetch(`/api/doctors/${leaveDoctorId}/leave`, {
        credentials: "same-origin",
      });
      if (reload.ok) {
        const payload = await reload.json();
        setLeaves(payload.data as Leave[]);
      }
      setNewLeave({ startDate: "", endDate: "", reason: "", type: "OTHER" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create leave");
    } finally {
      setSavingLeave(false);
    }
  }

  async function handleLeaveAction(leaveId: string, status: "APPROVED" | "REJECTED") {
    if (!leaveDoctorId) return;
    setLeaveActionLoading(leaveId);

    try {
      const res = await fetch(`/api/doctors/${leaveDoctorId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status }),
        credentials: "same-origin",
      });
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || "Failed to update leave");
      }
      // Reload
      const reload = await fetch(`/api/doctors/${leaveDoctorId}/leave`, {
        credentials: "same-origin",
      });
      if (reload.ok) {
        const payload = await reload.json();
        setLeaves(payload.data as Leave[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update leave");
    } finally {
      setLeaveActionLoading(null);
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(
    (d) => d.doctorProfile?.isActive !== false
  ).length;
  const totalAppointments = doctors.reduce((sum, d) => sum + d._count.appointments, 0);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatFee(fee: number | null | undefined) {
    if (fee == null) return "—";
    return `$${fee.toFixed(2)}`;
  }

  function getStatusBadge(isActive: boolean | null | undefined) {
    if (isActive === false) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        Active
      </span>
    );
  }

  function getLeaveStatusBadge(status: string) {
    if (status === "APPROVED")
      return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Approved</span>;
    if (status === "REJECTED")
      return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Rejected</span>;
    return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pending</span>;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AdminPageShell
      title="Doctors"
      description="Manage doctor profiles, schedules, and leave requests."
      actions={
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Doctor
        </button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700">
            <HeartPulse className="h-4 w-4" />
            <span className="text-sm font-semibold">Active Doctors</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{activeDoctors}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-cyan-50 p-4">
          <div className="flex items-center gap-2 text-cyan-700">
            <Stethoscope className="h-4 w-4" />
            <span className="text-sm font-semibold">Total Doctors</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{totalDoctors}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-violet-700">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-semibold">Total Appointments</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{totalAppointments}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or specialty..."
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
        <p className="text-sm text-gray-500 text-center py-8">Loading doctors...</p>
      )}

      {/* Empty state */}
      {!loading && !error && doctors.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-4 py-12 text-center">
          <Stethoscope className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">No doctors found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try adjusting your search terms."
              : "Get started by adding your first doctor."}
          </p>
        </div>
      )}

      {/* Doctors table */}
      {!loading && !error && doctors.length > 0 && (
        <div className="mt-6 space-y-4">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              {/* Main row */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-gray-900">{doctor.name || "Unnamed"}</p>
                      {getStatusBadge(doctor.doctorProfile?.isActive)}
                    </div>
                    <p className="text-sm text-gray-500">{doctor.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {doctor.doctorProfile?.specialty && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-600">
                          {doctor.doctorProfile.specialty}
                        </span>
                      )}
                      {doctor.doctorProfile?.qualification && (
                        <span>{doctor.doctorProfile.qualification}</span>
                      )}
                      {doctor.doctorProfile?.experienceYears != null && (
                        <span>{doctor.doctorProfile.experienceYears} yrs exp</span>
                      )}
                      <span>{formatFee(doctor.doctorProfile?.consultationFee)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openLeaveModal(doctor.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Manage Leave"
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      Leave
                    </button>
                    <button
                      onClick={() => toggleExpand(doctor.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                      title="Working Hours"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Hours
                      {expandedDoctorId === doctor.id ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(doctor)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingId(doctor.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable: Working Hours */}
              {expandedDoctorId === doctor.id && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Working Hours
                  </h4>
                  {loadingSchedule ? (
                    <p className="text-sm text-gray-500">Loading schedule...</p>
                  ) : (
                    <div className="space-y-2">
                      {(schedules[doctor.id] || []).map((day, idx) => (
                        <div key={day.dayOfWeek} className="flex items-center gap-3 flex-wrap">
                          <label className="flex items-center gap-2 w-28">
                            <input
                              type="checkbox"
                              checked={day.isAvailable}
                              onChange={(e) =>
                                updateScheduleDay(doctor.id, idx, "isAvailable", e.target.checked)
                              }
                              className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-xs font-medium text-gray-700">
                              {day.dayOfWeek.charAt(0) + day.dayOfWeek.slice(1).toLowerCase()}
                            </span>
                          </label>
                          {day.isAvailable && (
                            <>
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) =>
                                  updateScheduleDay(doctor.id, idx, "startTime", e.target.value)
                                }
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 w-24 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-xs text-gray-400">to</span>
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(e) =>
                                  updateScheduleDay(doctor.id, idx, "endTime", e.target.value)
                                }
                                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 w-24 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <label className="text-xs text-gray-500 flex items-center gap-1">
                                Slot:
                                <select
                                  value={day.slotDuration}
                                  onChange={(e) =>
                                    updateScheduleDay(doctor.id, idx, "slotDuration", parseInt(e.target.value, 10))
                                  }
                                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 focus:border-primary focus:outline-none"
                                >
                                  <option value={15}>15 min</option>
                                  <option value={30}>30 min</option>
                                  <option value={45}>45 min</option>
                                  <option value={60}>60 min</option>
                                </select>
                              </label>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={() => saveSchedule(doctor.id)}
                          disabled={savingSchedule}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          {savingSchedule ? "Saving..." : "Save Schedule"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editingDoctor ? "Edit Doctor" : "Add Doctor"}
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
              {/* Row: Name & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="john@clinic.com"
                  />
                </div>
              </div>

              {/* Password (create only) */}
              {!editingDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-gray-400">(default: Doctor@123)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Leave blank for default password"
                  />
                </div>
              )}

              {/* Clinic selector (only for SUPER_ADMIN on create) */}
              {currentUserRole === "SUPER_ADMIN" && !editingDoctor && (
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

              {/* Row: Specialty & Qualification */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Orthodontics"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="DDS, MS"
                  />
                </div>
              </div>

              {/* Row: Experience & Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="75.00"
                  />
                </div>
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="DENT-12345"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Brief professional bio..."
                />
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              {/* Actions */}
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
                  {saving ? "Saving..." : editingDoctor ? "Update Doctor" : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Doctor</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this doctor? This action cannot be undone. All associated
              appointments, schedules, and leaves will also be removed.
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
                {deleting ? "Deleting..." : "Delete Doctor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Leave Management Modal ────────────────────────────────────────────── */}
      {showLeaveModal && leaveDoctorId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-amber-500" />
                Leave Management
              </h2>
              <button
                onClick={closeLeaveModal}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* New leave form */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Request Leave</h3>
              <form onSubmit={handleCreateLeave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newLeave.startDate}
                      onChange={(e) => setNewLeave((p) => ({ ...p, startDate: e.target.value }))}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newLeave.endDate}
                      onChange={(e) => setNewLeave((p) => ({ ...p, endDate: e.target.value }))}
                      required
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave((p) => ({ ...p, type: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="VACATION">Vacation</option>
                    <option value="SICK">Sick</option>
                    <option value="PERSONAL">Personal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                  <input
                    type="text"
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave((p) => ({ ...p, reason: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder="Optional reason"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingLeave}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {savingLeave ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </div>
              </form>
            </div>

            {/* Leaves list */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Leave History</h3>
            {loadingLeaves ? (
              <p className="text-sm text-gray-500">Loading leaves...</p>
            ) : leaves.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No leave requests found.</p>
            ) : (
              <div className="space-y-2">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {leave.type}{leave.reason ? ` — ${leave.reason}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getLeaveStatusBadge(leave.status)}
                      {leave.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleLeaveAction(leave.id, "APPROVED")}
                            disabled={leaveActionLoading === leave.id}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave.id, "REJECTED")}
                            disabled={leaveActionLoading === leave.id}
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminPageShell>
  );
}

