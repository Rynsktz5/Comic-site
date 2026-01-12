"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type User = {
  id: string
  username: string
}

type UserContextType = {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initUser = async () => {
      const username = localStorage.getItem("username")

      if (!username) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, username")
        .eq("username", username)
        .single()

      if (!error && data) {
        setUser(data)
        localStorage.setItem("user_id", data.id) // 🔑 important
      }

      setLoading(false)
    }

    initUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
