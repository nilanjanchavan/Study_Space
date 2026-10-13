"use client"

import { useState } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrophyIcon, CalendarIcon, TrendingUpIcon, TargetIcon, LinkIcon, SparklesIcon } from "lucide-react"

interface CfUnlinkedStateProps {
  onLink: (handle: string) => void
  isLinking: boolean
}

export function CfUnlinkedState({ onLink, isLinking }: CfUnlinkedStateProps) {
  const [handle, setHandle] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (handle.trim()) {
      onLink(handle.trim())
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-4">
      <GlassCard className="p-8 sm:p-10 border-border/60 text-center relative overflow-hidden bg-gradient-to-b from-card/80 to-card/40">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-5 ring-4 ring-primary/10">
          <TrophyIcon size={32} />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Link Your Codeforces Account
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Track questions solved daily, visualize your annual activity heatmap, monitor rating progression, and stay ahead of upcoming rounds.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 text-left">
            <Label htmlFor="cf-handle-input" className="sr-only">Codeforces Handle</Label>
            <Input
              id="cf-handle-input"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="Enter Codeforces handle (e.g. tourist)"
              className="h-11 rounded-xl bg-background/80 text-sm"
              disabled={isLinking}
            />
          </div>
          <Button
            type="submit"
            disabled={!handle.trim() || isLinking}
            className="h-11 px-6 rounded-xl gap-2 font-medium shrink-0"
          >
            <LinkIcon size={14} />
            <span>{isLinking ? "Connecting..." : "Connect Handle"}</span>
          </Button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-border/40 text-left">
          <div className="rounded-xl border border-border/40 bg-card/40 p-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
              <CalendarIcon size={16} />
            </span>
            <p className="text-sm font-semibold text-foreground">Solved Calendar</p>
            <p className="text-xs text-muted-foreground mt-1">
              52-week activity heatmap displaying daily submission streaks and volume.
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 p-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
              <TargetIcon size={16} />
            </span>
            <p className="text-sm font-semibold text-foreground">Daily Goal Tracker</p>
            <p className="text-xs text-muted-foreground mt-1">
              Set minimum solved question goals per day and track your daily consistency.
            </p>
          </div>

          <div className="rounded-xl border border-border/40 bg-card/40 p-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2.5">
              <TrendingUpIcon size={16} />
            </span>
            <p className="text-sm font-semibold text-foreground">Rating Map</p>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive contest trajectory with peak rating markers and rank tiers.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
