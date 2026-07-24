// ───────────────────────────────────────────────────────────────────────────
// Settings Storage — localStorage persistence for UI preferences
//
// Each settings domain has its own storage key and defaults.
// Functions are safe to call on the server (return defaults).
//
// Pomodoro settings share the same localStorage key as the existing
// pomodoro-settings module so that changes in the Settings page are
// immediately reflected in the focus-cycle and pomodoro views.
// ───────────────────────────────────────────────────────────────────────────

import {
  loadPomodoroSettings as _loadPomodoro,
  savePomodoroSettings as _savePomodoro,
  type PomodoroSettings as BasePomodoroSettings,
} from "@/lib/pomodoro-settings"

// ── Pomodoro Settings (extends base with dailyGoal) ────────────────────────

export interface PomodoroSettings extends BasePomodoroSettings {
  dailyGoal: number
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  dailyGoal: 8,
}

export function loadPomodoroSettings(): PomodoroSettings {
  const base = _loadPomodoro()
  if (typeof window === "undefined") return DEFAULT_POMODORO_SETTINGS
  const raw = localStorage.getItem("pomodoro-daily-goal")
  const dailyGoal = raw ? Number(raw) : DEFAULT_POMODORO_SETTINGS.dailyGoal
  return { ...base, dailyGoal: isNaN(dailyGoal) ? DEFAULT_POMODORO_SETTINGS.dailyGoal : dailyGoal }
}

export function savePomodoroSettings(s: PomodoroSettings): void {
  _savePomodoro(s)
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("pomodoro-daily-goal", String(s.dailyGoal))
  } catch { /* ignore */ }
}

// ── Notification Settings ──────────────────────────────────────────────────

const NOTIFICATION_KEY = "settings-notifications"

export interface NotificationSettings {
  browserNotifications: boolean
  soundEnabled: boolean
  volume: number
  notificationSound: string
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  browserNotifications: true,
  soundEnabled: true,
  volume: 75,
  notificationSound: "notification",
}

// ── Music Settings ─────────────────────────────────────────────────────────

const MUSIC_KEY = "settings-music"

export interface MusicSettings {
  defaultTrack: string
  autoPlayDuringWork: boolean
  autoStopDuringBreaks: boolean
  volume: number
}

export const DEFAULT_MUSIC_SETTINGS: MusicSettings = {
  defaultTrack: "none",
  autoPlayDuringWork: false,
  autoStopDuringBreaks: false,
  volume: 50,
}

// ── Focus Settings ─────────────────────────────────────────────────────────

const FOCUS_KEY = "settings-focus"

export interface FocusSettings {
  defaultStrictMode: boolean
  motivationalQuotes: boolean
  celebrationAnimation: boolean
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  defaultStrictMode: false,
  motivationalQuotes: true,
  celebrationAnimation: true,
}

// ── Appearance Settings ────────────────────────────────────────────────────

const APPEARANCE_KEY = "settings-appearance"

export interface AppearanceSettings {
  theme: "system" | "light" | "dark"
  accentColor: string
}

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: "system",
  accentColor: "blue",
}

// ── Codeforces Settings ────────────────────────────────────────────────────

const CODEFORCES_KEY = "settings-codeforces"

export interface CodeforcesSettings {
  autoSync: boolean
}

export const DEFAULT_CODEFORCES_SETTINGS: CodeforcesSettings = {
  autoSync: false,
}

// ── Generic localStorage helpers ───────────────────────────────────────────

function load<T>(key: string, defaults: T): T {
  if (typeof window === "undefined") return defaults
  const raw = localStorage.getItem(key)
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) } as T
  } catch {
    return defaults
  }
}

function save<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* quota exceeded — ignore */ }
}

// ── Exported load/save per domain ──────────────────────────────────────────

export const loadNotificationSettings = () => load(NOTIFICATION_KEY, DEFAULT_NOTIFICATION_SETTINGS)
export const saveNotificationSettings = (s: NotificationSettings) => save(NOTIFICATION_KEY, s)

export const loadMusicSettings = () => load(MUSIC_KEY, DEFAULT_MUSIC_SETTINGS)
export const saveMusicSettings = (s: MusicSettings) => save(MUSIC_KEY, s)

export const loadFocusSettings = () => load(FOCUS_KEY, DEFAULT_FOCUS_SETTINGS)
export const saveFocusSettings = (s: FocusSettings) => save(FOCUS_KEY, s)

export const loadAppearanceSettings = () => load(APPEARANCE_KEY, DEFAULT_APPEARANCE_SETTINGS)
export const saveAppearanceSettings = (s: AppearanceSettings) => save(APPEARANCE_KEY, s)

export const loadCodeforcesSettings = () => load(CODEFORCES_KEY, DEFAULT_CODEFORCES_SETTINGS)
export const saveCodeforcesSettings = (s: CodeforcesSettings) => save(CODEFORCES_KEY, s)
