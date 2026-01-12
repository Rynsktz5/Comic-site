"use client";

import anime from "animejs/lib/anime.es.js"
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/devices";

type Props = {
  comicId: string;
};

export default function ComicActions({ comicId }: Props) {
  const router = useRouter();
  const deviceId = getDeviceId();

  const progress = JSON.parse(
    localStorage.getItem(`device:${deviceId}:comic_progress`) || "{}"
  );

  const resumeChapter = progress[comicId]?.lastChapter;

  return (
    <div className="sticky top-20 z-20 flex gap-3 mb-8">
      {resumeChapter && (
        <button
          className="px-4 py-2 rounded-lg bg-red-700 text-black font-semibold"
          onClick={() =>
            router.push(`/reader/${resumeChapter}`)
          }
        >
          Resume
        </button>
      )}

      <button
        className="px-4 py-2 rounded-lg border border-red-800 text-red-300"
        onClick={(e) => {
          anime({
            targets: e.currentTarget,
            scale: [1, 0.92, 1],
            duration: 180,
            easing: "easeOutQuad",
          });
          // favourite logic later
        }}
      >
        Favourite
      </button>
    </div>
  );
}
