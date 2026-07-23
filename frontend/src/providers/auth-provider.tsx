"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useUser, useRefreshToken } from "@/hooks/use-auth"
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
  const refresh = useRefreshToken()

  const {
    data: user,
    isLoading: userLoading,
    isError,
    error,
  } = useUser()

  useEffect(() => {
    if (isError && !userLoading) {
      const axiosErr = error as { response?: { status?: number } }
      const status = axiosErr?.response?.status

      if (status === 401) {
        console.log("[auth] /me returned 401, no session — treating as logged out")
        return
      }

      if (status && status >= 500) {
        console.log("[auth] /me returned server error, attempting refresh")
        refresh().catch(() => {
          console.log("[auth] refresh also failed, treating as logged out")
        })
      }
    }
  }, [isError, userLoading, error, refresh])

  useEffect(() => {
    if (userLoading) return

    if (!user && !publicRoutes.includes(pathname)) {
      router.replace("/login")
    } else if (user && (pathname === "/login" || pathname === "/register")) {
      router.replace("/dashboard")
    }
  }, [user, userLoading, pathname, router])

  const isLoading = userLoading

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user,
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
