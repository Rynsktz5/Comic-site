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

  /* NEW COMIC */
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  /* COMIC META */
  const [author, setAuthor] = useState("")
  const [status, setStatus] = useState("")
  const [genres, setGenres] = useState("")

  /* NEW CHAPTER */
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
      author,
      status,
      genres: genres.split(",").map(g => g.trim()),
    })

    setTitle("")
    setDescription("")
    setAuthor("")
    setStatus("")
    setGenres("")
    setCoverFile(null)
    setLoading(false)
    fetchComics()
  }

  /* ================= OPEN EDITOR ================= */

  const openEditor = async (comic: Comic) => {
    setSelectedComic(comic)
    setAuthor(comic.author || "")
    setStatus(comic.status || "")
    setGenres((comic.genres || []).join(", "))

    const { data } = await supabase
      .from("chapters")
      .select("*")
      .eq("comic_id", comic.id)
      .order("chapter_number")

    setChapters(data || [])

    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth" })
      anime({
        targets: editorRef.current,
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 500,
        easing: "easeOutExpo",
      })
    })
  }

  /* ================= SAVE COMIC META ================= */

  const saveComicMeta = async () => {
    if (!selectedComic) return

    await supabase
      .from("comics")
      .update({
        title: selectedComic.title,
        description: selectedComic.description,
        author,
        status,
        genres: genres.split(",").map(g => g.trim()),
      })
      .eq("id", selectedComic.id)

    fetchComics()
    alert("Comic updated")
  }

  /* ================= ADD CHAPTER ================= */

  const addChapter = async () => {
    if (!selectedComic || !chapterTitle || chapterFiles.length === 0) return

    setUploading(true)

    const { data: chapter } = await supabase
      .from("chapters")
      .insert({
        comic_id: selectedComic.id,
        title: chapterTitle,
        chapter_number: chapterNumber,
      })
      .select()
      .single()

    if (!chapter) return

    for (let i = 0; i < chapterFiles.length; i++) {
      const f = chapterFiles[i]
      const ext = f.name.split(".").pop()
      const path = `${chapter.id}/${crypto.randomUUID()}.${ext}`

      await supabase.storage.from("pages").upload(path, f)
      const { data } = supabase.storage.from("pages").getPublicUrl(path)

      await supabase.from("pages").insert({
        chapter_id: chapter.id,
        image_url: data.publicUrl,
        page_number: i + 1,
      })
    }

    setChapterTitle("")
    setChapterFiles([])
    setUploading(false)
    openEditor(selectedComic)
  }

  /* ================= DELETE CHAPTER ================= */

  const deleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter permanently?")) return
    await supabase.from("pages").delete().eq("chapter_id", chapterId)
    await supabase.from("chapters").delete().eq("id", chapterId)
    if (selectedComic) openEditor(selectedComic)
  }

  /* ================= DELETE COMIC (CASCADE) ================= */

  const deleteComicCascade = async (comic: Comic) => {
    if (!confirm(`Delete "${comic.title}" and EVERYTHING inside it?`)) return

    const { data: chs } = await supabase
      .from("chapters")
      .select("id")
      .eq("comic_id", comic.id)

    if (chs) {
      for (const ch of chs) {
        await supabase.from("pages").delete().eq("chapter_id", ch.id)
      }
      await supabase.from("chapters").delete().eq("comic_id", comic.id)
    }

    if (comic.cover_url) {
      const idx = comic.cover_url.indexOf("/covers/")
      if (idx !== -1) {
        await supabase.storage
          .from("covers")
          .remove([comic.cover_url.slice(idx + 8)])
      }
    }

    await supabase.from("comics").delete().eq("id", comic.id)

    setSelectedComic(null)
    setChapters([])
    fetchComics()
  }

  /* ================= RENDER ================= */

  return (
    <main className="min-h-screen bg-black text-red-100 p-10 space-y-12">

      <h1 className="text-3xl font-bold">Admin Panel</h1>

      {/* ADD COMIC */}
      <section className="admin-box">
        <h2>Add New Comic</h2>

        <input className="admin-input" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea className="admin-input" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <input className="admin-input" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} />
        <input className="admin-input" placeholder="Status (ongoing / completed)" value={status} onChange={e => setStatus(e.target.value)} />
        <input className="admin-input" placeholder="Genres (comma separated)" value={genres} onChange={e => setGenres(e.target.value)} />
        <input type="file" onChange={e => setCoverFile(e.target.files?.[0] || null)} />

        <button className="admin-btn bg-red-600" onClick={addComic}>
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
              <button className="admin-btn bg-purple-600" onClick={() => openEditor(c)}>Edit</button>
              <button className="admin-btn bg-red-700" onClick={() => deleteComicCascade(c)}>Delete</button>
            </div>
          </div>
        ))}
      </section>

      {/* EDITOR */}
      {selectedComic && (
        <section ref={editorRef} className="admin-box space-y-6">
          <h2>Edit Comic</h2>

          <input className="admin-input" value={selectedComic.title} onChange={e => setSelectedComic({ ...selectedComic, title: e.target.value })} />
          <textarea className="admin-input" value={selectedComic.description || ""} onChange={e => setSelectedComic({ ...selectedComic, description: e.target.value })} />
          <input className="admin-input" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" />
          <input className="admin-input" value={status} onChange={e => setStatus(e.target.value)} placeholder="Status" />
          <input className="admin-input" value={genres} onChange={e => setGenres(e.target.value)} placeholder="Genres" />

          <button className="admin-btn bg-green-600" onClick={saveComicMeta}>
            Save Comic
          </button>

          <div className="border-t border-red-900/40 pt-6 space-y-4">
            <h3>Add Chapter</h3>

            <input className="admin-input" placeholder="Chapter title" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} />
            <input className="admin-input" type="number" value={chapterNumber} onChange={e => setChapterNumber(+e.target.value)} />
            <input type="file" multiple onChange={e => setChapterFiles(Array.from(e.target.files || []))} />

            <button className="admin-btn bg-purple-600" onClick={addChapter}>
              {uploading ? "Uploading..." : "Create Chapter"}
            </button>
          </div>

          {chapters.map(ch => (
            <div key={ch.id} className="admin-card flex justify-between items-center">
              <span>Chapter {ch.chapter_number}: {ch.title}</span>
              <div className="flex gap-2">
                <button className="admin-btn bg-blue-600" onClick={() => location.href = `/admin/chapter/${ch.id}`}>Pages</button>
                <button className="admin-btn bg-red-600" onClick={() => deleteChapter(ch.id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
