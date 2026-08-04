"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react"
import { getTrackById, type Track } from "@/lib/tracks"
import {
  loadMusicPlayerState,
  saveMusicPlayerState,
  type MusicPlayerState,
} from "@/lib/music-player-state"

interface MusicContextValue {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  loop: boolean
  currentTime: number
  duration: number
  isLoading: boolean
  play: (trackId: string) => void
  pause: () => void
  resume: () => void
  stop: () => void
  togglePlay: (trackId: string) => void
  setVolume: (v: number) => void
  toggleLoop: () => void
  fadeOut: (ms?: number) => Promise<void>
  fadeIn: (trackId: string, ms?: number) => void
}

const MusicContext = createContext<MusicContextValue | null>(null)

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error("useMusic must be used within MusicProvider")
  return ctx
}

function loadInitial(): MusicPlayerState {
  if (typeof window === "undefined") return { lastTrackId: "", volume: 50, isPlaying: false, loop: true }
  return loadMusicPlayerState()
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [currentTrackId, setCurrentTrackId] = useState(() => loadInitial().lastTrackId)
  const [isPlaying, setIsPlaying] = useState(() => loadInitial().isPlaying)
  const [volume, setVolumeState] = useState(() => loadInitial().volume)
  const [loop, setLoop] = useState(() => loadInitial().loop)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const persist = useCallback((patch: Partial<MusicPlayerState>) => {
    const next = { lastTrackId: currentTrackId, volume, isPlaying, loop, ...patch }
    saveMusicPlayerState(next)
  }, [currentTrackId, volume, isPlaying, loop])

  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio()
      audio.preload = "auto"
      audio.loop = loop
      audio.volume = volume / 100
      audioRef.current = audio
    }
    return audioRef.current
  }, [loop, volume])

  const clearFadeTimer = useCallback(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }, [])

  const play = useCallback((trackId: string) => {
    const track = getTrackById(trackId)
    if (!track) return

    const audio = getAudio()
    clearFadeTimer()

    if (audio.src && audio.src.endsWith(track.file) && !audio.paused) return

    audio.src = track.file
    audio.loop = loop
    audio.volume = volume / 100
    setIsLoading(true)

    audio.play().then(() => {
      setCurrentTrackId(trackId)
      setIsPlaying(true)
      setIsLoading(false)
      persist({ lastTrackId: trackId, isPlaying: true })
    }).catch(() => {
      setIsLoading(false)
    })
  }, [getAudio, clearFadeTimer, loop, volume, persist])

  const pause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    clearFadeTimer()
    audio.pause()
    setIsPlaying(false)
    persist({ isPlaying: false })
  }, [clearFadeTimer, persist])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audio.src) return
    clearFadeTimer()
    audio.play().then(() => {
      setIsPlaying(true)
      persist({ isPlaying: true })
    }).catch(() => { /* blocked */ })
  }, [clearFadeTimer, persist])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    clearFadeTimer()
    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
    setCurrentTime(0)
    persist({ isPlaying: false })
  }, [clearFadeTimer, persist])

  const togglePlay = useCallback((trackId: string) => {
    if (currentTrackId === trackId && isPlaying) {
      pause()
    } else if (currentTrackId === trackId && !isPlaying) {
      resume()
    } else {
      play(trackId)
    }
  }, [currentTrackId, isPlaying, pause, resume, play])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v))
    setVolumeState(clamped)
    if (audioRef.current) audioRef.current.volume = clamped / 100
    persist({ volume: clamped })
  }, [persist])

  const toggleLoop = useCallback(() => {
    const next = !loop
    setLoop(next)
    if (audioRef.current) audioRef.current.loop = next
    persist({ loop: next })
  }, [loop, persist])

  const fadeOut = useCallback((ms = 800): Promise<void> => {
    return new Promise((resolve) => {
      const audio = audioRef.current
      if (!audio || audio.paused) {
        setIsPlaying(false)
        resolve()
        return
      }
      clearFadeTimer()
      const startVol = audio.volume
      const steps = 20
      const stepMs = ms / steps
      let step = 0

      const tick = () => {
        step++
        const progress = step / steps
        audio.volume = startVol * (1 - progress)
        if (step < steps) {
          fadeTimerRef.current = setTimeout(tick, stepMs)
        } else {
          audio.pause()
          audio.volume = startVol
          setIsPlaying(false)
          persist({ isPlaying: false })
          fadeTimerRef.current = null
          resolve()
        }
      }
      fadeTimerRef.current = setTimeout(tick, stepMs)
    })
  }, [clearFadeTimer, persist])

  const fadeIn = useCallback((trackId: string, ms = 800) => {
    const track = getTrackById(trackId)
    if (!track) return

    const audio = getAudio()
    clearFadeTimer()
    const targetVol = volume / 100

    audio.volume = 0
    audio.src = track.file
    audio.loop = loop
    setIsLoading(true)

    audio.play().then(() => {
      setCurrentTrackId(trackId)
      setIsPlaying(true)
      setIsLoading(false)

      const steps = 20
      const stepMs = ms / steps
      let step = 0

      const tick = () => {
        step++
        const progress = step / steps
        audio.volume = targetVol * progress
        if (step < steps) {
          fadeTimerRef.current = setTimeout(tick, stepMs)
        } else {
          audio.volume = targetVol
          fadeTimerRef.current = null
        }
      }
      fadeTimerRef.current = setTimeout(tick, stepMs)
      persist({ lastTrackId: trackId, isPlaying: true })
    }).catch(() => {
      setIsLoading(false)
    })
  }, [getAudio, clearFadeTimer, loop, volume, persist])

  useEffect(() => {
    const audio = getAudio()
    if (!audio) return

    const onTime = () => setCurrentTime(audio.currentTime)
    const onDuration = () => setDuration(audio.duration || 0)
    const onEnded = () => {
      if (!audio.loop) setIsPlaying(false)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => {
      if (!audio.ended) setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", onTime)
    audio.addEventListener("loadedmetadata", onDuration)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)

    return () => {
      audio.removeEventListener("timeupdate", onTime)
      audio.removeEventListener("loadedmetadata", onDuration)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
    }
  }, [getAudio])

  const currentTrack = currentTrackId ? getTrackById(currentTrackId) ?? null : null

  const value: MusicContextValue = {
    currentTrack,
    isPlaying,
    volume,
    loop,
    currentTime,
    duration,
    isLoading,
    play,
    pause,
    resume,
    stop,
    togglePlay,
    setVolume,
    toggleLoop,
    fadeOut,
    fadeIn,
  }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}
