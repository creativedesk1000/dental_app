"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { APP_ROLES } from "@/lib/auth.config";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Users,
  Settings,
  Smartphone,
  Database,
  Activity,
  LogOut,
  ShieldCheck,
  CalendarDays,
  HeartPulse,
} from "lucide-react";

const allNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Clinics", href: "/admin/clinics", icon: Building2 },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: Activity },
  { name: "APK Management", href: "/admin/apk", icon: Smartphone },
  { name: "Database", href: "/admin/database", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const clinicAdminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Patients", href: "/admin/patients", icon: Users },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Doctors", href: "/admin/doctors", icon: HeartPulse },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

const receptionistNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Patients", href: "/admin/patients", icon: Users },
];

const doctorNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Patients", href: "/admin/patients", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const role = session?.user?.role;

  const navItems =
    role === APP_ROLES.SUPER_ADMIN
      ? allNavItems
      : role === APP_ROLES.CLINIC_ADMIN
        ? clinicAdminNavItems
        : role === APP_ROLES.RECEPTIONIST
          ? receptionistNavItems
          : role === APP_ROLES.DOCTOR
            ? doctorNavItems
            : [];

  const roleLabel =
    role === APP_ROLES.SUPER_ADMIN
      ? "Super Admin"
      : role === APP_ROLES.CLINIC_ADMIN
        ? "Clinic Admin"
        : role === APP_ROLES.RECEPTIONIST
          ? "Receptionist"
          : role === APP_ROLES.DOCTOR
            ? "Doctor"
            : "Account";

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 text-white min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Dental<span className="text-primary">SaaS</span>
          </span>
        </Link>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          {roleLabel}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl cursor-pointer transition-colors disabled:opacity-70"
        >
          <LogOut className="w-5 h-5" />
          {signingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
