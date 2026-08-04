"use client"

import { type ReactNode, useState } from "react"
import { useCurrentFocus } from "@/hooks/use-focus"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { FocusGuard } from "@/components/focus/focus-guard"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data } = useCurrentFocus()
  const focusSession = data?.data.session ?? null
  const focusActive = !!(focusSession && (focusSession.status === "RUNNING" || focusSession.status === "PAUSED"))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop floating sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0 p-3 py-4">
        <div className="flex flex-1 flex-col rounded-2xl bg-card shadow-[0_1px_3px_oklch(0_0_0/0.04)] ring-1 ring-foreground/[0.04] dark:shadow-none dark:ring-white/[0.06] overflow-hidden">
          <div className="flex h-12 items-center px-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold tracking-tight">
                SW
              </div>
              <span className="text-sm font-semibold text-foreground tracking-tight">
                Study Workspace
              </span>
            </div>
          </div>
          <Sidebar className="flex-1 overflow-y-auto px-2.5 pb-3 pt-1" focusActive={focusActive} />
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-card">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-12 items-center px-4 border-b">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold tracking-tight">
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
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          <FocusGuard focusSession={focusSession}>
            {children}
          </FocusGuard>
        </main>
      </div>
    </div>
  )
}
