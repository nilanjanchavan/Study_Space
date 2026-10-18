"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/services/auth"
import { setAccessToken, getAccessToken, setRefreshToken, getRefreshToken, clearAuthTokens } from "@/lib/api"
import type { LoginRequest, RegisterRequest, User } from "@/types"
import axios from "axios"

/**
 * Attempt to restore a session.
 * Fast-path: If neither accessToken nor refreshToken exists in storage,
 * returns null immediately (0ms) without waiting on a sleeping backend.
 */
export async function hydrateAuth(): Promise<User | null> {
  const token = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!token && !refreshToken) {
    console.log("[auth] No local tokens found, instant skip hydration")
    return null
  }

  if (token) {
    try {
      const response = await authApi.getMe()
      console.log("[auth] hydrated from existing token")
      return response.data.user
    } catch {
      setAccessToken(null)
    }
  }

  try {
    console.log("[auth] attempting refresh on startup")
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      { refreshToken: getRefreshToken() },
      { withCredentials: true, timeout: 6000 }
    )
    const newToken: string = data.data.accessToken
    const newRefreshToken: string | undefined = data.data.refreshToken
    const user: User = data.data.user

    setAccessToken(newToken)
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken)
    }
    console.log("[auth] refresh succeeded, session restored")
    return user
  } catch {
    console.log("[auth] no valid session")
    clearAuthTokens()
    return null
  }
}

export function useUser(enabled: boolean) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authApi.getMe()
      return response.data.user
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken)
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      }
      queryClient.setQueryData(["auth", "me"], response.data.user)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setAccessToken(response.data.accessToken)
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken)
      }
      queryClient.setQueryData(["auth", "me"], response.data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearAuthTokens()
      queryClient.setQueryData(["auth", "me"], null)
    },
  })
}
