"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, hydrateAuth } from "@/hooks/use-auth"
import { PageLoading } from "@/components/common/page-loading"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
})

const publicRoutes = ["/", "/login", "/register"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [hydrated, setHydrated] = useState(false)
  const [seededUser, setSeededUser] = useState<User | null>(null)
  const hydrationRef = useRef(false)

  const { data: user, isLoading: userLoading } = useUser(hydrated)

  useEffect(() => {
    if (hydrationRef.current) return
    hydrationRef.current = true

    hydrateAuth()
      .then((user) => {
        setSeededUser(user)
        setHydrated(true)
      })
      .catch(() => {
        setSeededUser(null)
        setHydrated(true)
      })
  }, [])

  const effectiveUser = user === null ? null : (user ?? seededUser)
  const isLoading = !hydrated || (hydrated && userLoading && !seededUser)

  useEffect(() => {
    if (isLoading) return

    if (!effectiveUser && !publicRoutes.includes(pathname)) {
      router.replace("/login")
    } else if (effectiveUser && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard")
    }
  }, [effectiveUser, isLoading, pathname, router])

  if (!hydrated) {
    return <PageLoading text="Restoring session..." />
  }

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser ?? null,
        isLoading,
        isAuthenticated: !!effectiveUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
