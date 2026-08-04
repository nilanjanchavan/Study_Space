"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"

const PAGE_META: Record<string, { title: string; description?: string }> = {
  "/dashboard": { title: "Dashboard" },
  "/todos": { title: "Todos", description: "Manage your tasks" },
  "/pomodoro": { title: "Pomodoro", description: "Focus timer" },
  "/focus": { title: "Focus", description: "Deep focus sessions" },
  "/analytics": { title: "Analytics", description: "Your productivity insights" },
  "/settings": { title: "Settings", description: "Customize your workspace" },
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
    return { title: label }
  }
  return { title: "Study Workspace" }
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { title, description } = usePageMeta(pathname)
  const time = useCurrentTime()

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4 lg:px-6">
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
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground truncate tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground/70 truncate hidden sm:block">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-xs text-muted-foreground/50 tabular-nums hidden sm:block mr-1">
          {time}
        </span>
        <UserMenu />
      </div>
    </header>
  )
}
