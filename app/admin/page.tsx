"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminPanel from "./AdminPanel"

export default function AdminPage() {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const key = localStorage.getItem("admin_key")

    if (key === "iamtheadmin") {
      setAllowed(true)
    } else {
      router.replace("/")
    }
  }, [router])

  if (!allowed) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Access denied
      </main>
    )
  }

  return <AdminPanel />
}
