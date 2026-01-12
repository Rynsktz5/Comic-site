"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js" // ✅ REQUIRED

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

  const menuRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const [continueEnabled, setContinueEnabled] = useState(true);
  const toggleContinue = () => {
  const next = !continueEnabled;
  setContinueEnabled(next);
  localStorage.setItem("continue_enabled", String(next));
};

useEffect(() => {
  const stored = localStorage.getItem("continue_enabled");
  setContinueEnabled(stored !== "false");
}, []);

  /* ================= CURSOR FOLLOW GLOW ================= */
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

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, [open]);

  /* ================= MENU OPEN / CLOSE ================= */
  useEffect(() => {
    if (!menuRef.current) return;

    if (open) {
      animateMenuIn(menuRef.current);
    }
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
  const item = (label: string, action: () => void) => (
    <button
      className="menu-item text-left text-lg text-white"
      onMouseEnter={e => animateHover(e.currentTarget)}
      onMouseLeave={e => resetHover(e.currentTarget)}
      onClick={e => animateClick(e.currentTarget, action)}
    >
      {label}
    </button>
  );

  /* ================= RENDER ================= */
  return (
    <div
      ref={menuRef}
      className="
        fixed inset-0 z-50
        bg-black/80 backdrop-blur-xl
        flex flex-col
        px-10 py-8
      "
    >
      {/* CURSOR GLOW */}
      <div ref={glowRef} className="menu-glow" />

      {/* CLOSE */}
      <button
        onClick={close}
        className="self-end mb-10 text-sm text-neutral-400 hover:text-white transition"
      >
        ✕ Close
      </button>

      {/* MENU */}
      <nav className="flex flex-col gap-6">
        
        {item("Home", () => router.push("/"))}
        {item("Favourites", () => router.push("/favourites"))}
        {item("Continue Reading", () => {
          const data = localStorage.getItem("continue_reading");
          if (!data) return;
          const { chapterId } = JSON.parse(data);
          router.push(`/reader/${chapterId}`);
        })}
        <button
  onClick={toggleContinue}
  className="menu-item flex items-center justify-between"
>
  <span>Continue Your Journey</span>
  <span className="text-xs text-red-400">
    {continueEnabled ? "ON" : "OFF"}
  </span>
</button>

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
