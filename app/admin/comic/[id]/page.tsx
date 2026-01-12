"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

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

export default function ComicDetailPage() {
  const { id } = useParams() as { id: string }

  const [comic, setComic] = useState<Comic | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)

  /* LOAD DATA */
  useEffect(() => {
    const load = async () => {
      const { data: c } = await supabase
        .from("comics")
        .select("*")
        .eq("id", id)
        .single()

      setComic(c)

      const { data: ch } = await supabase
        .from("chapters")
        .select("*")
        .eq("comic_id", id)
        .order("chapter_number")

      setChapters(ch || [])
      setLoading(false)
    }

    load()
  }, [id])

  /* LOAD FAV STATE */
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favourites") || "[]")
    setIsFav(favs.includes(id))
  }, [id])

  /* TOGGLE FAV */
  const toggleFavourite = () => {
    const favs: string[] = JSON.parse(
      localStorage.getItem("favourites") || "[]"
    )

    let updated: string[]
    if (favs.includes(id)) {
      updated = favs.filter((f) => f !== id)
    } else {
      updated = [...favs, id]
    }

    localStorage.setItem("favourites", JSON.stringify(updated))
    setIsFav(updated.includes(id))
  }

  if (loading) {
    return <main className="min-h-screen bg-black text-white p-8">Loading…</main>
  }

  if (!comic) {
    return <main className="min-h-screen bg-black text-white p-8">Comic not found</main>
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      {/* HEADER */}
      <div className="flex gap-8 mb-10">
        {comic.cover_url && (
          <img src={comic.cover_url} className="w-56 rounded" />
        )}

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold">{comic.title}</h1>

          {comic.author && (
            <p className="text-sm text-zinc-400">By {comic.author}</p>
          )}

          {comic.status && (
            <p className="text-sm text-zinc-400">
              Status: {comic.status}
            </p>
          )}

          {comic.genres && comic.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {comic.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs bg-zinc-800 rounded"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* FAV BUTTON */}
          <button
            onClick={toggleFavourite}
            className={`px-4 py-2 rounded ${
              isFav ? "bg-red-600" : "bg-zinc-700"
            }`}
          >
            {isFav ? "Remove from favourites" : "Add to favourites"}
          </button>

          {comic.description && (
            <p className="text-zinc-300 max-w-xl">
              {comic.description}
            </p>
          )}
        </div>
      </div>

      {/* CHAPTERS */}
      <section>
        <h2 className="text-2xl mb-4">Chapters</h2>

        <div className="space-y-3">
          {chapters.map((ch) => (
            <Link
              key={ch.id}
              href={`/reader/${ch.id}`}
              className="block bg-zinc-900 p-4 rounded hover:bg-zinc-800"
            >
              Chapter {ch.chapter_number}: {ch.title}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
