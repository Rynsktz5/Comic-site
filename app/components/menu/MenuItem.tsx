"use client";

type Props = {
  label: string;
  onClick: () => void;
};

export default function MenuItem({ label, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        menu-item
        text-left
        text-lg
        font-medium
        tracking-wide
        text-white
        hover:text-blue-400
        transition-colors
      "
    >
      {label}
    </button>
  );
}
