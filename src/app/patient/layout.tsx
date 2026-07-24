"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/patient/appointments", icon: Calendar },
  { name: "Treatments", href: "/patient/treatments", icon: Activity },
  { name: "Prescriptions", href: "/patient/prescriptions", icon: FileText },
  { name: "Profile", href: "/patient/profile", icon: User },
  { name: "Notifications", href: "/patient/notifications", icon: Bell },
];

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 p-5 shrink-0 justify-between">
        <div>
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">PatientCare</h1>
              <p className="text-xs text-teal-400 font-medium">Dental Portal</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-md shadow-teal-950/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-teal-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 hover:border hover:border-rose-900/40 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 border-b border-slate-800 px-5 py-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-bold text-white">PatientCare</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 p-4 space-y-2 sticky top-[69px] z-40">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                    : "text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
