"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  animateProfileMenuIn,
  animateProfileMenuOut,
  animateProfileItemClick,
} from "@/app/components/animations/profileMenuAnimations";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ProfileMenu({ open, onClose }: Props) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  /* OPEN ANIMATION */
  useEffect(() => {
    if (open && menuRef.current) {
      animateProfileMenuIn(menuRef.current);
    }
  }, [open]);

  if (!open) return null;

  /* CLOSE WITH ANIMATION */
  const close = () => {
    if (!menuRef.current) return;
    animateProfileMenuOut(menuRef.current, onClose);
  };

  /* MENU ITEM (ANIMATED + ROUTED) */
  const item = (label: string, path: string) => (
    <button
      className="
        text-left text-sm
        text-red-100
        tracking-wide
        hover:text-red-400
        transition
      "
      onClick={() => {
        if (!menuRef.current) return;

        animateProfileItemClick(menuRef.current, () => {
          onClose();
          router.push(path);
        });
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      ref={menuRef}
      className="
        fixed top-16 right-4 z-50
        w-64 rounded-xl
        bg-[#0b0b0b]
        border border-red-900/70
        p-6
        shadow-[0_0_40px_rgba(220,38,38,0.15)]
      "
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs tracking-widest text-red-500 uppercase">
          Profile
        </span>
        <button
          onClick={close}
          className="text-red-600 hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      {/* MENU ITEMS */}
     <div className="flex flex-col gap-4">
  {item("View Profile", () => router.push("/profile"))}
  {item("Stats & Badges", () => router.push("/profile/stats"))}
  {item("Theme", () => router.push("/profile/theme"))}
</div>

    </div>
  );
}
