"use client"

import { usePathname } from "next/navigation"
import CardNavMenu from "./CardNavMenu"

export default function HeaderWrapper() {
  const pathname = usePathname()

  const showHeader =
    pathname === "/" ||
    pathname.startsWith("/comic")

  if (!showHeader) return null

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wide">
          <span className="text-red-500">M</span>anga
        </a>

        <CardNavMenu />
      </div>
    </header>
  )
}
