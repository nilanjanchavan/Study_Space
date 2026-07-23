"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "@/services/auth"
import { setAccessToken } from "@/lib/api"
import type { LoginRequest, RegisterRequest } from "@/types"
import { useCallback } from "react"
import axios from "axios"

export function useUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      console.log("[auth] GET /api/auth/me")
      const response = await authApi.getMe()
      console.log("[auth] /api/auth/me → 200", response.data.user.username)
      return response.data.user
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
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
      queryClient.clear()
    },
  })
}

export function useRefreshToken() {
  const queryClient = useQueryClient()

  const refresh = useCallback(async () => {
    try {
      console.log("[auth] POST /api/auth/refresh (manual)")
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      )
      console.log("[auth] /api/auth/refresh → 200")
      const newToken = data.data.accessToken
      setAccessToken(newToken)
      queryClient.setQueryData(["auth", "me"], data.data.user)
      return newToken
    } catch (err) {
      console.error("[auth] /api/auth/refresh failed", err)
      setAccessToken(null)
      queryClient.setQueryData(["auth", "me"], null)
      throw new Error("Refresh failed")
    }
  }, [queryClient])

  return refresh
}
