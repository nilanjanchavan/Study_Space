"use client"

import { FloatingCard } from "@/components/design-system/floating-card"
import { Button } from "@/components/ui/button"
import { PartyPopperIcon, ClockIcon, CheckCircleIcon, CoffeeIcon, ShieldIcon, RotateCcwIcon, HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CompletionCelebrationProps {
  completedWorkCount: number
  completedBreakCount: number
  distractions: number
  elapsedMs: number
  endedBy: "natural" | "giveup" | "strict" | null
  goal?: string | null
  strictMode: boolean
  onStartAgain?: () => void
  onGoHome?: () => void
}

function formatMinutes(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

function ConfettiDot({ delay, x, y, color }: { delay: number; x: number; y: number; color: string }) {
  return (
    <div
      className="absolute w-1.5 h-1.5 rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `confetti-fall 1.5s ease-in ${delay}ms forwards`,
        backgroundColor: color,
        opacity: 0,
      }}
    />
  )
}

const CONFETTI_COLORS = ["oklch(0.7 0.15 250)", "oklch(0.7 0.15 150)", "oklch(0.8 0.12 80)", "oklch(0.7 0.15 330)"]

const CONFETTI_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  delay: (i * 25) % 500,
  x: ((i * 37) % 100),
  y: ((i * 23) % 40),
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

export function CompletionCelebration({
  completedWorkCount,
  completedBreakCount,
  elapsedMs,
  endedBy,
  goal,
  strictMode,
  onStartAgain,
  onGoHome,
}: CompletionCelebrationProps) {
  const isCompleted = endedBy === "natural"

  return (
    <FloatingCard className="relative overflow-hidden p-8 text-center">
      {/* Confetti */}
      {isCompleted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden animate-fade-in" style={{ animation: "confetti-container 3.5s ease-out forwards" }}>
          {CONFETTI_DOTS.map((dot) => (
            <ConfettiDot key={dot.id} delay={dot.delay} x={dot.x} y={dot.y} color={dot.color} />
          ))}
        </div>
      )}

      <div className="relative z-10">
        {/* Icon */}
        <div className={cn(
          "mx-auto flex size-20 items-center justify-center rounded-2xl mb-6",
          isCompleted
            ? "bg-gradient-to-br from-success/20 to-success/10 text-success"
            : "bg-gradient-to-br from-destructive/20 to-destructive/10 text-destructive"
        )}>
          <PartyPopperIcon size={40} />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {isCompleted ? "Great Work!" : "Session Ended"}
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          {isCompleted
            ? "You completed your focus session"
            : endedBy === "strict"
              ? "Strict mode violation ended the session"
              : "You ended the session early"}
        </p>

        {/* Goal */}
        {goal && (
          <p className="text-sm text-muted-foreground/60 mb-6 italic break-words">
            &ldquo;{goal}&rdquo;
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatBox icon={<ClockIcon size={18} />} label="Duration" value={formatMinutes(elapsedMs)} />
          <StatBox icon={<CheckCircleIcon size={18} />} label="Pomodoros" value={String(completedWorkCount)} />
          <StatBox icon={<CoffeeIcon size={18} />} label="Breaks" value={String(completedBreakCount)} />
          <StatBox icon={<ShieldIcon size={18} />} label="Strict Mode" value={strictMode ? "Yes" : "No"} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button onClick={onStartAgain} size="lg" className="gap-2">
            <RotateCcwIcon size={16} />
            Start Again
          </Button>
          <Button onClick={onGoHome} variant="outline" size="lg" className="gap-2">
            <HomeIcon size={16} />
            Dashboard
          </Button>
        </div>
      </div>
    </FloatingCard>
  )
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 px-3 py-3">
      <div className="flex justify-center mb-1.5 text-muted-foreground">{icon}</div>
      <p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  )
}
