"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_META: Record<string, { title: string; description?: string; dot: string }> = {
  "/dashboard": { title: "Dashboard", description: "Your day at a glance", dot: "bg-indigo-500" },
  "/todos": { title: "Todos", description: "Manage your tasks", dot: "bg-emerald-500" },
  "/pomodoro": { title: "Pomodoro", description: "Focus timer", dot: "bg-rose-500" },
  "/focus": { title: "Focus", description: "Deep focus sessions", dot: "bg-violet-500" },
  "/analytics": { title: "Analytics", description: "Your productivity insights", dot: "bg-amber-500" },
  "/settings": { title: "Settings", description: "Customize your workspace", dot: "bg-slate-500" },
}

function useCurrentTime() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      )
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [])

  return time
}

function usePageMeta(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname]
  const segment = pathname.split("/").filter(Boolean).pop()
  if (segment) {
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    return { title: label, description: undefined, dot: "bg-primary" }
  }
  return { title: "Study Workspace", description: undefined, dot: "bg-primary" }
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { title, description, dot } = usePageMeta(pathname)
  const time = useCurrentTime()

  return (
    <header className="relative z-10 flex h-14 shrink-0 items-center gap-3 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onMenuClick}
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("size-1.5 shrink-0 rounded-full shadow-[0_0_8px_currentColor]", dot)} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground/70 sm:block">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="numeric mr-1 hidden text-xs text-muted-foreground/50 sm:block">
          {time}
        </span>
        <UserMenu />
      </div>
    </header>
  )
}
