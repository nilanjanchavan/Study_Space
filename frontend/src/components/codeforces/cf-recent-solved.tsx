"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2Icon, ExternalLinkIcon, Code2Icon } from "lucide-react"

interface CfRecentSolvedProps {
  problems: Array<{
    id: string
    name: string
    contestId: number
    index: string
    rating: number | null
    tags: string[]
    solvedAt: number
  }> | undefined
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000)
  if (diffSec < 60) return "just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "yesterday"
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function CfRecentSolved({ problems = [] }: CfRecentSolvedProps) {
  return (
    <GlassCard className="p-5 border-border/60">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Code2Icon size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recently Solved Questions</h3>
          <p className="text-xs text-muted-foreground">Latest verified submissions</p>
        </div>
      </div>

      {problems.length === 0 ? (
        <div className="flex h-36 items-center justify-center text-sm text-muted-foreground/60">
          No recently solved problems found
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border/40 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {problems.map((prob) => {
            const url = `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`

            return (
              <div
                key={prob.id}
                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group hover:bg-card/40 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex items-start sm:items-center gap-2.5">
                  <span className="text-emerald-500 mt-0.5 sm:mt-0 shrink-0">
                    <CheckCircle2Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate inline-flex items-center gap-1 group-hover:underline"
                      >
                        <span className="font-mono text-xs text-muted-foreground shrink-0 font-medium">
                          {prob.contestId}{prob.index}
                        </span>
                        <span className="truncate">{prob.name}</span>
                        <ExternalLinkIcon size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>

                      {prob.rating !== null && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold font-mono px-1.5 py-0 h-4 bg-muted/80 text-foreground border-border/50 shrink-0"
                        >
                          ★ {prob.rating}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {prob.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded border border-border/30"
                        >
                          {tag}
                        </span>
                      ))}
                      {prob.tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{prob.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground tabular-nums shrink-0 self-end sm:self-center">
                  {formatTimeAgo(prob.solvedAt)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlassCard>
  )
}
