"use client";

import React, { useEffect, useState } from "react";
import { User, Phone, Mail, ShieldAlert, HeartPulse, Save, CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContact?: string;
  clinicName?: string;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [allergies, setAllergies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/patient/profile");
      const json = await res.json();
      if (json.success && json.data) {
        const p = json.data;
        setProfile(p);
        setFirstName(p.firstName || "");
        setLastName(p.lastName || "");
        setPhone(p.phone || "");
        setMedicalHistory(p.medicalHistory || "");
        setAllergies(p.allergies || "");
        setEmergencyContact(p.emergencyContact || "");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/patient/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          medicalHistory,
          allergies,
          emergencyContact,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        fetchProfile();
      } else {
        setMessage({ type: "error", text: json.message || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <User className="w-7 h-7 text-teal-400" />
          Patient Medical Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Keep your personal information, medical history, allergies, and emergency contacts up to date.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-teal-950/60 border border-teal-900 text-teal-300"
              : "bg-rose-950/60 border border-rose-900 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-5 h-5 text-teal-400" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Medical Records & History */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <HeartPulse className="w-5 h-5 text-rose-400" /> Clinical History & Allergies
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Medical History</label>
            <textarea
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Hypertension, Diabetes, Asthma, Previous surgeries..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 h-28"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Known Allergies</label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Latex, Local Anesthetics..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500 h-24"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" /> Emergency Contact
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Contact Details</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="e.g. Jane Doe (Spouse) - +1 555-0188"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Medical Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
