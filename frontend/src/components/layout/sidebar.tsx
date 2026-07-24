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
  icon: React.ComponentType<{ size?: number }>
  disabled?: boolean
}

const baseNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Todos", href: "/todos", icon: CheckSquare },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer },
  { label: "Focus", href: "/focus", icon: Focus},
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
    <nav className={cn("flex flex-col gap-1 px-3 py-2", className)}>
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
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50 cursor-default"
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-[10px] font-medium text-muted-foreground/40 border border-border/50 rounded px-1.5 py-0.5">
                Soon
              </span>
            </div>
          )
        }

        if (isLocked) {
          return (
            <div
              key={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/40 cursor-not-allowed"
              title="Unavailable during focus session"
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-[10px] font-medium text-muted-foreground/30 border border-border/30 rounded px-1.5 py-0.5">
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
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon size={18} />
            <span className="truncate">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
