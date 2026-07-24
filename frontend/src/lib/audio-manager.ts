import { toast } from "sonner"

const SOUND_SOURCES: Record<string, string> = {
  WORK: "/sounds/notification.mp3",
  SHORT_BREAK: "/sounds/bell.mp3",
  LONG_BREAK: "/sounds/forest.mp3",
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
  WORK_END: "/sounds/notification.mp3",
  SHORT_BREAK_START: "/sounds/bell.mp3",
  SHORT_BREAK_END: "/sounds/bell.mp3",
  LONG_BREAK_START: "/sounds/forest.mp3",
  LONG_BREAK_END: "/sounds/forest.mp3",
  FOCUS_COMPLETE: "/sounds/digital.mp3",
  FOCUS_ABANDON: "/sounds/bell.mp3",
  STRICT_FAIL: "/sounds/notification.mp3",
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
    ]
    instance.preload([...new Set(allSounds)])
  }
  return instance
}

export const COMPLETION_SOUNDS: Record<string, string> = SOUND_SOURCES
