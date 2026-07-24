"use client"

import { useEffect, useState } from "react"

export function usePageVisibility() {
  const [isTabVisible, setIsTabVisible] = useState(() => {
    if (typeof document === "undefined") return true
    return document.visibilityState === "visible"
  })

  useEffect(() => {
    const handle = () => {
      setIsTabVisible(document.visibilityState === "visible")
    }
    document.addEventListener("visibilitychange", handle)
    return () => document.removeEventListener("visibilitychange", handle)
  }, [])

  return { isTabVisible }
}
