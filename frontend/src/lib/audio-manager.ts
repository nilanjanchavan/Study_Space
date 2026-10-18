import { toast } from "sonner"

// Alarm sounds per pomodoro event (2-second clips)
const SOUND_SOURCES: Record<string, string> = {
  WORK: "/sounds/digital.mp3",         // session complete → digital beep
  SHORT_BREAK: "/sounds/bell.mp3",    // break complete → bell
  LONG_BREAK: "/sounds/bell.mp3",     // long break complete → bell
}

export type FocusSoundEvent =
  | "WORK_START"
  | "WORK_END"
  | "SHORT_BREAK_START"
  | "SHORT_BREAK_END"
  | "LONG_BREAK_START"
  | "LONG_BREAK_END"
  | "FOCUS_COMPLETE"
  | "FOCUS_ABANDON"
  | "STRICT_FAIL"

export const FOCUS_EVENT_SOUNDS: Record<FocusSoundEvent, string> = {
  WORK_START: "/sounds/notification.mp3",
  WORK_END: "/sounds/digital.mp3",
  SHORT_BREAK_START: "/sounds/bell.mp3",
  SHORT_BREAK_END: "/sounds/bell.mp3",
  LONG_BREAK_START: "/sounds/bell.mp3",
  LONG_BREAK_END: "/sounds/bell.mp3",
  FOCUS_COMPLETE: "/sounds/digital.mp3",
  FOCUS_ABANDON: "/sounds/bell.mp3",
  STRICT_FAIL: "/sounds/notification.mp3",
}

// Alarm sounds for pomodoro start/transition events (2-second alarm)
export const POMODORO_ALARM_SOUNDS: Record<string, string> = {
  SESSION_COMPLETE: "/sounds/digital.mp3",   // session/break finishes
  SESSION_START: "/sounds/notification.mp3", // new session begins
  BREAK_END: "/sounds/bell.mp3",             // break ends → back to work
}

class AudioManager {
  private pool: Map<string, HTMLAudioElement> = new Map()
  private activeSound: HTMLAudioElement | null = null
  private userInteracted = false
  private interactionHandler: (() => void) | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.interactionHandler = () => {
        this.userInteracted = true
        if (this.interactionHandler) {
          document.removeEventListener("click", this.interactionHandler)
          this.interactionHandler = null
        }
      }
      document.addEventListener("click", this.interactionHandler)
    }
  }

  preload(sources: string[]): void {
    if (typeof Audio === "undefined") return
    for (const src of sources) {
      if (!this.pool.has(src)) {
        const audio = new Audio(src)
        audio.preload = "auto"
        audio.load()
        this.pool.set(src, audio)
      }
    }
  }

  play(src: string): void {
    if (typeof Audio === "undefined") return
    this.stop()

    let audio = this.pool.get(src)
    if (!audio) {
      audio = new Audio(src)
      audio.preload = "auto"
      this.pool.set(src, audio)
    }

    audio.currentTime = 0
    this.activeSound = audio
    audio.play().catch(() => {
      if (!this.userInteracted) {
        toast.info("Sound blocked", {
          description: "Click anywhere to enable notification sounds.",
          duration: 5000,
        })
      }
    })
  }

  playSynthChime(): void {
    if (typeof window === "undefined") return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {})
      }
      const tones = [587.33, 880, 1174.66] // D5, A5, D6 cheerful chime
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18)
        gain.gain.setValueAtTime(0.35, ctx.currentTime + idx * 0.18)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.5)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(ctx.currentTime + idx * 0.18)
        osc.stop(ctx.currentTime + idx * 0.18 + 0.55)
      })
    } catch {
      // AudioContext not supported
    }
  }

  /**
   * Play an alarm sound for exactly 2 seconds then auto-stop.
   * Plays the audio element and synthetic chime to ensure sound plays even if audio fails.
   */
  playAlarm(src: string): void {
    if (typeof Audio === "undefined") return
    this.stop()

    // Always trigger synthetic chime as reliable guarantee
    this.playSynthChime()

    let audio = this.pool.get(src)
    if (!audio) {
      audio = new Audio(src)
      audio.preload = "auto"
      this.pool.set(src, audio)
    }

    audio.currentTime = 0
    audio.loop = false
    this.activeSound = audio

    const timer = setTimeout(() => {
      audio!.pause()
      audio!.currentTime = 0
    }, 2500)

    audio.play().catch(() => {
      clearTimeout(timer)
      if (!this.userInteracted) {
        toast.info("Sound blocked", {
          description: "Click anywhere to enable alarm sounds.",
          duration: 4000,
        })
      }
    })
  }

  stop(): void {
    if (this.activeSound) {
      this.activeSound.pause()
      this.activeSound.currentTime = 0
      this.activeSound = null
    }
  }

  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume))
    for (const audio of this.pool.values()) {
      audio.volume = clamped
    }
  }
}

let instance: AudioManager | null = null

export function getAudioManager(): AudioManager {
  if (!instance) {
    instance = new AudioManager()
    const allSounds = [
      ...Object.values(SOUND_SOURCES),
      ...Object.values(FOCUS_EVENT_SOUNDS),
      ...Object.values(POMODORO_ALARM_SOUNDS),
    ]
    instance.preload([...new Set(allSounds)])
  }
  return instance
}

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {})
  }
}

export function notifyPomodoroComplete(type: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return
  if (Notification.permission === "granted") {
    try {
      const isWork = type === "WORK"
      const title = isWork ? "🍅 Focus Session Complete!" : "☕ Break Finished!"
      const body = isWork
        ? "Great work! Time to step back and take a break."
        : "Break is over. Ready to focus again?"
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        tag: "pomodoro-complete",
      })
    } catch {
      // Notification failed
    }
  }
}

export const COMPLETION_SOUNDS: Record<string, string> = SOUND_SOURCES
