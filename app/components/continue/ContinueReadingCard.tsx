"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs/lib/anime.es.js"
import { fadeUpText } from "@/app/components/animations/textAnimations";

type ContinueData = {
  chapterId: string;
  pageIndex: number;
  totalPages: number;
  updatedAt: number;
};

export default function ContinueReadingCard() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const enabled =
  typeof window !== "undefined" &&
  localStorage.getItem("continue_enabled") !== "false";

  const [data, setData] = useState<ContinueData | null>(null);

  /* SAFE PROGRESS */
  const progress = data
    ? Math.min(
        Math.floor(((data.pageIndex + 1) / data.totalPages) * 100),
        100
      )
    : 0;
 
  /* LOAD CONTINUE DATA */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("continue_reading");
      if (!raw) return;
      setData(JSON.parse(raw));
    } catch {}
  }, []);

  /* ENTRANCE */
  useEffect(() => {
    if (!cardRef.current || !data) return;

    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      easing: "easeOutExpo",
    });
  }, [data]); 

  /* PROGRESS BAR */
  useEffect(() => {
    if (!barRef.current || !data) return;

    anime({
      targets: barRef.current,
      width: `${progress}%`,
      duration: 900,
      easing: "easeOutExpo",
    });
  }, [progress, data]);

  useEffect(() => {
  if (!labelRef.current || !subtitleRef.current) return;
  fadeUpText(labelRef.current, 0);
  fadeUpText(subtitleRef.current, 120);
}, [data]);


  if (!data || !enabled) return null;


  return (
    <div
      ref={cardRef}
      className="
        mb-10
        rounded-2xl
        bg-[#0b0b0b]
        border border-red-900/60
        p-5
        cursor-pointer
      "
      onMouseEnter={e =>
        anime({
          targets: e.currentTarget,
          translateY: -6,
          borderColor: "#dc2626",
          duration: 250,
          easing: "easeOutQuad",
        })
      }
      onMouseLeave={e =>
        anime({
          targets: e.currentTarget,
          translateY: 0,
          borderColor: "rgba(127,29,29,0.6)",
          duration: 250,
          easing: "easeOutQuad",
        })
      }
      onClick={e =>
        anime({
          targets: e.currentTarget,
          scale: [1, 0.96, 1],
          duration: 180,
          easing: "easeOutQuad",
          complete: () => {
            router.push(`/reader/${data.chapterId}`);
          },
        })
      }
    >
     <div ref={labelRef} className="text-[11px] tracking-widest uppercase text-red-600 mb-1">
  Continue Your Journey
</div>

<div ref={subtitleRef} className="text-sm text-red-300/80 mb-4">
  You stopped here last time
</div>



      <div className="h-1.5 w-full rounded-full bg-red-950/60 overflow-hidden">
        <div ref={barRef} className="h-full bg-red-600 w-0" />
      </div>
    </div>
  );
}
