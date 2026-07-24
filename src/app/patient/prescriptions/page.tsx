"use client";

import React, { useEffect, useState } from "react";
import { FileText, Pill, Clock, Stethoscope, AlertCircle, Info } from "lucide-react";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: string;
  doctor?: { name: string };
  treatment?: { id: string; title: string };
}

export default function PatientPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/prescriptions")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setPrescriptions(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Pill className="w-7 h-7 text-indigo-400" />
          My Prescriptions
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Access your active dental medications, dosages, intake schedules, and usage instructions.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Pill className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Active Prescriptions</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You currently have no prescribed medications on record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{rx.medication}</h3>
                    <p className="text-xs text-indigo-400 font-semibold">{rx.dosage}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium text-slate-400">Frequency:</span>
                  <span className="font-semibold text-white">{rx.frequency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-medium text-slate-400">Duration:</span>
                  <span className="font-semibold text-white">{rx.duration}</span>
                </div>
                {rx.treatment?.title && (
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                    <span className="font-medium text-slate-400">For Treatment:</span>
                    <span className="font-semibold text-cyan-400">{rx.treatment.title}</span>
                  </div>
                )}
              </div>

              {rx.instructions && (
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-3 rounded-xl flex items-start gap-2 text-xs text-indigo-200">
                  <Info className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-300">Doctor Instructions:</p>
                    <p className="mt-0.5">{rx.instructions}</p>
                  </div>
                </div>
              )}

              {rx.doctor?.name && (
                <p className="text-xs text-slate-500 flex items-center gap-1 pt-2 border-t border-slate-800/80">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Prescribed by Dr. {rx.doctor.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
