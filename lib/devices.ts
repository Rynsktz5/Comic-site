// lib/devices.ts

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server"

  let id = localStorage.getItem("device_id")

  if (!id) {
    // ✅ SAFE UUID fallback for all browsers
    id =
      typeof crypto !== "undefined" &&
      "randomUUID" in crypto
        ? crypto.randomUUID()
        : generateFallbackId()

    localStorage.setItem("device_id", id)
  }

  return id
}

/* 🔒 Fallback UUID generator */
function generateFallbackId() {
  return "dev-" + Math.random().toString(36).slice(2) + Date.now()
}
