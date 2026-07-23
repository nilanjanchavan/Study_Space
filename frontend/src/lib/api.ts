import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  console.log(
    "[auth] accessToken set:",
    token ? token.slice(0, 20) + "..." : null
  )
}

export function getAccessToken() {
  return accessToken
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false

let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(undefined)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    console.log(
      `[api] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status}`
    )
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const url: string = originalRequest?.url || ""
    const status: number | undefined = error.response?.status

    // Don't log expected authentication 401s
    const isExpectedAuth401 =
      status === 401 &&
      (url.includes("/api/auth/me") ||
        url.includes("/api/auth/refresh"))

    if (!isExpectedAuth401) {
      console.error(
        `[api] ${originalRequest?.method?.toUpperCase()} ${url} → ${status}`,
        error.response?.data
      )
    }

    // Never intercept 401s from the refresh endpoint itself
    if (url.includes("/api/auth/refresh")) {
      return Promise.reject(error)
    }

    // Never intercept 401s from login/register — let callers handle them
    if (
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/register")
    ) {
      return Promise.reject(error)
    }

    // Only attempt refresh if we actually had a session (access token)
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      accessToken
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        )

        const newToken = data.data.accessToken

        setAccessToken(newToken)

        processQueue(null)

        originalRequest.headers.Authorization = `Bearer ${newToken}`

        return api(originalRequest)
      } catch (refreshError) {
        console.warn("[auth] Refresh failed, clearing session")

        setAccessToken(null)

        processQueue(refreshError)

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api