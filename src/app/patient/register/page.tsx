"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, User, Building, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
}

export default function PatientRegisterPage() {
  const router = useRouter();
  
  // Step State (1: Register, 2: Verify OTP)
  const [step, setStep] = useState<1 | 2>(1);
  
  // Registration Form State
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clinicId, setClinicId] = useState("");
  
  // OTP Form State
  const [otp, setOtp] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/clinics/public")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setClinics(json.data);
          if (json.data.length > 0) {
            setClinicId(json.data[0].id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          clinicId,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess("Account created successfully. Please check your email for the verification code.");
        setStep(2);
      } else {
        setError(json.message || "Failed to register.");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otp }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(json.message || "Invalid verification code.");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl z-10">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Patient Portal</h1>
          <p className="text-slate-400 text-sm">
            {step === 1 ? "Create your medical account" : "Verify your email address"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium bg-rose-950/60 border border-rose-900 text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium bg-teal-950/60 border border-teal-900 text-teal-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-500" /> Select Clinic
              </label>
              <select
                value={clinicId}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                required
              >
                <option value="" disabled>Select your clinic</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || clinics.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="w-4 h-4" />
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-400 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                Enter the 6-digit verification code sent to <br/><span className="text-white font-bold">{email}</span>
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full text-center tracking-[0.5em] text-2xl font-bold bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-teal-500 transition-colors"
                required
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {loading ? "Verifying..." : "Verify & Complete"} <CheckCircle2 className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 mt-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
            >
              Back to Registration
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
