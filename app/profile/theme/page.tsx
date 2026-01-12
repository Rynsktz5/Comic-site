"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import ProfileHeader from "@/app/components/profile/ProfileHeader";

const THEMES = [
  { id: "crimson", name: "Crimson", color: "#dc2626" },
  { id: "blood", name: "Blood", color: "#7f1d1d" },
  { id: "inferno", name: "Inferno", color: "#ef4444" },
  { id: "void", name: "Void Red", color: "#991b1b" },
];

export default function ThemePage() {
  const [active, setActive] = useState("crimson");
 const cardsRef = useRef<(HTMLButtonElement | null)[]>([])


  /* LOAD THEME */
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "crimson";
    setActive(saved);
  }, []);

  /* ANIMATE IN */
  useEffect(() => {
    anime({
      targets: cardsRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100),
      easing: "easeOutExpo",
    });
  }, []);

  /* APPLY THEME */
  const applyTheme = (id: string) => {
    localStorage.setItem("theme", id);
    document.documentElement.setAttribute("data-theme", id);
    setActive(id);

    anime({
      targets: "body",
      opacity: [0.8, 1],
      duration: 250,
      easing: "easeOutQuad",
    });
  };

  return (
    <main className="min-h-screen px-6 pt-24 text-red-100">
      <ProfileHeader
  title="Theme"
  subtitle="Choose your visual identity."
/>


      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
        {THEMES.map((t, i) => (
          <button
            key={t.id}
            ref={el => {
              cardsRef.current[i] = el
            }}

            onClick={() => applyTheme(t.id)}
            className={`
              rounded-xl p-4 border text-left
              transition
              ${
                active === t.id
                  ? "border-accent bg-[#0b0b0b]"
                  : "border-red-900/30 bg-[#070707]"
              }
            `}
          >
            <div
              className="h-2 w-full rounded-full mb-3"
              style={{ background: t.color }}
            />

            <div className="text-sm font-semibold">{t.name}</div>

            {active === t.id && (
              <div className="text-xs text-red-400 mt-1">
                Active
              </div>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
