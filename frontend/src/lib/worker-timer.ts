/**
 * Web Worker-based timer to provide unthrottled ticks even when
 * the browser tab is hidden or backgrounded.
 */

type TickListener = (now: number) => void

class WorkerTimerManager {
  private worker: Worker | null = null
  private listeners: Set<TickListener> = new Set()
  private fallbackIntervalId: ReturnType<typeof setInterval> | null = null
  private activeIntervalMs: number | null = null

  constructor() {
    if (typeof window === "undefined") return

    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data.action === 'start') {
            if (timer) clearInterval(timer);
            timer = setInterval(function() {
              self.postMessage({ type: 'tick', now: Date.now() });
            }, e.data.interval || 250);
          } else if (e.data.action === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `
      const blob = new Blob([workerCode], { type: "application/javascript" })
      this.worker = new Worker(URL.createObjectURL(blob))
      this.worker.onmessage = (e) => {
        if (e.data && e.data.type === "tick") {
          const now = e.data.now || Date.now()
          this.listeners.forEach((listener) => {
            try {
              listener(now)
            } catch (err) {
              console.error("[WorkerTimer] Listener error:", err)
            }
          })
        }
      }
    } catch (err) {
      console.warn("[WorkerTimer] Worker unavailable, falling back to window.setInterval", err)
      this.worker = null
    }
  }

  start(intervalMs = 250) {
    this.activeIntervalMs = intervalMs
    if (this.worker) {
      this.worker.postMessage({ action: "start", interval: intervalMs })
    } else if (typeof window !== "undefined") {
      if (this.fallbackIntervalId) clearInterval(this.fallbackIntervalId)
      this.fallbackIntervalId = setInterval(() => {
        const now = Date.now()
        this.listeners.forEach((listener) => listener(now))
      }, intervalMs)
    }
  }

  stop() {
    this.activeIntervalMs = null
    if (this.worker) {
      this.worker.postMessage({ action: "stop" })
    }
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId)
      this.fallbackIntervalId = null
    }
  }

  subscribe(listener: TickListener): () => void {
    this.listeners.add(listener)
    // If listeners exist and we have an active interval, ensure it's ticking
    if (this.listeners.size === 1 && !this.activeIntervalMs) {
      this.start(250)
    }
    return () => {
      this.listeners.delete(listener)
      if (this.listeners.size === 0) {
        this.stop()
      }
    }
  }
}

export const workerTimer = new WorkerTimerManager()
