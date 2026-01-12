"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import { getDeviceId } from "@/lib/devices";
import ProfileHeader from "@/app/components/profile/ProfileHeader";

type Stats = {
  started: number;
  ongoing: number;
  completed: number;
};

export default function ProfilePage() {
  const ringRef = useRef<SVGCircleElement>(null);

  const [username, setUsername] = useState("Reader");
  const [joined, setJoined] = useState("");
  const [stats, setStats] = useState<Stats>({
    started: 0,
    ongoing: 0,
    completed: 0,
  });

  /* ================= LOAD PROFILE + STATS ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // USERNAME
    const name = localStorage.getItem("username") || "Reader";
    setUsername(name);

    // JOIN DATE
    let joinDate = localStorage.getItem("joined_at");
    if (!joinDate) {
      joinDate = new Date().toISOString();
      localStorage.setItem("joined_at", joinDate);
    }
    setJoined(new Date(joinDate).toDateString());

    // DEVICE
    const deviceId = getDeviceId();
    if (!deviceId) return;

    let started = 0;
    let ongoing = 0;
    let completed = 0;

    /* ===== 1️⃣ comic_progress ===== */
    const rawProgress = localStorage.getItem(
      `device:${deviceId}:comic_progress`
    );
    const progress = rawProgress ? JSON.parse(rawProgress) : {};

    Object.values(progress).forEach((entry: any) => {
      if (!entry) return;

      started++;

      if (
        typeof entry.pageIndex === "number" &&
        typeof entry.totalPages === "number"
      ) {
        if (entry.pageIndex >= entry.totalPages - 1) {
          completed++;
        } else if (entry.pageIndex > 0) {
          ongoing++;
        }
      }
    });

    /* ===== 2️⃣ continue_reading fallback ===== */
    const continueRaw = localStorage.getItem("continue_reading");
    if (continueRaw && started === 0) {
      started = 1;
      ongoing = 1;
    }

    setStats({ started, ongoing, completed });
  }, []);

  /* ================= PROGRESS RING ================= */
  useEffect(() => {
    if (!ringRef.current) return;

    const total = stats.started || 1;
    const percent = Math.round((stats.completed / total) * 100);

    anime({
      targets: ringRef.current,
      strokeDashoffset: [314, 314 - (314 * percent) / 100],
      duration: 1200,
      easing: "easeOutExpo",
    });
  }, [stats]);

  return (
    <main className="min-h-screen px-6 pt-24 text-red-100">
      {/* HEADER */}
      <ProfileHeader
  title="Your Profile"
  subtitle="Identity, progress, and personalization."
/>

      {/* PROFILE CARD */}
      <div className="max-w-xl rounded-2xl bg-[#0b0b0b] border border-red-900/60 p-6">
        {/* TOP */}
        <div className="flex items-center gap-4 mb-6">
          {/* AVATAR */}
          <div className="relative w-16 h-16">
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
              <circle
                cx="32"
                cy="32"
                r="30"
                stroke="rgba(127,29,29,0.4)"
                strokeWidth="2"
                fill="none"
              />
              <circle
                ref={ringRef}
                cx="32"
                cy="32"
                r="30"
                stroke="#dc2626"
                strokeWidth="2"
                fill="none"
                strokeDasharray="314"
                strokeDashoffset="314"
              />
            </svg>

            <div className="w-full h-full rounded-full bg-red-900/40 flex items-center justify-center font-semibold">
              {username[0]?.toUpperCase()}
            </div>
          </div>

          {/* INFO */}
          <div>
            <div className="text-lg font-semibold">{username}</div>
            <div className="text-xs text-red-400">Joined {joined}</div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            ["Started", stats.started],
            ["Ongoing", stats.ongoing],
            ["Completed", stats.completed],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-[#090909] border border-red-900/40 p-3"
            >
              <div className="text-lg font-semibold text-red-200">
                {value}
              </div>
              <div className="text-xs text-red-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
