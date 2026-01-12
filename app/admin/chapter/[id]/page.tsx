"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

/* ================= TYPES ================= */

type Page = {
  id: string
  image_url: string
  page_number: number
}

/* ================= SORTABLE ITEM ================= */

function SortablePage({
  page,
  index,
  onDelete,
}: {
  page: Page
  index: number
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 bg-zinc-900 p-3 rounded cursor-grab active:cursor-grabbing"
    >
      <span className="w-8 text-center text-zinc-400">
        {index + 1}
      </span>

      <img
        src={page.image_url}
        className="w-28 rounded select-none"
        draggable={false}
      />

      <button
        onClick={() => onDelete(page.id)}
        className="ml-auto text-red-400 hover:text-red-300"
      >
        Delete
      </button>
    </div>
  )
}

/* ================= MAIN ================= */

export default function AdminChapterPages() {
  const { id: chapterId } = useParams() as { id: string }

  const [pages, setPages] = useState<Page[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])

  /* ================= LOAD ================= */

  const loadPages = async () => {
    const { data } = await supabase
      .from("pages")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("page_number")

    setPages(data || [])
  }

  useEffect(() => {
    loadPages()
  }, [chapterId])

  /* ================= DND ================= */

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const onDragEnd = (event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setPages((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)

      const reordered = arrayMove(items, oldIndex, newIndex)

      return reordered.map((p, idx) => ({
        ...p,
        page_number: idx + 1,
      }))
    })
  }

  /* ================= SAVE ORDER ================= */

  const saveChanges = async () => {
    setSaving(true)

    for (const p of pages) {
      await supabase
        .from("pages")
        .update({ page_number: p.page_number })
        .eq("id", p.id)
    }

    setSaving(false)
    alert("Page order saved")
    loadPages()
  }

  /* ================= DELETE ================= */

  const deletePage = async (pageId: string) => {
    if (!confirm("Delete this page permanently?")) return

    await supabase.from("pages").delete().eq("id", pageId)
    loadPages()
  }

  /* ================= UPLOAD MORE ================= */

  const uploadMorePages = async () => {
    if (newFiles.length === 0) {
      alert("Select images first")
      return
    }

    setUploading(true)

    const startIndex = pages.length

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      const ext = file.name.split(".").pop()
      const path = `${chapterId}/${crypto.randomUUID()}.${ext}`

      await supabase.storage.from("pages").upload(path, file)

      const { data } = supabase.storage
        .from("pages")
        .getPublicUrl(path)

      await supabase.from("pages").insert({
        chapter_id: chapterId,
        image_url: data.publicUrl,
        page_number: startIndex + i + 1,
      })
    }

    setNewFiles([])
    setUploading(false)
    loadPages()
  }

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-black text-white p-8 space-y-8">
      <h1 className="text-2xl">Edit Chapter Pages</h1>

      {/* UPLOAD MORE */}
      <section className="bg-zinc-900 p-4 rounded space-y-3 max-w-2xl">
        <h2 className="text-lg">Upload More Pages</h2>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) =>
            setNewFiles(Array.from(e.target.files || []))
          }
        />

        <button
          onClick={uploadMorePages}
          disabled={uploading}
          className="bg-purple-600 px-4 py-2 rounded"
        >
          {uploading ? "Uploading…" : "Add Pages"}
        </button>
      </section>

      {/* PAGES */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={pages.map(p => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4 max-w-2xl">
            {pages.map((p, index) => (
              <SortablePage
                key={p.id}
                page={p}
                index={index}
                onDelete={deletePage}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={saveChanges}
        disabled={saving}
        className="bg-green-600 px-5 py-2 rounded"
      >
        {saving ? "Saving…" : "Save Order"}
      </button>
    </main>
  )
}
