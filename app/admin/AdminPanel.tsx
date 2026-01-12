"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import anime from "animejs/lib/anime.es.js"

/* ================= TYPES ================= */

type Comic = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  author?: string | null
  status?: string | null
  genres?: string[] | null
}

type Chapter = {
  id: string
  title: string
  chapter_number: number
}

/* ================= COMPONENT ================= */

export default function AdminPage() {
  const listRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const [comics, setComics] = useState<Comic[]>([])
  const [selectedComic, setSelectedComic] = useState<Comic | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const [chapterTitle, setChapterTitle] = useState("")
  const [chapterNumber, setChapterNumber] = useState(1)
  const [chapterFiles, setChapterFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  /* ================= LOAD COMICS ================= */

  const fetchComics = async () => {
    const { data } = await supabase
      .from("comics")
      .select("*")
      .order("created_at", { ascending: false })

    setComics(data || [])
  }

  useEffect(() => {
    fetchComics()
  }, [])

  /* ================= ANIMATIONS ================= */

  useEffect(() => {
    if (!listRef.current) return
    anime({
      targets: listRef.current.children,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(80),
      easing: "easeOutExpo",
    })
  }, [comics])

  const pulse = (el: HTMLElement) => {
    anime({
      targets: el,
      scale: [1, 0.96, 1],
      duration: 200,
      easing: "easeOutQuad",
    })
  }

  /* ================= ADD COMIC ================= */

  const addComic = async () => {
    if (!title.trim()) return alert("Title required")

    setLoading(true)
    let coverUrl: string | null = null

    if (coverFile) {
      const ext = coverFile.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${ext}`

      await supabase.storage.from("covers").upload(fileName, coverFile)
      const { data } = supabase.storage.from("covers").getPublicUrl(fileName)
      coverUrl = data.publicUrl
    }

    await supabase.from("comics").insert({
      title,
      description,
      cover_url: coverUrl,
    })

    setTitle("")
    setDescription("")
    setCoverFile(null)
    setLoading(false)
    fetchComics()
  }

  
  /* ================= LOAD SELECTED COMIC ================= */

  const openEditor = async (comic: Comic) => {
    setSelectedComic(comic)

    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("comic_id", comic.id)
      .order("chapter_number")

    setChapters(data || [])

    requestAnimationFrame(() => {
      if (!editorRef.current) return
      anime({
        targets: editorRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        easing: "easeOutExpo",
      })
    })
  }

  /* ================= DELETE COMIC (CASCADE) ================= */

  const deleteComicCascade = async (comic: Comic) => {
    const ok = confirm(
      `Delete "${comic.title}"?\nThis will remove ALL chapters & pages permanently.`
    )
    if (!ok) return

    try {
      const { data: chapterRows } = await supabase
        .from("chapters")
        .select("id")
        .eq("comic_id", comic.id)

      if (chapterRows) {
        for (const ch of chapterRows) {
          const { data: pages } = await supabase
            .from("pages")
            .select("image_url")
            .eq("chapter_id", ch.id)

          if (pages) {
            const paths = pages
              .map(p => {
                const idx = p.image_url.indexOf("/pages/")
                return idx !== -1 ? p.image_url.slice(idx + 7) : null
              })
              .filter(Boolean) as string[]

            if (paths.length) {
              await supabase.storage.from("pages").remove(paths)
            }
          }

          await supabase.from("pages").delete().eq("chapter_id", ch.id)
        }

        await supabase.from("chapters").delete().eq("comic_id", comic.id)
      }

      if (comic.cover_url) {
        const idx = comic.cover_url.indexOf("/covers/")
        if (idx !== -1) {
          const path = comic.cover_url.slice(idx + 8)
          await supabase.storage.from("covers").remove([path])
        }
      }

      await supabase.from("comics").delete().eq("id", comic.id)

      setSelectedComic(null)
      setChapters([])
      fetchComics()

      alert("Comic deleted successfully")
    } catch (err) {
      console.error(err)
      alert("Failed to delete comic")
    }
  }

  /* ================= DELETE CHAPTER ================= */

  const deleteChapter = async (chapterId: string) => {
    const ok = confirm("Delete this chapter permanently?")
    if (!ok) return

    await supabase.from("pages").delete().eq("chapter_id", chapterId)
    await supabase.from("chapters").delete().eq("id", chapterId)

    if (selectedComic) {
      const { data } = await supabase
        .from("chapters")
        .select("*")
        .eq("comic_id", selectedComic.id)
        .order("chapter_number")

      setChapters(data || [])
    }
  }

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen bg-black text-red-100 p-10 space-y-12">
      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* ADD COMIC */}
      <section className="rounded-2xl border border-red-900/40 p-6 bg-zinc-950 space-y-4">
        <h2>Add New Comic</h2>

        <input className="admin-input" placeholder="Comic title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="admin-input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input type="file" onChange={e => setCoverFile(e.target.files?.[0] || null)} />

        <button onClick={e => { pulse(e.currentTarget); addComic() }} className="admin-btn bg-red-600">
          {loading ? "Adding..." : "Add Comic"}
        </button>
      </section>

      {/* COMIC LIST */}
      <section ref={listRef} className="space-y-4">
        {comics.map(c => (
          <div key={c.id} className="admin-card">
            <div className="flex gap-4">
              {c.cover_url && <img src={c.cover_url} className="w-20 rounded-lg" />}
              <div>
                <h3>{c.title}</h3>
                <p className="text-xs text-red-400">{c.description}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={e => { pulse(e.currentTarget); openEditor(c) }} className="admin-btn bg-purple-600">
                Edit
              </button>

              <button onClick={e => { pulse(e.currentTarget); deleteComicCascade(c) }} className="admin-btn bg-red-700">
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* CHAPTER LIST */}
      {selectedComic && (
        <section ref={editorRef} className="rounded-2xl border border-red-900/40 p-6 bg-zinc-950 space-y-4">
          <h2>Chapters</h2>

          {chapters.map(ch => (
            <div key={ch.id} className="admin-card flex justify-between items-center">
              <span>Chapter {ch.chapter_number}: {ch.title}</span>

              <div className="flex gap-2">
                <button className="admin-btn bg-blue-600" onClick={() => location.href = `/admin/chapter/${ch.id}`}>
                  Pages
                </button>

                <button className="admin-btn bg-red-600" onClick={() => deleteChapter(ch.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
