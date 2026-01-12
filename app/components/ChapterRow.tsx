"use client";

import anime from "animejs/lib/anime.es.js"
import { useRouter } from "next/navigation";
import { getDeviceId } from "@/lib/devices";

type Props = {
  chapter: any;
  comicId: string;
};

export default function ChapterRow({ chapter, comicId }: Props) {
  const router = useRouter();
  const deviceId = getDeviceId();

  const chapterProgress = JSON.parse(
    localStorage.getItem(`device:${deviceId}:chapter_progress`) || "{}"
  );

  const pageIndex = chapterProgress[chapter.id] ?? null;

  return (
    <div
      className="
        rounded-xl border border-red-900/40
        bg-[#090909] p-4
        hover:border-red-600 transition
        cursor-pointer
      "
      onClick={() => router.push(`/reader/${chapter.id}`)}
      onMouseEnter={(e) =>
        anime({
          targets: e.currentTarget,
          translateX: 6,
          duration: 200,
          easing: "easeOutQuad",
        })
      }
      onMouseLeave={(e) =>
        anime({
          targets: e.currentTarget,
          translateX: 0,
          duration: 200,
          easing: "easeOutQuad",
        })
      }
    >
      <div className="flex justify-between">
        <div>
          <div className="text-red-200 font-medium">
            Chapter {chapter.chapter_number}
          </div>
          <div className="text-xs text-red-400">
            {chapter.title}
          </div>
        </div>

        {pageIndex !== null && (
          <span className="text-xs text-red-500">
            Continue
          </span>
        )}
      </div>
    </div>
  );
}
