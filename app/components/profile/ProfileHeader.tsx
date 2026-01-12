"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";
import anime from "animejs/lib/anime.es.js";

type Props = {
  title: string;
  subtitle?: string;
};

export default function ProfileHeader({ title, subtitle }: Props) {
  const router = useRouter();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;

    anime({
      targets: headerRef.current,
      opacity: [0, 1],
      translateY: [-12, 0],
      duration: 600,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <div ref={headerRef} className="mb-10">
      {/* BACK BUTTON */}
      <button
        onClick={() => router.push("/")}
        className="
          mb-4
          inline-flex items-center gap-2
          text-sm text-red-400
          hover:text-red-300
          transition
        "
      >
        ← Back
      </button>

      {/* TITLE */}
      <h1 className="text-xl font-semibold text-red-100">
        {title}
      </h1>

      {subtitle && (
        <p className="text-sm text-red-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
