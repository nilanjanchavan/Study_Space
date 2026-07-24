type NotificationPermission = "granted" | "denied" | "default"

let permissionRequested = false

export function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve("denied")
  }

  const current = Notification.permission
  if (current === "granted" || current === "denied") {
    return Promise.resolve(current)
  }
  if (permissionRequested) {
    return Promise.resolve(current)
  }

  permissionRequested = true
  return Notification.requestPermission()
}

export function showBrowserNotification(
  title: string,
  body: string,
  tag: string = "pomodoro-completion"
): Notification | null {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null
  }
  if (Notification.permission !== "granted") {
    return null
  }
  if (document.visibilityState === "visible") {
    return null
  }

  try {
    const n = new Notification(title, {
      body,
      icon: "/favicon.ico",
      tag,
      requireInteraction: true,
    })
    n.onclick = () => {
      window.focus()
      n.close()
    }
    return n
  } catch {
    return null
  }
}

export function isTabVisible(): boolean {
  if (typeof document === "undefined") return true
  return document.visibilityState === "visible"
}
