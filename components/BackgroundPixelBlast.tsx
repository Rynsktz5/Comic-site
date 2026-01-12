"use client";

import PixelBlast from "./PixelBlast";

export default function BackgroundPixelBlast() {
  return (
    <div
      className="
        fixed inset-0
        z-0
        pointer-events-none
        overflow-hidden
      "
    >
      <PixelBlast color="#c06fec" />

      {/* soft dark overlay to control intensity */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
