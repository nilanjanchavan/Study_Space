import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendIndicatorProps {
  value: number
  label?: string
  className?: string
}

export function TrendIndicator({ value, label, className }: TrendIndicatorProps) {
  const isPositive = value > 0
  const isNegative = value < 0
  const isNeutral = value === 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isPositive && "text-emerald-600 dark:text-emerald-400",
        isNegative && "text-rose-600 dark:text-rose-400",
        isNeutral && "text-muted-foreground",
        className,
      )}
    >
      {isPositive ? (
        <TrendingUp size={14} />
      ) : isNegative ? (
        <TrendingDown size={14} />
      ) : (
        <Minus size={14} />
      )}
      {isPositive && "+"}
      {value}%
      {label && <span className="text-muted-foreground font-normal ml-0.5">{label}</span>}
    </span>
  )
}
