"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import { getDeviceId } from "@/lib/devices";
import ProfileHeader from "@/app/components/profile/ProfileHeader";

/* ================= BADGES ================= */

const BADGES = [
  {
    id: "initiate",
    title: "Initiate",
    desc: "Read your first chapter",
    unlock: (s: Stats) => s.chaptersRead >= 1,
  },
  {
    id: "reader",
    title: "Reader",
    desc: "Read 10 chapters",
    unlock: (s: Stats) => s.chaptersRead >= 10,
  },
  {
    id: "binge",
    title: "Binge",
    desc: "Read 50 chapters",
    unlock: (s: Stats) => s.chaptersRead >= 50,
  },
  {
    id: "veteran",
    title: "Veteran",
    desc: "Complete 3 comics",
    unlock: (s: Stats) => s.comicsCompleted >= 3,
  },
  {
    id: "archivist",
    title: "Archivist",
    desc: "Complete 10 comics",
    unlock: (s: Stats) => s.comicsCompleted >= 10,
  },
];

/* ================= TYPES ================= */

type Stats = {
  started: number;
  ongoing: number;
  completed: number;
  chaptersRead: number;
  comicsCompleted: number;
};

/* ================= PAGE ================= */

export default function ProfileStatsPage() {
  const ringRef = useRef<SVGCircleElement>(null);

  const [username, setUsername] = useState("Reader");
  const [joined, setJoined] = useState("");
  const [stats, setStats] = useState<Stats>({
    started: 0,
    ongoing: 0,
    completed: 0,
    chaptersRead: 0,
    comicsCompleted: 0,
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    // USERNAME
    const name = localStorage.getItem("username");
    if (name) setUsername(name);

    // JOIN DATE
    let join = localStorage.getItem("joined_at");
    if (!join) {
      join = new Date().toISOString();
      localStorage.setItem("joined_at", join);
    }
    setJoined(new Date(join).toDateString());

    const deviceId = getDeviceId();

    /* ===== CHAPTER PROGRESS ===== */
    const chapterRaw = localStorage.getItem(
      `device:${deviceId}:chapter_progress`
    );
    const chapterProgress = chapterRaw ? JSON.parse(chapterRaw) : {};

    let chaptersRead = 0;
    Object.values(chapterProgress).forEach((v: any) => {
      if (typeof v === "number" && v > 0) chaptersRead++;
    });

    /* ===== COMIC PROGRESS ===== */
    const comicRaw = localStorage.getItem(
      `device:${deviceId}:comic_progress`
    );
    const comicProgress = comicRaw ? JSON.parse(comicRaw) : {};

    let started = 0;
    let ongoing = 0;
    let completed = 0;
    let comicsCompleted = 0;

    Object.values(comicProgress).forEach((entry: any) => {
      if (!entry) return;

      started++;

      if (
        typeof entry.lastChapter === "number" &&
        typeof entry.totalChapters === "number"
      ) {
        if (entry.lastChapter >= entry.totalChapters) {
          completed++;
          comicsCompleted++;
        } else {
          ongoing++;
        }
      }
    });

    setStats({
      started,
      ongoing,
      completed,
      chaptersRead,
      comicsCompleted,
    });
  }, []);

  /* ================= PROGRESS RING ================= */

  useEffect(() => {
    if (!ringRef.current) return;

    const percent =
      stats.started === 0
        ? 0
        : Math.round((stats.completed / stats.started) * 100);

    anime({
      targets: ringRef.current,
      strokeDashoffset: [314, 314 - (314 * percent) / 100],
      duration: 1200,
      easing: "easeOutExpo",
    });
  }, [stats]);

  /* ================= BADGE ANIMATION ================= */

  useEffect(() => {
    anime({
      targets: ".badge-unlocked",
      scale: [0.85, 1],
      opacity: [0, 1],
      delay: anime.stagger(120),
      duration: 600,
      easing: "easeOutExpo",
    });
  }, [stats]);

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen px-6 pt-24 text-red-100">
      {/* HEADER */}
     <ProfileHeader
  title="Stats & Badges"
  subtitle="Your journey, measured."
/>


      {/* PROFILE CARD */}
      <div className="max-w-xl rounded-2xl bg-[#0b0b0b] border border-red-900/60 p-6 mb-10">
        <div className="flex items-center gap-4">
          {/* RING */}
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

          <div>
            <div className="text-lg font-semibold">{username}</div>
            <div className="text-xs text-red-400">
              Joined {joined}
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-3 gap-4 max-w-xl mb-10">
        {[
          ["Started", stats.started],
          ["Ongoing", stats.ongoing],
          ["Completed", stats.completed],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-[#090909] border border-red-900/40 p-4 text-center"
          >
            <div className="text-lg font-semibold text-red-200">
              {value}
            </div>
            <div className="text-xs text-red-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* BADGES */}
      <div className="max-w-xl rounded-2xl bg-[#0b0b0b] border border-red-900/60 p-6">
        <h3 className="text-sm text-red-400 mb-4">Badges</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {BADGES.map(badge => {
            const unlocked = badge.unlock(stats);

            return (
              <div
                key={badge.id}
                className={`
                  rounded-xl p-4 border
                  ${
                    unlocked
                      ? "badge-unlocked border-red-700 bg-red-950/40"
                      : "border-red-900/30 bg-[#070707] opacity-40 blur-[0.5px]"
                  }
                `}
              >
                <div className="text-sm font-semibold text-red-200 mb-1">
                  {badge.title}
                </div>
                <div className="text-xs text-red-400">
                  {badge.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
