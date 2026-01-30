"use client"

import Link from "next/link"
import PixelCard from "./PixelCard"

type ComicCardProps = {
  id: string
  title: string
  coverUrl: string | null
}

export default function ComicCard({
  id,
  title,
  coverUrl,
}: ComicCardProps) {
  return (
    <Link
      href={`/comic/${id}`}
      className="block w-full max-w-[220px] mx-auto"
    >
      {/* Aspect-ratio wrapper keeps mobile safe */}
      <div className="relative aspect-[2/3] w-full">
        <PixelCard variant="pink">
          {/* IMAGE LAYER */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              loading="lazy"
              draggable={false}
              className="
                absolute inset-0
                h-full w-full
                object-cover
                rounded-[16px]
                select-none
              "
            />
          ) : (
            <div className="absolute inset-0 rounded-[16px] bg-muted" />
          )}

          {/* TITLE OVERLAY */}
          <div
            className="
              absolute inset-x-0 bottom-0
              z-10
              pointer-events-none
              rounded-b-[16px]
              bg-gradient-to-t
              from-black/85
              via-black/40
              to-transparent
              px-3 pb-3 pt-6
            "
          >
            <p
              className="
                text-white
                text-[13px]
                font-semibold
                leading-tight
                line-clamp-2
              "
            >
              {title}
            </p>
          </div>
        </PixelCard>
      </div>
    </Link>
  )
}
