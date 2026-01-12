"use client";

type HomeMenuButtonProps = {
  onClick: () => void
}

export default function HomeMenuButton({ onClick }: HomeMenuButtonProps) {

  return (
    <button
      onClick={onClick}
      className="
        fixed top-4 right-4 z-50
        w-12 h-12 rounded-full
        bg-zinc-900 text-white
        flex items-center justify-center
        shadow-lg
        active:scale-95
      "
    >
      ☰
    </button>
  );
}
