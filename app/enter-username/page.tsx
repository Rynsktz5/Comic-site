"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function EnterUsernamePage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("username")
    if (saved) router.replace("/")
  }, [router])

  const validate = (name: string) =>
    /^[a-z0-9_]{3,20}$/i.test(name)

  const submit = async () => {
    setError("")
    const name = username.toLowerCase().trim()

    if (!validate(name)) {
      setError("3–20 chars, letters, numbers, underscore only")
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from("users")
      .insert({ username: name })

    if (error) {
      if (error.code === "23505") {
        setError("Username already taken")
      } else {
        setError("Something went wrong")
      }
      setLoading(false)
      return
    }

    localStorage.setItem("username", name)
    router.replace("/")
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="w-80 space-y-4">
        <h1 className="text-xl font-medium text-center">
          Choose your username
        </h1>

        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="username"
          className="w-full bg-zinc-900 p-3 rounded outline-none"
        />

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-white text-black py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </main>
  )
}
