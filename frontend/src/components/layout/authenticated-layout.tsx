"use client"

import { type ReactNode, useState } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

export function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r">
        <div className="flex h-14 items-center border-b px-5">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            Study Workspace
          </span>
        </div>
        <Sidebar className="flex-1 overflow-y-auto py-2" />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-14 items-center border-b px-5">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Study Workspace
            </span>
          </div>
          <Sidebar onNavClick={() => setMobileOpen(false)} className="py-2" />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
