"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { codeforcesApi } from "@/services/codeforces"
import { useCodeforcesSettings } from "@/hooks/use-settings"
import { getCfTier } from "@/components/codeforces/cf-tier-utils"
import { GlassCard } from "@/components/design-system/glass-card"
import { Badge } from "@/components/ui/badge"
import { TrophyIcon, FlameIcon, ArrowRightIcon, TargetIcon, CheckCircle2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CodeforcesWidget() {
  const [settings] = useCodeforcesSettings()
  const dailyGoal = settings.dailyGoal ?? 3

  const { data } = useQuery({
    queryKey: ["codeforces", "profile"],
    queryFn: () => codeforcesApi.getProfile(),
    staleTime: 60_000,
  })

  const profile = data?.data.profile
  const tier = getCfTier(profile?.rating ?? null)
  const solvedToday = profile?.stats?.solvedToday ?? 0
  const progressPct = Math.min(100, Math.round((solvedToday / dailyGoal) * 100))
  const streak = profile?.stats?.streak?.current ?? 0

  if (!profile || !profile.codeforcesHandle) {
    return (
      <GlassCard className="p-5 border-border/60 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrophyIcon size={14} />
              </span>
              <h3 className="text-sm font-semibold text-foreground">Codeforces</h3>
            </div>
            <Link
              href="/codeforces"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              Connect <ArrowRightIcon size={11} />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Link your handle to track daily solved questions, heatmap streaks, and contest ratings.
          </p>
        </div>

        <Link
          href="/codeforces"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <TrophyIcon size={13} />
          <span>Connect Codeforces</span>
        </Link>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-5 border-border/60 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrophyIcon size={14} />
            </span>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Codeforces</h3>
              <Badge variant="outline" className={cn("text-[10px] font-semibold px-1.5 py-0", tier.badgeClass)}>
                {profile.rating ?? "Unrated"}
              </Badge>
            </div>
          </div>

          <Link
            href="/codeforces"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            Hub <ArrowRightIcon size={11} />
          </Link>
        </div>

        {/* Daily Progress */}
        <div className="mt-3">
          <div className="flex items-baseline justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <TargetIcon size={12} className="text-primary" /> Today's Solved
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {solvedToday} <span className="text-muted-foreground font-normal">/ {dailyGoal}</span>
            </span>
          </div>

          <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden p-0.5 border border-border/40">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                solvedToday >= dailyGoal ? "bg-emerald-500" : "bg-primary"
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className={cn("flex size-5 items-center justify-center rounded", streak > 0 ? "text-amber-500" : "")}>
            <FlameIcon size={13} className={streak > 0 ? "animate-pulse" : ""} />
          </span>
          <span className="tabular-nums font-semibold text-foreground">{streak}d</span> streak
        </div>

        <div className="text-[11px] text-muted-foreground font-mono">
          @{profile.codeforcesHandle}
        </div>
      </div>
    </GlassCard>
  )
}
