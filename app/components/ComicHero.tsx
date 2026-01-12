"use client";

import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js"

type Props = {
  title: string;
  description?: string;
  cover: string | null;
};

export default function ComicHero({ title, description, cover }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    anime({
      targets: ref.current,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <div
      ref={ref}
      className="flex gap-6 rounded-2xl bg-[#0b0b0b] border border-red-900/60 p-6 mb-10"
    >
      <img
        src={cover || ""}
        className="w-40 h-56 rounded-xl object-cover"
      />

      <div className="flex flex-col justify-center">
        <h1 className="text-2xl font-semibold text-red-100">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-red-400 mt-2 max-w-xl">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
