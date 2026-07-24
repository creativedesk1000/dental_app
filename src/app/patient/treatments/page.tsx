"use client";

import React, { useEffect, useState } from "react";
import { Activity, Calendar, UserCheck, FileText, CheckCircle, Clock } from "lucide-react";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
}

interface Treatment {
  id: string;
  title: string;
  description?: string;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  notes?: string;
  doctor?: { name: string };
  prescriptions?: Prescription[];
}

export default function PatientTreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/treatments")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setTreatments(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            IN PROGRESS
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            COMPLETED
          </span>
        );
      case "PLANNED":
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            PLANNED
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Activity className="w-7 h-7 text-cyan-400" />
          Treatment Plans & History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review your current active dental treatments, clinical procedure notes, and history.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : treatments.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Activity className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Treatment Plans Recorded</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Your treating dentist will update your active care plans and procedures here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{treatment.title}</h2>
                  {treatment.doctor?.name && (
                    <p className="text-xs text-cyan-400 flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" /> Doctor: {treatment.doctor.name}
                    </p>
                  )}
                </div>
                <div>{getStatusBadge(treatment.status)}</div>
              </div>

              {treatment.description && (
                <p className="text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {treatment.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Started: {new Date(treatment.startDate).toLocaleDateString()}</span>
                </div>
                {treatment.endDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Completed: {new Date(treatment.endDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {treatment.notes && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400">Clinical Notes:</p>
                  <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                    {treatment.notes}
                  </p>
                </div>
              )}

              {treatment.prescriptions && treatment.prescriptions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <p className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Prescribed Medications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {treatment.prescriptions.map((rx) => (
                      <span
                        key={rx.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-xs text-indigo-200"
                      >
                        {rx.medication} ({rx.dosage} - {rx.frequency})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
