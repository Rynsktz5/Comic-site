"use client";

import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js"



type Props = {
  username: string;
  ongoingCount: number;
};

export default function GreetingStrip({ username, ongoingCount }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !lineRef.current) return;

    anime.timeline()
      .add({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 700,
        easing: "easeOutExpo",
      })
      .add({
        targets: lineRef.current,
        width: ["0%", "120px"],
        duration: 600,
        easing: "easeOutExpo",
      }, "-=300");
  }, []);

  return (
    <div
      ref={containerRef}
      className="mb-8 select-none"
      style={{ opacity: 0 }}
    >
      {/* GREETING */}
      <div className="text-sm text-red-200 font-medium">
        Welcome back, <span className="text-red-400">{username}</span>
      </div>

     

      {/* UNDERLINE */}
      <div
        ref={lineRef}
        className="mt-3 h-[2px] bg-red-700 rounded-full"
        style={{ width: 0 }}
      />
    </div>
  );
}
