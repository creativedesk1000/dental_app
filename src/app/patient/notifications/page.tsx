"use client";

import React, { useEffect, useState } from "react";
import { Bell, Calendar, Pill, Activity, Info, Check, CheckCheck } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/patient/notifications");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch("/api/patient/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "APPOINTMENT":
        return <Calendar className="w-5 h-5 text-teal-400" />;
      case "PRESCRIPTION":
        return <Pill className="w-5 h-5 text-indigo-400" />;
      case "TREATMENT":
        return <Activity className="w-5 h-5 text-cyan-400" />;
      default:
        return <Info className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-amber-400" />
          Notifications & Alerts
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Stay updated on appointment reminders, treatment schedules, and prescription alerts.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Notifications</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            You don't have any notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                n.isRead
                  ? "bg-slate-900/40 border-slate-800/80 opacity-80"
                  : "bg-slate-900/90 border-teal-500/30 shadow-lg shadow-teal-950/40"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{n.message}</p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  title="Mark as read"
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-teal-300 hover:bg-slate-700 transition-all shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
