"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  Focus,
  BarChart3,
  Settings,
} from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  disabled?: boolean
}

const baseNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Todos", href: "/todos", icon: CheckSquare },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer },
  { label: "Focus", href: "/focus", icon: Focus },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
]

const FOCUS_LOCKED_ROUTES = ["/dashboard", "/todos", "/analytics", "/settings"]

interface SidebarProps {
  className?: string
  onNavClick?: () => void
  focusActive?: boolean
}

export function Sidebar({ className, onNavClick, focusActive }: SidebarProps) {
  const pathname = usePathname()

  const navItems = baseNavItems.map((item) => ({
    ...item,
    disabled: item.disabled || (focusActive === true && FOCUS_LOCKED_ROUTES.includes(item.href)),
  }))

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))
        const Icon = item.icon
        const isLocked = focusActive === true && FOCUS_LOCKED_ROUTES.includes(item.href)

        if (item.disabled && !isLocked) {
          return (
            <div
              key={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/40 cursor-default select-none"
            >
              <Icon size={16} className="shrink-0 opacity-40" />
              <span className="truncate flex-1">{item.label}</span>
              <span className="text-[10px] font-medium text-muted-foreground/30 border border-border/40 rounded-md px-1.5 py-0.5">
                Soon
              </span>
            </div>
          )
        }

        if (isLocked) {
          return (
            <div
              key={item.href}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/30 cursor-not-allowed select-none"
              title="Unavailable during focus session"
            >
              <Icon size={16} className="shrink-0 opacity-30" />
              <span className="truncate flex-1">{item.label}</span>
              <span className="text-[10px] font-medium text-muted-foreground/20 border border-border/20 rounded-md px-1.5 py-0.5">
                Locked
              </span>
            </div>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-primary/[0.08] text-primary dark:bg-primary/[0.12] dark:text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon
              size={16}
              className={cn(
                "shrink-0 transition-colors duration-150",
                isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground/80"
              )}
            />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
