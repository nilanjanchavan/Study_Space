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

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Todos", href: "/todos", icon: CheckSquare },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer, disabled: true },
  { label: "Focus", href: "/focus", icon: Focus, disabled: true },
  { label: "Analytics", href: "/analytics", icon: BarChart3, disabled: true },
  { label: "Settings", href: "/settings", icon: Settings, disabled: true },
]

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-1 px-3 py-2", className)}>
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href))
        const Icon = item.icon

        if (item.disabled) {
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
