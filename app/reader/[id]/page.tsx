"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import anime from "animejs/lib/anime.es.js"
import { supabase } from "@/lib/supabaseClient"
import { getDeviceId } from "@/lib/devices"

/* ================= TYPES ================= */

type Page = {
  id: string
  image_url: string
  page_number: number
}

type Chapter = {
  id: string
  title: string
  chapter_number: number
}

type ReaderSettings = {
  mode: "scroll" | "page"
  direction: "ltr" | "rtl"
}

type Comment = {
  id: string
  username: string
  message: string
  created_at: string
}

/* ================= COMPONENT ================= */

export default function ReaderPage() {
  const { id: chapterId } = useParams<{ id: string }>()
  const router = useRouter()
  const deviceId = getDeviceId()

  const imageRef = useRef<HTMLImageElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<any>(null)

  const [pages, setPages] = useState<Page[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [pageIndex, setPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const [uiHidden, setUiHidden] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<
    "settings" | "chapters" | "comments"
  >("settings")

  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [comicId, setComicId] = useState<string | null>(null)

  const [settings, setSettings] = useState<ReaderSettings>({
    mode: "scroll",
    direction: "ltr",
  })

  /* ================= CONTINUE READING SAVE (FIX) ================= */
  useEffect(() => {
    if (!chapterId) return

    const payload = {
      chapterId,
      pageIndex,
      updatedAt: Date.now(),
    }

    localStorage.setItem(
      "continue_reading",
      JSON.stringify(payload)
    )
  }, [chapterId, pageIndex])

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!chapterId) return

    const load = async () => {
      setLoading(true)

      const { data: chapter } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single()

      if (!chapter) return
      setComicId(chapter.comic_id)

      const { data: pageList } = await supabase
        .from("pages")
        .select("*")
        .eq("chapter_id", chapterId)
        .order("page_number")

      const { data: chapterList } = await supabase
        .from("chapters")
        .select("*")
        .eq("comic_id", chapter.comic_id)
        .order("chapter_number")

      setPages(pageList || [])
      setChapters(chapterList || [])
      setLoading(false)
    }

    load()
  }, [chapterId])

  /* ================= COMMENTS (REALTIME) ================= */

  useEffect(() => {
    if (settingsTab !== "comments") return

    const load = async () => {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("chapter_id", chapterId)
        .order("created_at", { ascending: false })

      setComments(data || [])
    }

    load()

    const channel = supabase
      .channel(`comments-${chapterId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `chapter_id=eq.${chapterId}`,
        },
        payload => {
          setComments(prev => [payload.new as any, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [settingsTab, chapterId])

  const sendComment = async () => {
    if (!commentText.trim() || !chapterId || !comicId) return

    await supabase.from("comments").insert({
      chapter_id: chapterId,
      comic_id: comicId,
      username: localStorage.getItem("username") || "Reader",
      message: commentText.trim(),
    })

    setCommentText("")
  }

  /* ================= SMART UI ================= */

  const showUI = () => {
    setUiHidden(false)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setUiHidden(true), 2200)
  }

  useEffect(showUI, [pageIndex])

  /* ================= PAGE MODE ================= */

  const animatePage = (dir: "next" | "prev", cb: () => void) => {
    if (!imageRef.current) return

    const offset =
      settings.direction === "rtl"
        ? dir === "next"
          ? 40
          : -40
        : dir === "next"
        ? -40
        : 40

    anime({
      targets: imageRef.current,
      opacity: [1, 0],
      translateX: [0, offset],
      duration: 180,
      easing: "easeOutQuad",
      complete: () => {
        cb()
        anime({
          targets: imageRef.current,
          opacity: [0, 1],
          translateX: [offset * -1, 0],
          duration: 220,
          easing: "easeOutQuad",
        })
      },
    })
  }

  const nextPage = () => {
    if (pageIndex >= pages.length - 1) return
    animatePage("next", () => setPageIndex(i => i + 1))
  }

  const prevPage = () => {
    if (pageIndex <= 0) return
    animatePage("prev", () => setPageIndex(i => i - 1))
  }

  /* ================= SETTINGS PANEL ================= */

  const openSettings = () => {
    setSettingsOpen(true)
    requestAnimationFrame(() => {
      anime({
        targets: settingsRef.current,
        translateX: [360, 0],
        opacity: [0, 1],
        duration: 360,
        easing: "easeOutExpo",
      })
    })
  }

  const closeSettings = () => {
    anime({
      targets: settingsRef.current,
      translateX: [0, 360],
      opacity: [1, 0],
      duration: 240,
      easing: "easeInExpo",
      complete: () => setSettingsOpen(false),
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-red-400">
        Loading…
      </main>
    )
  }

  const progress = ((pageIndex + 1) / pages.length) * 100

  return (
    <main className="min-h-screen bg-black text-red-100" onClick={showUI}>
      {/* TOP BAR */}
      {!uiHidden && (
        <header className="fixed top-0 inset-x-0 h-12 z-50 flex items-center justify-between px-4 bg-black/40 backdrop-blur-md border-b border-red-900/30">
          <button onClick={() => router.push("/")} className="text-red-400 text-sm">
            ← Home
          </button>
          <div className="text-xs text-red-400">
            {pageIndex + 1} / {pages.length}
          </div>
          <button onClick={openSettings} className="text-red-400 text-xl">
            ☰
          </button>
        </header>
      )}

      {/* PROGRESS BAR */}
      {!uiHidden && (
        <div className="fixed top-12 left-0 right-0 h-[2px] bg-zinc-900 z-50">
          <div className="h-full bg-red-600" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* SCROLL MODE */}
      {settings.mode === "scroll" && (
        <div className="pt-14 pb-10 space-y-12 flex flex-col items-center">
          {pages.map(p => (
            <img
              key={p.id}
              src={p.image_url}
              className="max-w-[96vw] object-contain"
            />
          ))}
        </div>
      )}

      {/* PAGE MODE */}
      {settings.mode === "page" && (
        <>
          <div className="pt-14 pb-6 flex justify-center items-center">
            <img
              ref={imageRef}
              src={pages[pageIndex].image_url}
              className="max-h-[calc(100vh-80px)] max-w-[96vw] object-contain select-none"
              draggable={false}
            />
          </div>

          <div className="fixed inset-0 z-40 grid grid-cols-3">
            <div onClick={prevPage} />
            <div />
            <div onClick={nextPage} />
          </div>
        </>
      )}

      {/* SETTINGS PANEL */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div
            ref={settingsRef}
            className="absolute right-4 top-16 bottom-6 w-80 rounded-2xl bg-black/60 backdrop-blur-xl border border-red-900/40 p-4 flex flex-col"
          >
            <div className="flex gap-2 mb-3">
              {["settings", "chapters", "comments"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab as any)}
                  className={`flex-1 py-2 rounded-xl text-xs uppercase ${
                    settingsTab === tab
                      ? "bg-red-600 text-black"
                      : "bg-black/40 text-red-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {settingsTab === "settings" && (
                <>
                  <button
                    onClick={() =>
                      setSettings(s => ({
                        ...s,
                        mode: s.mode === "scroll" ? "page" : "scroll",
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-red-900/40"
                  >
                    Toggle Scroll / Page
                  </button>

                  <button
                    onClick={() =>
                      setSettings(s => ({
                        ...s,
                        direction: s.direction === "ltr" ? "rtl" : "ltr",
                      }))
                    }
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border border-red-900/40"
                  >
                    Direction: {settings.direction.toUpperCase()}
                  </button>
                </>
              )}

              {settingsTab === "chapters" &&
                chapters.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => router.push(`/reader/${ch.id}`)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-black/30 border border-red-900/30"
                  >
                    Chapter {ch.chapter_number}
                  </button>
                ))}

              {settingsTab === "comments" &&
                comments.map(c => (
                  <div
                    key={c.id}
                    className="rounded-xl bg-black/50 border border-red-900/30 p-3"
                  >
                    <div className="text-xs text-red-400">{c.username}</div>
                    <div className="text-sm">{c.message}</div>
                  </div>
                ))}
            </div>

            {settingsTab === "comments" && (
              <div className="mt-3 flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-red-900/40 text-sm"
                />
                <button
                  onClick={sendComment}
                  className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center"
                >
                  ➤
                </button>
              </div>
            )}

            <button onClick={closeSettings} className="text-xs text-red-400 mt-3">
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
