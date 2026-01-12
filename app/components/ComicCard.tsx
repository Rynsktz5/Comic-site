"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"

import PixelCard from "@/components/PixelCard"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Comic = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
}

export default function HomePage() {
  const router = useRouter()

  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)

  /* 🔒 USERNAME GATE */
  useEffect(() => {
    const username = localStorage.getItem("username")
    if (!username) {
      router.replace("/enter-username")
    }
  }, [router])

  /* LOAD COMICS */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("comics")
        .select("id, title, description, cover_url")

      setComics(data || [])
      setLoading(false)
    }

    load()
  }, [])

  /* LOADING STATE */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-6xl p-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-6">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-10">
        <div className="text-xl font-bold tracking-wide">
          <span className="text-red-500">H</span>ome
        </div>
      </header>

      {/* HERO */}
      <section className="mb-14 rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20" />

        <div className="relative p-10">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Choose your<br />
            <span className="text-red-500">Evolution</span>
          </h1>

          <p className="mt-3 text-muted-foreground max-w-md">
            Read. Progress. Ascend.
          </p>
        </div>
      </section>

      {/* TITLE ROW */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Comics</h2>
        <span className="text-sm text-muted-foreground">
          {comics.length} titles
        </span>
      </div>

      {/* ✅ PIXELCARD GRID — SIMPLE & STABLE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 place-items-center">
        {comics.map((c) => (
          <Link
            key={c.id}
            href={`/comic/${c.id}`}
            className="block w-full max-w-[220px]"
          >
            <div className="relative aspect-[2/3] w-full">
              <PixelCard variant="pink">
                {/* COVER */}
                {c.cover_url ? (
                  <img
                    src={c.cover_url}
                    alt={c.title}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover rounded-[16px]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted rounded-[16px]" />
                )}

                {/* TITLE OVERLAY */}
                <div className="absolute inset-x-0 bottom-0 pointer-events-none
                                bg-gradient-to-t from-black/85 via-black/40 to-transparent
                                px-3 pb-3 pt-6 rounded-b-[16px]">
                  <p className="text-white text-[13px] font-semibold line-clamp-2">
                    {c.title}
                  </p>
                </div>
              </PixelCard>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
