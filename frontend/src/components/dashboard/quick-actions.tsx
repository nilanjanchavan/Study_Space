"use client"

import { useRouter } from "next/navigation"
import { SectionHeader } from "@/components/design-system/layout"
import { PlayIcon, FocusIcon, PlusIcon, BarChart3Icon, SettingsIcon, MusicIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickActionItem {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color: string
  bgColor: string
}

export function QuickActions() {
  const router = useRouter()

  const actions: QuickActionItem[] = [
    {
      icon: <PlayIcon size={18} />,
      label: "Start Pomodoro",
      onClick: () => router.push("/pomodoro"),
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: <FocusIcon size={18} />,
      label: "Start Focus",
      onClick: () => router.push("/focus"),
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <PlusIcon size={18} />,
      label: "New Todo",
      onClick: () => router.push("/todos"),
      color: "text-green-500 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <BarChart3Icon size={18} />,
      label: "Analytics",
      onClick: () => router.push("/analytics"),
      color: "text-violet-500 dark:text-violet-400",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: <SettingsIcon size={18} />,
      label: "Settings",
      onClick: () => router.push("/settings"),
      color: "text-muted-foreground",
      bgColor: "bg-muted/40",
    },
    {
      icon: <MusicIcon size={18} />,
      label: "Music",
      onClick: () => router.push("/settings?tab=music"),
      color: "text-rose-500 dark:text-rose-400",
      bgColor: "bg-rose-500/10",
    },
  ]

  return (
    <div className="space-y-3">
      <SectionHeader title="Quick Actions" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl p-3 transition-all duration-200",
              "hover:shadow-medium hover:-translate-y-0.5 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              "bg-card border border-border/60 shadow-soft"
            )}
          >
            <span className="text-[11px] font-medium text-foreground text-center leading-tight">{action.label}</span>
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", action.bgColor)}>
              <span className={action.color}>{action.icon}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
