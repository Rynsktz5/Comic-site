"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { getDeviceId } from "@/lib/devices"
import anime from "animejs/lib/anime.es.js"

/* ================= TYPES ================= */

type Comic = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  author: string | null
  status: string | null
  genres: string[] | null
}

type Chapter = {
  id: string
  title: string
  chapter_number: number
}
/* ================= ANIME HELPERS ================= */

const hoverIn = (el: HTMLElement) => {
  anime.remove(el)
  anime({
    targets: el,
    translateY: -6,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(220,38,38,0.35)",
    duration: 300,
    easing: "easeOutExpo",
  })
}

const hoverOut = (el: HTMLElement) => {
  anime.remove(el)
  anime({
    targets: el,
    translateY: 0,
    scale: 1,
    boxShadow: "0 8px 25px rgba(0,0,0,0.8)",
    duration: 250,
    easing: "easeOutQuad",
  })
}

const press = (el: HTMLElement) => {
  anime.remove(el)
  anime({
    targets: el,
    scale: [1, 0.97, 1],
    duration: 180,
    easing: "easeOutQuad",
  })
}

/* ================= COMPONENT ================= */

export default function ComicDetailPage() {
  const { id: comicId } = useParams<{ id: string }>()
  const router = useRouter()
  const deviceId = getDeviceId()

  const [comic, setComic] = useState<Comic | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  const [isFav, setIsFav] = useState(false)
  const [resumeChapter, setResumeChapter] = useState<number | null>(null)
  const [comicPercent, setComicPercent] = useState(0)
  const [reverse, setReverse] = useState(false)

  /* ================= LOAD COMIC + CHAPTERS ================= */

  useEffect(() => {
    if (!comicId) return

    const load = async () => {
      setLoading(true)

      const { data: c } = await supabase
        .from("comics")
        .select("*")
        .eq("id", comicId)
        .single()

      const { data: ch } = await supabase
        .from("chapters")
        .select("*")
        .eq("comic_id", comicId)
        .order("chapter_number")

      setComic(c)
      setChapters(ch || [])
      setLoading(false)
    }

    load()
  }, [comicId])

  /* ================= FAVOURITES ================= */

  useEffect(() => {
    if (!comicId) return
    const key = `device:${deviceId}:fav_comics`
    const favs = JSON.parse(localStorage.getItem(key) || "[]")
    setIsFav(favs.includes(comicId))
  }, [comicId, deviceId])

  const toggleFavourite = () => {
    const key = `device:${deviceId}:fav_comics`
    const favs: string[] = JSON.parse(localStorage.getItem(key) || "[]")

    const updated = favs.includes(comicId)
      ? favs.filter(id => id !== comicId)
      : [...favs, comicId]

    localStorage.setItem(key, JSON.stringify(updated))
    setIsFav(updated.includes(comicId))
  }

  /* ================= PROGRESS (SINGLE SOURCE) ================= */

  useEffect(() => {
    if (!comicId) return

    const raw = localStorage.getItem(
      `device:${deviceId}:comic_progress`
    )

    if (!raw) {
      setComicPercent(0)
      setResumeChapter(null)
      return
    }

    const progress = JSON.parse(raw)
    const entry = progress[comicId]

    if (!entry || !entry.totalChapters) {
      setComicPercent(0)
      setResumeChapter(null)
      return
    }

    const percent = Math.min(
      100,
      Math.floor((entry.lastChapter / entry.totalChapters) * 100)
    )

    setComicPercent(percent)
    setResumeChapter(entry.lastChapter)
  }, [comicId, deviceId])

  /* ================= SORT CHAPTERS ================= */

  const sortedChapters = useMemo(() => {
    return [...chapters].sort((a, b) =>
      reverse
        ? a.chapter_number - b.chapter_number
        : b.chapter_number - a.chapter_number
    )
  }, [chapters, reverse])

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        Loading…
      </main>
    )
  }

  if (!comic) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-500">
        Comic not found
      </main>
    )
  }

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-6 py-12 text-red-100">

      {/* BACK */}
      <button
        onClick={() => router.push("/")}
        className="
          fixed top-5 left-5 z-50
          px-4 py-2 rounded-lg
          bg-zinc-950/80 border border-red-900/60
          text-sm text-red-200
          backdrop-blur
          hover:border-red-500 hover:text-red-400
          transition
        "
      >
        ← Home
      </button>

      {/* ================= HERO ================= */}
      <div className="
        mb-16 rounded-2xl
        bg-gradient-to-br from-zinc-950 via-black to-zinc-900
        border border-red-900/50
        shadow-[0_0_40px_-10px_rgba(220,38,38,0.25)]
        p-6 md:p-8
      ">
        <div className="flex flex-col md:flex-row gap-8">

          {comic.cover_url && (
            <img
              src={comic.cover_url}
              className="
                w-full md:w-60 rounded-xl object-cover
                border border-red-900/40 shadow-lg
              "
            />
          )}

          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {comic.title}
            </h1>

            {comic.author && (
              <p className="text-sm text-red-400">By {comic.author}</p>
            )}

            {comic.status && (
              <p className="text-xs uppercase tracking-widest text-red-500">
                {comic.status}
              </p>
            )}

            {comic.genres && (
              <div className="flex flex-wrap gap-2">
                {comic.genres.map(g => (
                  <span
                    key={g}
                    className="
                      px-3 py-1 text-xs rounded-full
                      bg-red-950/40 border border-red-900/40 text-red-300
                    "
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* PROGRESS */}
            {comicPercent > 0 && (
              <div className="pt-4 max-w-md">
                <div className="flex justify-between text-xs text-red-400 mb-1">
                  <span>Progress</span>
                  <span>{comicPercent}%</span>
                </div>
                <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                  <div
                    className="
                      h-full bg-red-600
                      shadow-[0_0_12px_rgba(220,38,38,0.7)]
                      transition-all
                    "
                    style={{ width: `${comicPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={toggleFavourite}
                className="
                  px-5 py-2 rounded-lg
                  bg-zinc-900
                  border border-red-900/50
                  hover:border-red-500
                  transition
                "
              >
                {isFav ? "Remove Favourite" : "Add to Favourites"}
              </button>

              {resumeChapter !== null && (
                <button
                  onClick={() => {
                    const ch = chapters.find(
                      c => c.chapter_number === resumeChapter
                    )
                    if (ch) router.push(`/reader/${ch.id}`)
                  }}
                  className="
                    px-6 py-2 rounded-lg
                    bg-red-600 text-black font-semibold
                    hover:bg-red-500
                    shadow-[0_0_20px_rgba(220,38,38,0.6)]
                    transition
                  "
                >
                  Resume Reading
                </button>
              )}
            </div>

            {comic.description && (
              <p className="text-sm text-red-300/80 pt-4 max-w-xl">
                {comic.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= CHAPTER LIST ================= */}
      <section>
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Chapters</h2>
          <button
            onClick={() => setReverse(v => !v)}
            className="
              px-4 py-2 text-xs rounded-lg
              bg-zinc-900 border border-red-900/40
              hover:border-red-500 transition
            "
          >
            {reverse ? "Oldest First" : "Newest First"}
          </button>
        </div>

        <div className="space-y-5">
          {sortedChapters.map(ch => (
            <Link key={ch.id} href={`/reader/${ch.id}`}>
  <div
    onMouseEnter={e => hoverIn(e.currentTarget)}
    onMouseLeave={e => hoverOut(e.currentTarget)}
    onMouseDown={e => press(e.currentTarget)}
    className="
      group relative cursor-pointer
      rounded-xl
      bg-zinc-950
      border border-red-900/30
      p-4
      flex justify-between items-center

      shadow-[0_8px_25px_-15px_rgba(0,0,0,0.8)]
      transition-colors
    "
  >

                <div>
                  <div className="font-medium">
                    Chapter {ch.chapter_number}
                  </div>
                  {ch.title && (
                    <div className="text-xs text-red-400">
                      {ch.title}
                    </div>
                  )}
                </div>

                <span
  className="
    px-4 py-1 text-xs rounded-full
    bg-red-900/20 text-red-300
    transition
    group-hover:bg-red-600
    group-hover:text-black
  "
>
  Read
</span>

              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
