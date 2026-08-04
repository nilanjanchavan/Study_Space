"use client"

import { FloatingCard } from "@/components/design-system/floating-card"
import { TargetIcon, CoffeeIcon, PartyPopperIcon, ShieldAlertIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type FocusStatus = "WORKING" | "BREAK" | "COMPLETE" | "STRICT_FAIL"

interface DeepFocusStatusProps {
  status: FocusStatus
  phase?: string
  goal?: string | null
}

const STATUS_CONFIG: Record<FocusStatus, {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle: string
  gradient: string
  iconColor: string
}> = {
  WORKING: {
    icon: TargetIcon,
    title: "Deep Focus Active",
    subtitle: "Stay in the zone",
    gradient: "from-primary/10 to-primary/5",
    iconColor: "text-primary",
  },
  BREAK: {
    icon: CoffeeIcon,
    title: "Break Time",
    subtitle: "Recharge and refocus",
    gradient: "from-emerald-500/10 to-emerald-500/5 dark:from-emerald-400/10 dark:to-emerald-400/5",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  COMPLETE: {
    icon: PartyPopperIcon,
    title: "Session Complete",
    subtitle: "Great work!",
    gradient: "from-amber-500/10 to-amber-500/5 dark:from-amber-400/10 dark:to-amber-400/5",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  STRICT_FAIL: {
    icon: ShieldAlertIcon,
    title: "Session Failed",
    subtitle: "Strict mode violation",
    gradient: "from-destructive/10 to-destructive/5",
    iconColor: "text-destructive",
  },
}

export function DeepFocusStatus({ status, phase, goal }: DeepFocusStatusProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <FloatingCard className={cn("p-4 bg-gradient-to-br", config.gradient)}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "flex size-12 items-center justify-center rounded-2xl",
          status === "WORKING" && "bg-primary/10",
          status === "BREAK" && "bg-emerald-500/10",
          status === "COMPLETE" && "bg-amber-500/10",
          status === "STRICT_FAIL" && "bg-destructive/10"
        )}>
          <Icon size={24} className={config.iconColor} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-foreground">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          {phase && (
            <p className="text-xs text-muted-foreground/60 mt-0.5">Current phase: {phase}</p>
          )}
        </div>
      </div>
      {goal && (
        <div className="mt-3 rounded-lg bg-background/50 px-3 py-2">
          <p className="text-sm text-foreground/80 truncate">&ldquo;{goal}&rdquo;</p>
        </div>
      )}
    </FloatingCard>
  )
}
