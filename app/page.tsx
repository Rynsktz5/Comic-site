"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Masonry from "@/components/Masonry";
import HomeMenu from "@/app/components/menu/HomeMenu";
import ContinueReadingCard from "@/app/components/continue/ContinueReadingCard";
import { runHomeTimeline } from "@/app/components/animations/homeTimeline";
import GreetingStrip from "@/app/components/home/GreetingStrip";
import ProfileMenu from "@/app/components/profile/ProfileMenu";
import { getDeviceId } from "@/lib/devices";

type Comic = {
  id: string;
  title: string;
  cover_url: string | null;
};

export default function HomePage() {
  const router = useRouter();

  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);

  const [deviceId, setDeviceId] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("Reader");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

/*================= CLIENT INIT ===================== */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const name = localStorage.getItem("username");
    if (!name) {
      router.replace("/enter-username");
      return;
    }

    setUsername(name);
    setDeviceId(localStorage.getItem("device_Id") || "");

    // Default toggle
    if (localStorage.getItem("continue_enabled") === null) {
      localStorage.setItem("continue_enabled", "true");
    }
  }, [router]);


  /* ================= USERNAME GATE ================= */
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) router.replace("/enter-username");
  }, [router]);

  /* ================= DEVICE ID ================= */
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
  }, []);

  /* ================= LOAD COMICS ================= */
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("comics")
        .select("id, title, cover_url");

      setComics(data || []);
      setLoading(false);
    };

    load();
  }, []);

  /* ================= READ PROGRESS ================= */
  const comicProgress = useMemo(() => {
    if (!deviceId) return {};
    try {
      return JSON.parse(
        localStorage.getItem(`device:${deviceId}:comic_progress`) || "{}"
      );
    } catch {
      return {};
    }
  }, [deviceId]);

  

  /* ================= BUILD MASONRY ITEMS ================= */
  const masonryItems = useMemo(() => {
    return comics.map(c => {
      const entry = comicProgress[c.id];

      let progress = 0;
      let status: "NEW" | "CONTINUE" | "COMPLETED" = "NEW";

      if (entry) {
        progress = Math.floor(
          (entry.lastChapter / entry.totalChapters) * 100
        );

        if (progress >= 100) status = "COMPLETED";
        else if (progress > 0) status = "CONTINUE";
      }

      return {
        id: c.id,
        img: c.cover_url,
        title: c.title,
        url: `/comic/${c.id}`,
        height: 420,
        progress,
        status,
      };
    });
  }, [comics, comicProgress]);

/* ================= ONGOING COUNT ================= */
const ongoingCount = useMemo(() => {
    return Object.values(comicProgress).filter((entry: any) => {
      if (!entry) return false;
      return (
        entry.lastChapter > 0 ||
        entry.pageIndex > 0
      );
    }).length;
  }, [comicProgress]);

 /* ================= SHOW CONTINUE CARD? ================= */
  const showContinue = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      localStorage.getItem("continue_enabled") === "true" &&
      ongoingCount > 0
    );
  }, [ongoingCount]);

/* ================= PAGE TIMELINE ================= */
  useEffect(() => {
    if (!loading) runHomeTimeline();
  }, [loading]);

  /* ================= RENDER ================= */
  return (
    <main className="relative z-10 min-h-screen px-6 pt-20">
      {/* MENU BUTTON */}
      <button
        onClick={() => setMenuOpen(true)}
        className="
          fixed top-4 left-4 z-40
          rounded-lg bg-zinc-900/80 px-3 py-2
          text-white backdrop-blur
        "
      >
        ☰
      </button>

      <button
  onClick={() => setProfileMenuOpen(true)}
  className="
    fixed top-4 right-4 z-40
    w-11 h-11 rounded-full
    bg-[#0b0b0b]
    border border-red-800/70
    flex items-center justify-center
    text-red-200 font-semibold
    shadow-lg
    hover:border-red-500
    transition
  "
>
  {username.charAt(0).toUpperCase()}
</button>
<ProfileMenu
  open={profileMenuOpen}
  onClose={() => setProfileMenuOpen(false)}
/>



      {/* OVERLAY MENU */}
      <HomeMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <GreetingStrip
  username={username}
  ongoingCount={ongoingCount}
/>
{/* CONTINUE CARD */}
      {showContinue && (
        <div className="reveal-continue">
          <ContinueReadingCard />
        </div>
      )}

      {/* MENU BUTTON + MENU */}

 <div className="reveal-continue ">
  <ContinueReadingCard />
</div>


      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="reveal-title text-lg font-semibold text-red-100">
  Your Library
</h1>


<span className="text-xs text-red-400/70">
  {comics.length} stories waiting
</span>

      </div>

      


      {/* GRID */}
      <section className="reveal-grid relative z-10">
        {!loading && <Masonry items={masonryItems} />}


        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-xl bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
