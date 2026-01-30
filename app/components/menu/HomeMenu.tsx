"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js";

import {
  animateMenuIn,
  animateMenuOut,
  animateHover,
  resetHover,
  animateClick,
} from "@/app/components/animations/menuAnimations";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function HomeMenu({ open, onClose }: Props) {
  const router = useRouter();
  const ADMIN_PASSWORD = "madhuAlways";

  const menuRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  /* ================= CONTINUE TOGGLE ================= */
  const [continueEnabled, setContinueEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("continue_enabled");
    setContinueEnabled(stored !== "false");
  }, []);

  const toggleContinue = () => {
    const next = !continueEnabled;
    setContinueEnabled(next);
    localStorage.setItem("continue_enabled", String(next));
  };

  /* ================= CONTINUE LOGIC (FIXED) ================= */
  const continueJourney = () => {
    if (!continueEnabled) {
      anime({
        targets: glowRef.current,
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.6, 0.2],
        duration: 300,
        easing: "easeOutQuad",
      });
      return;
    }

    // 🔥 REAL SOURCE OF TRUTH
    const keys = Object.keys(localStorage).filter(k =>
      k.includes(":chapter_progress")
    );

    if (!keys.length) return;

    const progress = JSON.parse(
      localStorage.getItem(keys[0]) || "{}"
    );

    const chapters = Object.keys(progress);
    if (!chapters.length) return;

    // last read chapter
    const lastChapterId = chapters[chapters.length - 1];
    router.push(`/reader/${lastChapterId}`);
  };

  /* ================= CURSOR GLOW ================= */
  useEffect(() => {
    if (!open || !glowRef.current) return;

    const move = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      anime({
        targets: glowRef.current,
        left: mouse.current.x,
        top: mouse.current.y,
        opacity: 1,
        duration: 400,
        easing: "easeOutExpo",
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [open]);

  /* ================= OPEN / CLOSE ================= */
  useEffect(() => {
    if (!menuRef.current) return;
    if (open) animateMenuIn(menuRef.current);
  }, [open]);

  if (!open) return null;

  const close = () => {
    if (!menuRef.current || !glowRef.current) return;

    anime({
      targets: glowRef.current,
      opacity: 0,
      duration: 200,
      easing: "easeOutQuad",
    });

    animateMenuOut(menuRef.current, onClose);
  };

  /* ================= MENU ITEM ================= */
  /* ================= MENU ITEM ================= */
const item = (
  label: string,
  action: () => void,
  danger = false
) => (
  <button
    className={`menu-item text-left text-lg transition-colors ${
      danger ? "text-red-400" : "text-white"
    }`}
    onMouseEnter={e => animateHover(e.currentTarget)}
    onMouseLeave={e => resetHover(e.currentTarget)}
    onClick={e => animateClick(e.currentTarget, action)}
  >
    {label}
  </button>
);

/* ================= ADMIN ACCESS ================= */
const goToAdmin = () => {
  const input = prompt("Enter admin password");
  if (!input) return;

  if (input === ADMIN_PASSWORD) {
    document.cookie = "admin_auth=true; path=/";
    router.push("/admin");
  } else {
    alert("Wrong password");
  }
};




  /* ================= RENDER ================= */
  return (
    <div
      ref={menuRef}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col px-10 py-8"
    >
      <div ref={glowRef} className="menu-glow" />

      <button
        onClick={close}
        className="self-end mb-10 text-sm text-neutral-400 hover:text-white"
      >
        ✕ Close
      </button>

      <nav className="flex flex-col gap-6">
        {item("Home", () => router.push("/"))}
        {item("Favourites", () => router.push("/favourites"))}
        {item("Admin", goToAdmin, true)}


        {/* CONTINUE YOUR JOURNEY */}
        <div className="menu-item flex items-center justify-between">
          <button
            onClick={continueJourney}
            className={`text-left text-lg transition ${
              continueEnabled
                ? "text-white"
                : "text-neutral-500 cursor-not-allowed"
            }`}
          >
            Continue Your Journey
          </button>
           
          <button
            onClick={toggleContinue}
            className="text-xs text-red-400 hover:text-red-300"
          >
            {continueEnabled ? "ON" : "OFF"}
          </button>
        </div>
        

        {item("Instagram", () =>
          window.open("https://instagram.com", "_blank")
        )}
        {item("Discord", () =>
          window.open("https://discord.gg", "_blank")
        )}
        
      </nav>
    </div>
  );
}
