"use client"

import { CodeforcesProfile } from "@/services/codeforces"
import { getCfTier } from "./cf-tier-utils"
import { GlassCard } from "@/components/design-system/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLinkIcon, RefreshCwIcon, TrophyIcon, FlameIcon, CheckCircle2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CfHeaderProps {
  profile: CodeforcesProfile
  onSync: () => void
  isSyncing: boolean
}

export function CfHeader({ profile, onSync, isSyncing }: CfHeaderProps) {
  const tier = getCfTier(profile.rating)
  const maxTier = getCfTier(profile.maxRating)

  const initials = profile.codeforcesHandle.slice(0, 2).toUpperCase()

  return (
    <GlassCard className="p-5 sm:p-6 border-border/60 bg-gradient-to-br from-card/80 to-card/40 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar className={cn("size-14 sm:size-16 ring-2 ring-offset-2 ring-offset-background", tier.borderClass)}>
            {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.codeforcesHandle} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={cn("text-xl sm:text-2xl font-bold tracking-tight", tier.textClass)}>
                {profile.codeforcesHandle}
              </h2>
              <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5", tier.badgeClass)}>
                {profile.rank ?? tier.name}
              </Badge>
              <a
                href={`https://codeforces.com/profile/${profile.codeforcesHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="View on Codeforces"
              >
                <ExternalLinkIcon size={14} />
              </a>
            </div>

            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
                <CheckCircle2Icon size={12} /> Connected
              </span>
              <span>•</span>
              <span>
                {profile.lastSyncedAt
                  ? `Synced ${new Date(profile.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Never synced"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onSync}
            disabled={isSyncing}
            className="gap-2 h-9 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5"
          >
            <RefreshCwIcon size={13} className={isSyncing ? "animate-spin text-primary" : ""} />
            <span>{isSyncing ? "Syncing..." : "Sync Profile"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-border/40">
        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Current Rating</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn("text-xl sm:text-2xl font-bold tabular-nums", tier.textClass)}>
              {profile.rating ?? "—"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Max Rating</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn("text-xl sm:text-2xl font-bold tabular-nums", maxTier.textClass)}>
              {profile.maxRating ?? "—"}
            </span>
            {profile.maxRank && (
              <span className="text-[11px] text-muted-foreground truncate font-medium">
                ({profile.maxRank})
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Solved</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
              {profile.stats?.totalSolved ?? 0}
            </span>
            <span className="text-xs text-muted-foreground">problems</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Contribution</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn("text-xl sm:text-2xl font-bold tabular-nums", (profile.contribution ?? 0) >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {(profile.contribution ?? 0) > 0 ? `+${profile.contribution}` : (profile.contribution ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
