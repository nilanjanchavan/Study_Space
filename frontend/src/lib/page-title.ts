const SITE_TITLE = "Study Workspace"
let titleAnimationFrame: ReturnType<typeof requestAnimationFrame> | null = null
let visibilityHandler: (() => void) | null = null
let flashAnimationFrame: ReturnType<typeof requestAnimationFrame> | null = null

function formatTimerTitle(remainingMs: number, type: string): string {
  const totalSeconds = Math.ceil(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const time = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  const label = type === "WORK" ? "Focus" : type === "SHORT_BREAK" ? "Break" : "Long Break"
  return `${time} \u2022 ${label}`
}

function computeRemainingMs(
  session: { startedAt: string; accumulatedPausedMs: number; pausedAt: string | null; plannedMinutes: number; status: string },
  now: number
): number {
  const startedMs = new Date(session.startedAt).getTime()
  let pausedMs = session.accumulatedPausedMs
  if (session.status === "PAUSED" && session.pausedAt) {
    pausedMs += now - new Date(session.pausedAt).getTime()
  }
  const elapsed = session.status === "PAUSED" && session.pausedAt
    ? new Date(session.pausedAt).getTime() - startedMs - session.accumulatedPausedMs
    : now - startedMs - pausedMs
  return Math.max(0, session.plannedMinutes * 60 * 1000 - elapsed)
}

export function startTitleTimer(
  session: { type: string; startedAt: string; accumulatedPausedMs: number; pausedAt: string | null; plannedMinutes: number; status: string },
): () => void {
  stopTitleTimer()

  let lastSecond = -1

  const update = () => {
    const now = Date.now()
    const remaining = computeRemainingMs(session, now)
    const currentSecond = Math.ceil(remaining / 1000)
    if (currentSecond !== lastSecond) {
      lastSecond = currentSecond
      document.title = formatTimerTitle(remaining, session.type)
    }
  }

  const tick = () => {
    update()
    titleAnimationFrame = requestAnimationFrame(tick)
  }

  titleAnimationFrame = requestAnimationFrame(tick)

  visibilityHandler = () => {
    if (document.visibilityState === "visible") {
      update()
    }
  }
  document.addEventListener("visibilitychange", visibilityHandler)

  return stopTitleTimer
}

export function stopTitleTimer(): void {
  if (titleAnimationFrame) {
    cancelAnimationFrame(titleAnimationFrame)
    titleAnimationFrame = null
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler)
    visibilityHandler = null
  }
}

export function startTitleFlash(): void {
  stopTitleFlash()
  let visible = true
  let lastToggleSecond = -1

  const tick = () => {
    const now = Date.now()
    const currentSecond = Math.floor(now / 1000)
    if (currentSecond !== lastToggleSecond) {
      lastToggleSecond = currentSecond
      document.title = visible ? "\uD83C\uDF45 Time\u2019s Up!" : SITE_TITLE
      visible = !visible
    }
    flashAnimationFrame = requestAnimationFrame(tick)
  }

  flashAnimationFrame = requestAnimationFrame(tick)
}

export function stopTitleFlash(): void {
  if (flashAnimationFrame) {
    cancelAnimationFrame(flashAnimationFrame)
    flashAnimationFrame = null
  }
}

export function restoreTitle(): void {
  stopTitleFlash()
  stopTitleTimer()
  document.title = SITE_TITLE
}
