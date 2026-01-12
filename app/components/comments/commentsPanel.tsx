"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import { supabase } from "@/lib/supabaseClient";

type Comment = {
  id: string;
  username: string;
  message: string;
  created_at: string;
};

type Props = {
  chapterId: string;
  open: boolean;
  onClose: () => void;
};

export default function CommentsPanel({ chapterId, open, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const username =
    typeof window !== "undefined"
      ? localStorage.getItem("username") || "Reader"
      : "Reader";

  /* ================= LOAD COMMENTS ================= */
  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });

    setComments(data || []);
  };

  /* ================= OPEN / CLOSE ANIMATION ================= */
  useEffect(() => {
    if (!panelRef.current) return;

    if (open) {
      loadComments();
      anime({
        targets: panelRef.current,
        translateY: ["100%", "0%"],
        opacity: [0, 1],
        duration: 420,
        easing: "easeOutExpo",
      });
    }
  }, [open]);

  const close = () => {
    if (!panelRef.current) return;

    anime({
      targets: panelRef.current,
      translateY: ["0%", "100%"],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInExpo",
      complete: onClose,
    });
  };

  /* ================= SEND COMMENT ================= */
  const send = async () => {
    if (!text.trim()) return;

    await supabase.from("comments").insert({
      chapter_id: chapterId,
      username,
      message: text.trim(),
    });

    setText("");
    loadComments();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div
        ref={panelRef}
        className="
          absolute bottom-0 left-0 right-0
          h-[70vh]
          rounded-t-3xl
          bg-black/70 backdrop-blur-xl
          border-t border-red-900/50
          shadow-[0_-20px_40px_rgba(220,38,38,0.25)]
          p-5
          flex flex-col
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm uppercase tracking-widest text-red-400">
            Comments
          </h3>
          <button
            onClick={close}
            className="text-red-400 text-xs hover:text-red-300"
          >
            ✕ Close
          </button>
        </div>

        {/* COMMENTS LIST */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {comments.length === 0 && (
            <div className="text-red-500/60 text-sm text-center mt-10">
              No comments yet. Be the first.
            </div>
          )}

          {comments.map(c => (
            <div
              key={c.id}
              className="
                rounded-xl
                bg-black/50
                border border-red-900/30
                p-3
              "
            >
              <div className="text-xs text-red-400 mb-1">
                {c.username}
              </div>
              <div className="text-sm text-red-100">
                {c.message}
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write something..."
            className="
              flex-1
              rounded-xl
              bg-black/60
              border border-red-900/40
              px-4 py-3
              text-sm text-red-100
              outline-none
              focus:border-red-500
            "
          />
          <button
            onClick={send}
            className="
              px-5
              rounded-xl
              bg-red-600
              text-black
              font-semibold
              hover:bg-red-500
              transition
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
