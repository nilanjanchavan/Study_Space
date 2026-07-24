"use client"

import { useState, useCallback, useEffect } from "react"
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  loadMusicSettings,
  saveMusicSettings,
  loadFocusSettings,
  saveFocusSettings,
  loadAppearanceSettings,
  saveAppearanceSettings,
  loadCodeforcesSettings,
  saveCodeforcesSettings,
} from "@/lib/settings-storage"

// ── Generic localStorage hook ──────────────────────────────────────────────

const INTRA_TAB_EVENT = "studyworkspace:storage-change"

function useLocalStorage<T>(
  key: string,
  loader: () => T,
  saver: (v: T) => void,
): [T, (partial: Partial<T> | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(loader)

  // Sync across tabs (browser StorageEvent) AND within same tab (custom event)
  useEffect(() => {
    const handleBrowserStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue) as T)
        } catch { /* ignore */ }
      }
    }

    const handleIntraTabStorage = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string; value: T }>).detail
      if (detail.key === key) {
        setValue(detail.value)
      }
    }

    window.addEventListener("storage", handleBrowserStorage)
    window.addEventListener(INTRA_TAB_EVENT, handleIntraTabStorage)
    return () => {
      window.removeEventListener("storage", handleBrowserStorage)
      window.removeEventListener(INTRA_TAB_EVENT, handleIntraTabStorage)
    }
  }, [key])

  const update = useCallback(
    (partial: Partial<T> | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof partial === "function" ? partial(prev) : { ...prev, ...partial }
        saver(next)
        // Broadcast to other useLocalStorage instances in the same tab
        window.dispatchEvent(
          new CustomEvent(INTRA_TAB_EVENT, { detail: { key, value: next } }),
        )
        return next
      })
    },
    [saver, key],
  )

  return [value, update]
}

// ── Domain hooks ───────────────────────────────────────────────────────────

export function usePomodoroSettings() {
  return useLocalStorage("settings-pomodoro", loadPomodoroSettings, savePomodoroSettings)
}

export function useNotificationSettings() {
  return useLocalStorage("settings-notifications", loadNotificationSettings, saveNotificationSettings)
}

export function useMusicSettings() {
  return useLocalStorage("settings-music", loadMusicSettings, saveMusicSettings)
}

export function useFocusSettings() {
  return useLocalStorage("settings-focus", loadFocusSettings, saveFocusSettings)
}

export function useAppearanceSettings() {
  return useLocalStorage("settings-appearance", loadAppearanceSettings, saveAppearanceSettings)
}

export function useCodeforcesSettings() {
  return useLocalStorage("settings-codeforces", loadCodeforcesSettings, saveCodeforcesSettings)
}
