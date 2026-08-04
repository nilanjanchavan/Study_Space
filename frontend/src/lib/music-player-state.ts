const STORAGE_KEY = "music-player-state"

export interface MusicPlayerState {
  lastTrackId: string
  volume: number
  isPlaying: boolean
  loop: boolean
}

const DEFAULTS: MusicPlayerState = {
  lastTrackId: "",
  volume: 50,
  isPlaying: false,
  loop: true,
}

export function loadMusicPlayerState(): MusicPlayerState {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

export function saveMusicPlayerState(state: MusicPlayerState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded */ }
}
