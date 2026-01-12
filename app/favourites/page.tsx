"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { getDeviceId } from "@/lib/devices"


type Comic = {
  id: string
  title: string
  cover_url: string | null
}

export default function FavouritesPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const deviceId = getDeviceId()
const key = `device:${deviceId}:fav_comics`

let favs: string[] = []

try {
  favs = JSON.parse(localStorage.getItem(key) || "[]")
} catch {
  favs = []
}



      if (favs.length === 0) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("comics")
        .select("id, title, cover_url")
        .in("id", favs)

      setComics(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <main className="min-h-screen bg-black text-white p-8">Loading…</main>
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl mb-6">Favourites</h1>

      {comics.length === 0 && (
        <p className="text-zinc-400">No favourites yet</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {comics.map((c) => (
          <Link
            key={c.id}
            href={`/comic/${c.id}`}
            className="block bg-zinc-900 p-3 rounded"
          >
            {c.cover_url && (
              <img src={c.cover_url} className="rounded mb-2" />
            )}
            <p className="text-sm">{c.title}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
