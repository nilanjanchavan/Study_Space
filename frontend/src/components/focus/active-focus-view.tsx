"use client"

import { FocusWorkspace } from "./focus-workspace"
import type { FocusSessionItem } from "@/types"

interface ActiveFocusViewProps {
  session: FocusSessionItem
  startNewSession?: () => void
}

export function ActiveFocusView({ session, startNewSession }: ActiveFocusViewProps) {
  return <FocusWorkspace session={session} startNewSession={startNewSession} />
}
