"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Badge } from "@/components/ui/badge"
import { CalendarDaysIcon, ClockIcon, ExternalLinkIcon, TimerIcon } from "lucide-react"

interface CfUpcomingContestsProps {
  contests: Array<{
    id: number
    name: string
    durationSeconds: number
    startTimeSeconds: number
  }> | undefined
}

function formatCountdown(startTimeSeconds: number): string {
  const diffSec = startTimeSeconds - Math.floor(Date.now() / 1000)
  if (diffSec <= 0) return "Starting soon / Running"

  const days = Math.floor(diffSec / 86400)
  const hours = Math.floor((diffSec % 86400) / 3600)
  const mins = Math.floor((diffSec % 3600) / 60)

  if (days > 0) return `in ${days}d ${hours}h`
  if (hours > 0) return `in ${hours}h ${mins}m`
  return `in ${mins}m`
}

function formatDuration(sec: number): string {
  const hours = Math.floor(sec / 3600)
  const mins = Math.floor((sec % 3600) / 60)
  if (mins === 0) return `${hours} hrs`
  return `${hours}h ${mins}m`
}

export function CfUpcomingContests({ contests = [] }: CfUpcomingContestsProps) {
  return (
    <GlassCard className="p-5 border-border/60">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TimerIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Upcoming Contests</h3>
            <p className="text-xs text-muted-foreground">Official Codeforces rounds</p>
          </div>
        </div>

        <a
          href="https://codeforces.com/contests"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
        >
          View all rounds <ExternalLinkIcon size={11} />
        </a>
      </div>

      {contests.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-sm text-muted-foreground/60">
          No upcoming contests scheduled right now
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/40">
          {contests.map((contest) => {
            const startDate = new Date(contest.startTimeSeconds * 1000)
            const dateStr = startDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })
            const timeStr = startDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })

            return (
              <div
                key={contest.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-card/40 px-2 rounded-lg transition-colors group"
              >
                <div className="min-w-0">
                  <a
                    href={`https://codeforces.com/contestRegistration/${contest.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate block group-hover:underline"
                  >
                    {contest.name}
                  </a>

                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDaysIcon size={12} /> {dateStr} at {timeStr}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={12} /> {formatDuration(contest.durationSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                    {formatCountdown(contest.startTimeSeconds)}
                  </Badge>
                  <a
                    href={`https://codeforces.com/contestRegistration/${contest.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground border border-border/60 hover:border-border rounded-lg px-2.5 py-1 transition-colors"
                  >
                    Register
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
