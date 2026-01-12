"use client"

type PowerBarProps = {
  value: number // 0 - 100
  label?: string
}

export function PowerBar({ value, label = "POWER" }: PowerBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  const getColor = () => {
    if (clamped > 50) return "bg-green-500"
    if (clamped > 20) return "bg-yellow-400"
    return "bg-red-500"
  }

  return (
    <div className="w-full px-3">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(clamped)}%</span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />

        {/* glow */}
        <div
          className={`absolute inset-0 ${getColor()} opacity-40 blur-md`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
