"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserInfo = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    clinicId: string | null;
    clinic: {
      id: string;
      name: string;
      subdomain: string;
      logo: string | null;
      status: string;
    } | null;
  };
};

export function DashboardHeader() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/me", { credentials: "same-origin" });
        if (!res.ok) return;
        const payload = await res.json();
        if (mounted) setUserInfo(payload.data as UserInfo);
      } catch {
        // silently fail
      }
    }

    void loadUser();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  const clinicName = userInfo?.user?.clinic?.name;
  const userName = userInfo?.user?.name;

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {clinicName || "Clinic Dashboard"}
          </h2>
          {userName && (
            <p className="text-xs text-gray-500">{userName}</p>
          )}
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={loggingOut}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        {loggingOut ? "Signing out..." : "Sign out"}
      </Button>
    </header>
  );
}

