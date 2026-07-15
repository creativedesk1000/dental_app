"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Building2, CreditCard, Users, 
  Settings, Smartphone, Database, Activity, LogOut
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Clinics", href: "/admin/clinics", icon: Building2 },
  { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: Activity },
  { name: "APK Management", href: "/admin/apk", icon: Smartphone },
  { name: "Database", href: "/admin/database", icon: Database },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-gray-900 border-r border-gray-800 text-white min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Dental<span className="text-primary">SaaS</span></span>
        </Link>
      </div>

      <div className="px-3 py-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
          Super Admin
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl cursor-pointer transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </div>
      </div>
    </div>
  );
}
