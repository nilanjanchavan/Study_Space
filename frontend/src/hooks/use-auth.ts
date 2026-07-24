"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/services/auth"
import { setAccessToken, getAccessToken } from "@/lib/api"
import type { LoginRequest, RegisterRequest, User } from "@/types"
import axios from "axios"

/**
 * Attempt to restore a session by calling POST /api/auth/refresh
 * using the httpOnly refresh-token cookie. Returns the user on success,
 * or null if no valid session exists.
 *
 * This is a plain async function — NOT a hook — so it can be called
 * once during provider initialization without triggering re-renders.
 */
export async function hydrateAuth(): Promise<User | null> {
  if (getAccessToken()) {
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
      {},
      { withCredentials: true }
    )
    const newToken: string = data.data.accessToken
    const user: User = data.data.user
    setAccessToken(newToken)
    console.log("[auth] refresh succeeded, session restored")
    return user
  } catch {
    console.log("[auth] no valid session")
    setAccessToken(null)
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
      queryClient.setQueryData(["auth", "me"], response.data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      setAccessToken(null)
      queryClient.setQueryData(["auth", "me"], null)
    },
  })
}
