"use client"

import { type ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import { useCurrentFocus } from "@/hooks/use-focus"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { FocusGuard } from "@/components/focus/focus-guard"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const MODULE_TINTS: Record<string, string> = {
  "/dashboard": "module-indigo",
  "/todos": "module-emerald",
  "/pomodoro": "module-rose",
  "/focus": "module-violet",
  "/analytics": "module-amber",
  "/settings": "module-slate",
}

function useModuleTint(pathname: string): string {
  if (MODULE_TINTS[pathname]) return MODULE_TINTS[pathname]
  const segment = "/" + pathname.split("/").filter(Boolean)[0]
  return MODULE_TINTS[segment] ?? "module-indigo"
}

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const moduleTint = useModuleTint(pathname)
  const { data } = useCurrentFocus()
  const focusSession = data?.data.session ?? null
  const focusActive = !!(focusSession && (focusSession.status === "RUNNING" || focusSession.status === "PAUSED"))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop floating sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0 p-3 py-4">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-black/[0.04] bg-card/85 shadow-soft ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-white/[0.06] dark:bg-card/70 dark:ring-white/[0.06]">
          <div className="flex h-12 items-center px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[0.6rem] bg-gradient-to-br from-primary via-[color-mix(in_oklch,var(--primary),var(--ring)_30%)] to-ring text-primary-foreground text-[11px] font-semibold tracking-tight shadow-soft">
                SW
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Study Workspace
              </span>
            </div>
          </div>
          <Sidebar className="flex-1 overflow-y-auto px-2.5 pb-3 pt-1" focusActive={focusActive} />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-12 items-center px-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[0.6rem] bg-gradient-to-br from-primary via-[color-mix(in_oklch,var(--primary),var(--ring)_30%)] to-ring text-primary-foreground text-[11px] font-semibold tracking-tight">
                SW
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Study Workspace
              </span>
            </div>
          </div>
          <Sidebar onNavClick={() => setMobileOpen(false)} className="px-2.5 py-3" focusActive={focusActive} />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Module-tinted ambient backdrop */}
        <div aria-hidden className={cn("page-ambient pointer-events-none absolute inset-0", moduleTint)} />
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="premium-scrollbar relative flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <FocusGuard focusSession={focusSession}>
            {children}
          </FocusGuard>
        </main>
      </div>
    </div>
  )
}
