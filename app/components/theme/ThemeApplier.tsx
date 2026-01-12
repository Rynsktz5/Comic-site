"use client";

import { useEffect } from "react";

export default function ThemeApplier() {
  useEffect(() => {
    const theme =
      localStorage.getItem("theme") || "inferno";

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );
  }, []);

  return null;
}
