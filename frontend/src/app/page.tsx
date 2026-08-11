"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BarChart3Icon,
  CheckIcon,
  FlameIcon,
  FocusIcon,
  LeafIcon,
  Loader2Icon,
  MenuIcon,
  MonitorIcon,
  MusicIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RotateCcwIcon,
  Settings2Icon,
  SkipBackIcon,
  SkipForwardIcon,
  SmartphoneIcon,
  TimerIcon,
  TrendingUpIcon,
  Volume2Icon,
  XIcon,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/design-system/progress"
import { cn } from "@/lib/utils"

/* ─── Hooks ───────────────────────────────────────────────────── */

/** Imperative mouse parallax — moves the element without re-rendering. */
function useMouseParallaxStyle(strength = 10) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const onMove = (event: MouseEvent) => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const x = ((event.clientX - cx) / cx) * strength
        const y = ((event.clientY - cy) / cy) * strength
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      })
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
    }
  }, [strength])

  return ref
}

/** Scroll-depth parallax — drifts the element as the page scrolls. */
function useParallax(speed = 0.06) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2
      const offset = Math.max(-30, Math.min(30, -mid * speed))
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [speed])

  return ref
}

/** Fires once when the element scrolls into view. */
function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

/** Counts from 0 to target once `start` becomes true (rAF, eased). */
function useCountUp(target: number, duration = 1500, start = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const span = reduced ? 0 : duration
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / span || 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])

  return value
}

/* ─── Primitives ──────────────────────────────────────────────── */

type RevealFrom = "bottom" | "left" | "right" | "none"

/** Scroll-triggered entrance. Honors prefers-reduced-motion. */
function Reveal({
  children,
  from = "bottom",
  delay = 0,
  className,
}: {
  children: ReactNode
  from?: RevealFrom
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1"
      el.style.transform = "none"
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const hidden: Record<RevealFrom, React.CSSProperties> = {
    bottom: { opacity: 0, transform: "translateY(30px)" },
    left: { opacity: 0, transform: "translateX(-30px)" },
    right: { opacity: 0, transform: "translateX(30px)" },
    none: { opacity: 0, transform: "none" },
  }

  return (
    <div
      ref={ref}
      style={{ ...(shown ? { opacity: 1, transform: "none" } : hidden[from]), transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]",
        className
      )}
    >
      {children}
    </div>
  )
}

/** Animated numeric readout (JetBrains Mono). */
function Counter({
  value,
  duration = 1500,
  format,
  className,
}: {
  value: number
  duration?: number
  format?: (n: number) => string
  className?: string
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4)
  const n = useCountUp(value, duration, inView)
  return (
    <span ref={ref} className={cn("numeric", className)}>
      {format ? format(n) : n.toLocaleString()}
    </span>
  )
}

/** Horizontal bar that fills when scrolled into view. */
function AnimatedBar({ value, delay = 0, className }: { value: number; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4)
  return (
    <div ref={ref} className={cn("overflow-hidden rounded-full bg-muted/50", className)}>
      <div
        className="h-full rounded-full bg-foreground/80 transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ width: inView ? `${value}%` : "0%", transitionDelay: `${delay}ms` }}
      />
    </div>
  )
}

/** Vertical column that grows when scrolled into view. */
function AnimatedColumn({ value, delay = 0, className }: { value: number; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35)
  return (
    <div
      ref={ref}
      className={cn(
        "w-full self-end rounded-full transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
      style={{ height: inView ? `${value}%` : "0%", transitionDelay: `${delay}ms` }}
    />
  )
}

/** Editorial section marker: dot + index — label. */
function Eyebrow({ index, children }: { index: string; children: ReactNode }) {
  return (
    <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
      <span className="size-1.5 rounded-full bg-terracotta-500" />
      <span className="text-foreground">{index}</span>
      <span aria-hidden="true" className="text-terracotta-500/70">
        —
      </span>
      <span>{children}</span>
    </p>
  )
}

/** Editorial numbered point list with hairline rules. */
function PointList({
  points,
  accent = "text-terracotta-600 dark:text-terracotta-400",
}: {
  points: { title: string; text: string }[]
  accent?: string
}) {
  return (
    <ul className="mt-10 space-y-7">
      {points.map((point, i) => (
        <li key={point.title} className="border-t border-border/70 pt-5">
          <div className="flex items-center gap-3">
            <span className={cn("font-mono text-[10px] uppercase tracking-[0.2em]", accent)}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border/70" />
          </div>
          <h3 className="mt-3 text-title text-foreground">{point.title}</h3>
          <p className="mt-1.5 max-w-sm text-body text-muted-foreground">{point.text}</p>
        </li>
      ))}
    </ul>
  )
}

/** Auth-aware primary call-to-action. */
function PrimaryCta({ tone = "ink", className }: { tone?: "ink" | "outline"; className?: string }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Button size="lg" disabled className="h-11 rounded-full px-7">
        <Loader2Icon className="animate-spin" size={16} />
        Loading…
      </Button>
    )
  }

  const href = isAuthenticated ? "/dashboard" : "/register"
  const label = isAuthenticated ? "Open dashboard" : "Start studying"

  return (
    <Link href={href}>
      <Button
        size="lg"
        className={cn(
          "group h-11 gap-2 rounded-full px-7 font-mono text-[13px] font-medium uppercase tracking-[0.16em] transition-transform duration-300 hover:-translate-y-0.5",
          tone === "ink"
            ? "bg-foreground text-background hover:bg-foreground/90"
            : "border border-foreground/25 bg-transparent text-foreground hover:border-foreground/50",
          className
        )}
      >
        {label}
        {/* <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-1" /> */}
      </Button>
    </Link>
  )
}

function Brand() {
  return (
    <a href="#top" className="group flex items-center gap-2.5">
      <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background transition-transform duration-300 group-hover:-rotate-6">
        <LeafIcon size={14} />
      </span>
      <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground">Study Space</span>
    </a>
  )
}

/* ─── Navigation ──────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { href: "#workspace", label: "Workspace" },
    { href: "#focus", label: "Focus" },
    { href: "#analytics", label: "Analytics" },
    { href: "#music", label: "Music" },
    { href: "#devices", label: "Devices" },
  ]

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-border/70 bg-background/85 backdrop-blur-md" : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <Button size="sm" disabled>
              <Loader2Icon className="animate-spin" size={14} />
            </Button>
          ) : isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 rounded-full font-mono text-[12px] uppercase tracking-[0.14em]">
                Dashboard 
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full font-mono text-[11px] uppercase tracking-[0.14em]"
                >
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full font-mono text-[11px] uppercase tracking-[0.14em]">
                  Start free
                </Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <XIcon size={18} /> : <MenuIcon size={18} />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md md:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-border/50 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground last:border-0"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}

/* ─── Hero ────────────────────────────────────────────────────── */

const TIMER_TOTAL = 25 * 60

function HeroTimer() {
  const [left, setLeft] = useState(TIMER_TOTAL)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = window.setInterval(() => {
      setLeft((s) => (s <= 1 ? TIMER_TOTAL : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const elapsed = TIMER_TOTAL - left
  const pct = (elapsed / TIMER_TOTAL) * 100
  const mm = String(Math.floor(left / 60)).padStart(2, "0")
  const ss = String(left % 60).padStart(2, "0")
  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`

  const size = 168
  const stroke = 7
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-terracotta-500/12 text-terracotta-600 dark:text-terracotta-400">
            <TimerIcon size={16} />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold tracking-tight text-foreground">Focus session</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Pomodoro — 25 min
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-600 dark:text-sage-400">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-current" />
          Live
        </span>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-muted/40"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--color-terracotta-500)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="numeric text-5xl font-bold tracking-tighter text-foreground">
              {mm}:{ss}
            </span>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Elapsed — {elapsedLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button size="icon" className="size-12 rounded-full" aria-label="Pause timer">
          <PauseIcon size={16} />
        </Button>
        <Button size="icon" variant="ghost" className="size-10 rounded-full text-muted-foreground" aria-label="Skip session">
          <SkipForwardIcon size={15} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-10 rounded-full text-muted-foreground"
          aria-label="Configure timer"
        >
          <Settings2Icon size={15} />
        </Button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Daily goal</span>
          <span className="numeric text-foreground">2 of 4</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted/50">
          <div className="h-full w-1/2 rounded-full bg-sage-600 dark:bg-sage-400" />
        </div>
      </div>
    </div>
  )
}

function HeroVisual() {
  const cardRef = useMouseParallaxStyle(12)
  const noteRef = useMouseParallaxStyle(26)
  const chipRef = useMouseParallaxStyle(-22)
  const ringRef = useMouseParallaxStyle(6)

  const noteItems = [
    { label: "Review calculus notes", done: true },
    { label: "Read — Atomic Habits", done: true },
    { label: "Plan tomorrow", done: false },
  ]

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div ref={ringRef} aria-hidden="true" className="absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="size-[26rem] animate-spin-slow rounded-full border border-dashed border-border/80" />
      </div>

      <div ref={cardRef} className="relative rotate-[-1.5deg]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-floating sm:p-7">
          <HeroTimer />
        </div>
      </div>

      <div ref={noteRef} className="absolute -left-8 top-16 hidden animate-float sm:block">
        <div className="w-56 rotate-[-3deg] rounded-2xl border border-border bg-card p-4 shadow-medium">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Today&apos;s list</p>
          <ul className="mt-3 space-y-2.5">
            {noteItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-[4px] border",
                    item.done ? "border-forest-500 bg-forest-500 text-white" : "border-border bg-muted/40 text-transparent"
                  )}
                >
                  <CheckIcon size={9} strokeWidth={3} />
                </span>
                <span className={cn("text-xs", item.done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div ref={chipRef} className="absolute -bottom-8 -right-2 hidden animate-float-delayed sm:block">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-medium">
          <span className="flex size-8 items-center justify-center rounded-full bg-terracotta-500/15 text-terracotta-600 dark:text-terracotta-400">
            <FlameIcon size={15} />
          </span>
          <div>
            <p className="numeric text-base font-semibold leading-none text-foreground">12</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Day streak</p>
          </div>
        </div>
      </div>

      <p className="absolute -right-12 bottom-28 hidden rotate-90 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground lg:block">
        Live preview — 01
      </p>
    </div>
  )
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="hairline-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(70rem_50rem_at_72%_0%,black,transparent)]" />
        <p className="text-stroke absolute -right-8 top-16 select-none font-mono text-[20rem] font-bold leading-none opacity-50">
          01
        </p>
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 pb-24 pt-32 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pb-36 lg:pt-40">
        <div className="lg:col-span-6">
          <Reveal from="none">
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-terracotta-500" />
              A calm study system
              <span aria-hidden="true" className="hidden h-px w-16 bg-border sm:block" />
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="mt-7 text-display text-foreground">
              Keep your head
              <br />
              in the <span className="text-serif-accent text-terracotta-600 dark:text-terracotta-400">work.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-7 max-w-md text-body text-muted-foreground">
              Study Space is a quiet place for focused sessions, notes and streaks. Timers, analytics and ambient
              audio — one workspace, nothing in the way.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <PrimaryCta />
              <a
                href="#workspace"
                className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-terracotta-600 dark:hover:text-terracotta-400"
              >
                Take the tour
                <ArrowRightIcon size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-14 flex max-w-md border-t border-border/70 pt-0">
              {[
                { value: "40k+", label: "Students" },
                { value: "12d", label: "Avg. streak" },
                { value: "4.9", label: "App rating" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={cn("flex-1 px-4 py-4", i === 0 ? "pl-0" : "border-l border-border/70")}
                >
                  <p className="numeric text-lg font-semibold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} from="right" className="lg:col-span-6">
          <HeroVisual />
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Ticker strip ────────────────────────────────────────────── */

function TickerStrip() {
  const items = ["Pomodoro", "Deep work", "Streaks", "Focus score", "Ambient audio", "Offline-first"]
  return (
    <div className="border-y border-border/70 bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-5 lg:justify-between">
        {items.map((item) => (
          <span
            key={item}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <span className="size-1 rounded-full bg-terracotta-500/80" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Workspace ───────────────────────────────────────────────── */

function WorkspaceWindow() {
  const nav = ["Dashboard", "Focus", "Todos", "Analytics", "Music"]
  const tasks = [
    { label: "Review calculus notes", done: true },
    { label: "Read 20 pages — Atomic Habits", done: true },
    { label: "Plan tomorrow's schedule", done: false },
    { label: "Deep work: 25 min", done: false },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <span className="size-2.5 rounded-full bg-[oklch(0.63_0.13_25/0.85)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.72_0.15_80/0.85)]" />
        <span className="size-2.5 rounded-full bg-[oklch(0.6_0.1_155/0.85)]" />
        <div className="ml-3 flex-1 truncate rounded-lg bg-muted/40 px-3 py-1 font-mono text-[11px] text-muted-foreground">
          studyspace.app/dashboard
        </div>
      </div>

      <div className="flex">
        <aside className="hidden w-44 shrink-0 border-r border-border/70 p-3 sm:block">
          <div className="flex items-center gap-2 px-1.5">
            <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
              <LeafIcon size={12} />
            </span>
            <span className="font-heading text-xs font-semibold text-foreground">Study Space</span>
          </div>
          <nav className="mt-4 space-y-0.5">
            {nav.map((item, i) => (
              <span
                key={item}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium",
                  i === 0 ? "bg-sage-500/15 text-sage-700 dark:text-sage-300" : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-3 w-[3px] rounded-full",
                    i === 0 ? "bg-sage-600 dark:bg-sage-400" : "bg-transparent"
                  )}
                />
                {item}
              </span>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">Good afternoon</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Let&apos;s make today count.</p>
            </div>
            <div className="text-right">
              <p className="numeric text-xl font-bold leading-none text-foreground">86</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Focus score</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[11px] font-medium text-foreground">Daily goal</p>
              <div className="mt-2.5 flex items-center gap-3">
                <CircularProgress value={50} size={44} strokeWidth={4} gradient />
                <div>
                  <p className="numeric text-lg font-bold leading-none text-foreground">2</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">of 4 sessions</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background/40 p-3">
              <p className="text-[11px] font-medium text-foreground">Current streak</p>
              <div className="mt-2.5 flex items-center gap-2">
                <FlameIcon size={16} className="text-terracotta-500 dark:text-terracotta-400" />
                <p className="numeric text-lg font-bold leading-none text-foreground">
                  12<span className="ml-1 text-[11px] font-medium text-muted-foreground">days</span>
                </p>
              </div>
              <div className="mt-2.5 flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      i < 5 ? "bg-sage-500/70 dark:bg-sage-400/70" : "bg-muted/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border/60 bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-foreground">Today&apos;s tasks</p>
              <span className="numeric text-[10px] text-muted-foreground">2 of 4 done</span>
            </div>
            <ul className="mt-2.5 space-y-1.5">
              {tasks.map((task) => (
                <li key={task.label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-3.5 shrink-0 items-center justify-center rounded-[4px] border",
                      task.done
                        ? "border-forest-500/60 bg-forest-500/15 text-forest-600 dark:text-forest-400"
                        : "border-border bg-muted/40 text-transparent"
                    )}
                  >
                    <CheckIcon size={9} strokeWidth={3} />
                  </span>
                  <span
                    className={cn(
                      "truncate text-[11px]",
                      task.done
                        ? "text-muted-foreground line-through decoration-muted-foreground/40"
                        : "text-foreground"
                    )}
                  >
                    {task.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
              <span>Weekly progress</span>
              <span className="numeric text-foreground">60%</span>
            </div>
            <AnimatedBar value={60} className="mt-1.5 h-1.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkspaceSection() {
  const winRef = useParallax(0.05)

  const points = [
    { letter: "A", title: "Plan the session", text: "Set today's goals, stack your todos and start with a clear direction." },
    { letter: "B", title: "Work without friction", text: "Timers and notes live side by side, so nothing interrupts the flow." },
    { letter: "C", title: "Watch the streak grow", text: "Every completed session feeds a record you can look back on." },
  ]

  return (
    <section id="workspace" className="border-t border-border/70 py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow index="01">Workspace</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-6 text-heading text-foreground">Your whole day, on one quiet surface.</h2>
            </Reveal>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Reveal delay={120}>
              <p className="max-w-sm text-body text-muted-foreground">
                Plan sessions, keep notes and watch progress — without tabs, noise or distractions fighting for
                attention.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal from="none">
                <p aria-hidden="true" className="text-stroke select-none font-mono text-[7rem] font-bold leading-none">
                  01
                </p>
              </Reveal>
              <ul className="mt-8 space-y-8">
                {points.map((point) => (
                  <Reveal key={point.title} delay={40}>
                    <li className="border-t border-border/70 pt-5">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terracotta-600 dark:text-terracotta-400">
                        {point.letter} /
                      </p>
                      <h3 className="mt-3 text-title text-foreground">{point.title}</h3>
                      <p className="mt-2 max-w-sm text-body text-muted-foreground">{point.text}</p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div ref={winRef}>
              <Reveal from="right">
                <WorkspaceWindow />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Focus ───────────────────────────────────────────────────── */

function FocusPanel() {
  const modes = ["Pomodoro", "Deep work", "Custom"]
  const bars = [42, 68, 54, 82, 60, 90, 48]

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-terracotta-500/12 text-terracotta-600 dark:text-terracotta-400">
            <FocusIcon size={16} />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">Focus session</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Flow today — 1h 12m
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/40 p-1">
          {modes.map((mode) => (
            <span
              key={mode}
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                mode === "Pomodoro"
                  ? "bg-terracotta-500/15 text-terracotta-700 dark:text-terracotta-300"
                  : "text-muted-foreground"
              )}
            >
              {mode}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Session timer</p>
          <p className="numeric mt-3 text-7xl font-bold leading-none tracking-tighter text-foreground">45:00</p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Round 2 of 4 — 25 / 5
          </p>
        </div>

        <div className="w-full max-w-[10rem]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">This week</p>
          <div className="mt-3 flex h-28 items-end gap-1.5">
            {bars.map((bar, i) => (
              <AnimatedColumn
                key={i}
                value={bar}
                delay={i * 50}
                className="bg-terracotta-500/70 dark:bg-terracotta-400/70"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3 border-t border-border/70 pt-6">
        <Button size="icon" variant="ghost" className="size-10 rounded-full text-muted-foreground" aria-label="Reset timer">
          <RotateCcwIcon size={15} />
        </Button>
        <Button size="icon" className="size-12 rounded-full" aria-label="Start timer">
          <PlayIcon size={16} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="size-10 rounded-full text-muted-foreground"
          aria-label="Configure session"
        >
          <Settings2Icon size={15} />
        </Button>
      </div>
    </div>
  )
}

function FocusSection() {
  const points = [
    { title: "Modes for the moment", text: "Pomodoro, deep work and custom lengths — switch without breaking focus." },
    { title: "Breaks that fit", text: "Rest cues are tuned to how much you've actually focused today." },
    { title: "One-key immersion", text: "Jump into full-screen focus and let everything else fall away." },
  ]

  return (
    <section id="focus" className="relative overflow-hidden border-t border-border/70 py-24 lg:py-36">
      <p aria-hidden="true" className="text-stroke pointer-events-none absolute right-0 top-0 select-none font-mono text-[16rem] font-bold leading-none opacity-50">
        02
      </p>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:pt-24">
            <Reveal>
              <Eyebrow index="02">Focus</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-6 text-heading text-foreground">Timers that pull you in, never nag you.</h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-body text-muted-foreground">
                Structure your sessions around how your brain actually works — with gentle cues instead of noise.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <PointList points={points} />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal from="right" delay={100}>
              <div className="relative rotate-[0.6deg] lg:ml-8 lg:-mt-8">
                <FocusPanel />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Analytics ───────────────────────────────────────────────── */

function AnalyticsVisual() {
  const days = [
    { day: "M", value: 62 },
    { day: "T", value: 84 },
    { day: "W", value: 48 },
    { day: "T", value: 96 },
    { day: "F", value: 71 },
    { day: "S", value: 58 },
    { day: "S", value: 88 },
  ]
  const spark = [34, 52, 40, 66, 58, 78, 64, 86, 72, 92]
  const best = 3

  return (
    <div className="space-y-6">
      <Reveal from="left">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Deep work this month
          </p>
          <div className="mt-4 flex items-end justify-between gap-6">
            <div>
              <p className="numeric text-6xl font-bold tracking-tighter text-foreground">
                <Counter value={1248} format={(n) => n.toLocaleString()} />
                <span className="ml-1 text-2xl font-medium text-muted-foreground">h</span>
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                +18% vs last month
              </p>
            </div>
            <div className="text-right">
              <p className="numeric text-3xl font-bold text-foreground">
                <Counter value={86} duration={900} />
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">Focus score</p>
            </div>
          </div>
          <div className="mt-8 flex h-20 items-end gap-1.5">
            {spark.map((v, i) => (
              <AnimatedColumn
                key={i}
                value={v}
                delay={i * 40}
                className="bg-foreground/20 transition-colors duration-300 hover:bg-terracotta-500/60"
              />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal from="left" delay={80}>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <BarChart3Icon size={13} className="text-terracotta-500" />
              Last 7 days
            </p>
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-forest-600 dark:text-forest-400">
              <TrendingUpIcon size={12} />
              +12%
            </span>
          </div>

          <div className="mt-8 grid grid-cols-7 gap-2 sm:gap-3">
            {days.map((d, i) => (
              <div key={d.day} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end rounded-md bg-muted/30">
                  <AnimatedColumn
                    value={d.value}
                    delay={i * 60}
                    className={
                      i === best
                        ? "bg-terracotta-500/80 dark:bg-terracotta-400/80"
                        : "bg-foreground/15"
                    }
                  />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{d.day}</span>
                <span className="numeric text-[10px] text-muted-foreground">{d.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 border-t border-border/70">
            {[
              { v: "4h 12m", l: "Longest day" },
              { v: "9am", l: "Peak focus" },
              { v: "7", l: "Perfect days" },
            ].map((s, i) => (
              <div
                key={s.l}
                className={cn("px-4 py-4", i === 0 ? "pl-0" : "border-l border-border/70")}
              >
                <p className="numeric text-sm font-semibold text-foreground">{s.v}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function AnalyticsSection() {
  const points = [
    { title: "Focus score", text: "One number that reflects consistent, deep work." },
    { title: "Best hours", text: "Charts reveal your strongest window of the day." },
    { title: "Streaks", text: "Keep the chain alive — small wins compound." },
  ]

  return (
    <section id="analytics" className="border-t border-border/70 py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow index="03">Analytics</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-6 text-heading text-foreground">Momentum you can measure.</h2>
            </Reveal>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Reveal delay={120}>
              <p className="max-w-sm text-body text-muted-foreground">
                Understand when you focus best and let small, honest numbers carry your motivation.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal from="none">
                <p aria-hidden="true" className="text-stroke select-none font-mono text-[7rem] font-bold leading-none">
                  03
                </p>
              </Reveal>
              <Reveal delay={40}>
                <PointList points={points} accent="text-forest-600 dark:text-forest-400" />
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <AnalyticsVisual />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Music ───────────────────────────────────────────────────── */

function MusicPanel() {
  const tracks = [
    { title: "Rain on a Tin Roof", artist: "Ambient Focus", length: "4:32", active: true },
    { title: "Midnight Study Loops", artist: "Lofi Vol. 3", length: "3:48", active: false },
    { title: "Ember Sessions", artist: "Instrumental", length: "5:11", active: false },
  ]

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="flex items-center gap-6 p-6 sm:p-8">
        <div className="relative hidden size-28 shrink-0 sm:block">
          <div aria-hidden="true" className="absolute inset-0 rotate-3 rounded-2xl bg-terracotta-500/30" />
          <div className="relative flex size-28 items-center justify-center rounded-2xl bg-gradient-to-br from-olive-600 to-forest-700 text-white">
            <LeafIcon size={30} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold tracking-tight text-foreground">Rain on a Tin Roof</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Ambient Focus — Study Space Radio
          </p>
          <div className="mt-4 flex h-8 items-center gap-1" aria-hidden="true">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="w-[3px] origin-bottom animate-eq rounded-full bg-olive-600 dark:bg-olive-400"
                style={{
                  height: `${((i % 5) + 1) * 20}%`,
                  animationDelay: `${i * 55}ms`,
                  animationDuration: `${900 + (i % 4) * 180}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <ul className="border-t border-border/70 px-4 py-2">
        {tracks.map((track, i) => (
          <li
            key={track.title}
            className={cn(
              "flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
              track.active ? "bg-olive-500/10" : "hover:bg-muted/40"
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.14em]",
                  track.active ? "text-olive-600 dark:text-olive-400" : "text-muted-foreground/70"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {track.active ? (
                <MusicIcon size={13} className="shrink-0 text-olive-600 dark:text-olive-400" />
              ) : (
                <MusicIcon size={13} className="shrink-0 text-muted-foreground/50" />
              )}
              <div className="min-w-0">
                <p className={cn("truncate text-xs font-medium", track.active ? "text-foreground" : "text-muted-foreground")}>
                  {track.title}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">{track.artist}</p>
              </div>
            </div>
            <span className="numeric ml-2 shrink-0 font-mono text-[10px] text-muted-foreground">{track.length}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/70 bg-background/40 px-5 py-4">
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="size-9 rounded-full text-muted-foreground" aria-label="Previous track">
            <SkipBackIcon size={14} />
          </Button>
          <Button size="icon" className="size-10 rounded-full" aria-label="Play">
            <PlayIcon size={14} />
          </Button>
          <Button size="icon" variant="ghost" className="size-9 rounded-full text-muted-foreground" aria-label="Next track">
            <SkipForwardIcon size={14} />
          </Button>
          <Button size="icon" variant="ghost" className="size-9 rounded-full text-muted-foreground" aria-label="Repeat playlist">
            <RepeatIcon size={14} />
          </Button>
        </div>

        <div className="flex min-w-32 flex-1 items-center gap-3">
          <span className="numeric font-mono text-[10px] text-muted-foreground">1:42</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/50">
            <div className="h-full w-1/3 rounded-full bg-olive-600 dark:bg-olive-400" />
          </div>
          <span className="numeric font-mono text-[10px] text-muted-foreground">4:32</span>
        </div>

        <div className="flex items-center gap-2">
          <Volume2Icon size={14} className="text-muted-foreground" />
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted/50">
            <div className="h-full w-2/3 rounded-full bg-olive-600 dark:bg-olive-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MusicSection() {
  const points = [
    { title: "Built-in playlists", text: "Ambient, lo-fi and focus soundscapes tuned for study." },
    { title: "Fades with your session", text: "Volume eases in and out as timers start and stop." },
    { title: "Stays out of the way", text: "Queue, repeat and skip without leaving your work." },
  ]

  return (
    <section id="music" className="border-t border-border/70 py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:pt-12">
            <Reveal>
              <Eyebrow index="04">Music</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h2 className="mt-6 text-heading text-foreground">Sound that stays out of the way.</h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-md text-body text-muted-foreground">
                A soundtrack built for studying — warm, low and present, with controls that never break your flow.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <PointList points={points} accent="text-olive-600 dark:text-olive-400" />
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal from="right" delay={100}>
              <div className="relative rotate-[-0.6deg] lg:ml-8 lg:mt-12">
                <MusicPanel />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Devices ─────────────────────────────────────────────────── */

function DeviceCard({ icon, title, description, tags }: { icon: ReactNode; title: string; description: string; tags: string[] }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
      el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg)`
      })
    }
    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)"
    }
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseleave", onLeave)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return (
    <div ref={ref} className="spotlight-card relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card will-change-transform">
      <div className="flex size-11 items-center justify-center rounded-xl border border-border/70 bg-background/40 text-terracotta-600 dark:text-terracotta-400">
        {icon}
      </div>
      <p className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function DevicesSection() {
  const points = [
    { title: "Seamless sync", text: "Sessions, notes and playlists stay in step across devices." },
    { title: "Offline first", text: "Keep working on the train — everything merges back online." },
    { title: "Private by design", text: "Encrypted, yours alone. No ads, no tracking." },
  ]

  return (
    <section id="devices" className="border-t border-border/70 py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-start gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Eyebrow index="05">Devices</Eyebrow>
              </Reveal>
              <Reveal delay={60}>
                <h2 className="mt-6 text-heading text-foreground">
                  One space.
                  <br />
                  Every device.
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-6 max-w-md text-body text-muted-foreground">
                  Your focus, sessions and streaks follow you from desk to commute to couch — without missing a beat.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <PointList points={points} accent="text-terracotta-600 dark:text-terracotta-400" />
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="tilt-perspective relative">
              <div aria-hidden="true" className="absolute left-1/2 top-1/2 hidden h-px w-3/4 -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-border lg:block" />
              <div className="grid gap-6 sm:grid-cols-5">
                <Reveal from="right" className="sm:col-span-3">
                  <DeviceCard
                    icon={<MonitorIcon size={18} />}
                    title="Desktop"
                    description="The full workspace — timers, notes, analytics and a layout you can make yours."
                    tags={["Windows", "macOS", "Linux", "Web"]}
                  />
                </Reveal>
                <Reveal from="right" delay={90} className="sm:col-span-2 sm:mt-20">
                  <DeviceCard
                    icon={<SmartphoneIcon size={18} />}
                    title="Mobile"
                    description="Sessions and streaks in your pocket — even offline."
                    tags={["iOS", "Android", "Offline"]}
                  />
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ─────────────────────────────────────────────────────── */

function CtaSection() {
  return (
    <section className="border-t border-border/70 py-24 lg:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-16 sm:px-12 lg:px-16 lg:py-24">
            <div className="relative flex flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
              <div className="max-w-xl">
                <Reveal from="none">
                  <Eyebrow index="06">Start today</Eyebrow>
                </Reveal>
                <Reveal delay={60}>
                  <h2 className="mt-6 text-display text-foreground">
                    Begin your streak <span className="text-serif-accent text-terracotta-600 dark:text-terracotta-400">today.</span>
                  </h2>
                </Reveal>
                <Reveal delay={120}>
                  <p className="mt-6 max-w-md text-body text-muted-foreground">
                    Free to start, quiet by design. Your data stays yours — no ads, no tracking, no noise.
                  </p>
                </Reveal>
              </div>

              <Reveal delay={160}>
                <div className="flex flex-col items-start gap-4">
                  <PrimaryCta />
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              
                  </p>
                </div>
              </Reveal>
            </div>

            <p aria-hidden="true" className="text-stroke pointer-events-none absolute -bottom-10 right-0 select-none font-mono text-[14rem] font-bold leading-none opacity-50">
              flow
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Footer ──────────────────────────────────────────────────── */

function Footer() {
  const links = [
    { label: "Workspace", href: "#workspace" },
    { label: "Focus", href: "#focus" },
    { label: "Analytics", href: "#analytics" },
    { label: "Music", href: "#music" },
    { label: "Devices", href: "#devices" },
  ]

  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Brand />
            <p className="mt-4 max-w-xs text-body text-muted-foreground">
              A calm, private workspace for focused study — sessions, notes, analytics and ambient audio.
            </p>
          </div>

          <div className="lg:col-span-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Product</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {links.map((link) => (
                <a key={link.href} href={link.href} className="w-fit text-sm text-foreground/80 transition-colors hover:text-foreground">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Elsewhere</p>
            <div className="mt-4 flex flex-col gap-2.5">
              {["Privacy", "Terms", "Support"].map((label) => (
                <span key={label} className="w-fit cursor-pointer text-sm text-foreground/80 transition-colors hover:text-foreground">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Study Space</p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-sage-500" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <TickerStrip />
        <WorkspaceSection />
        <FocusSection />
        <AnalyticsSection />
        <MusicSection />
        <DevicesSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
