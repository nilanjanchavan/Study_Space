"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/design-system/progress"
import { Loader2Icon, TimerIcon, FocusIcon, BarChart3Icon, MusicIcon, ListTodoIcon, TargetIcon, PlayIcon, SkipForwardIcon, CheckIcon, ArrowRightIcon, MenuIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Scroll Reveal ─── */

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/* ─── Subtle Scroll Parallax ─── */

function useParallax(speed = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const mid = rect.top + rect.height / 2 - window.innerHeight / 2
      const raw = -mid * speed
      setOffset(Math.max(-36, Math.min(36, raw)))
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [speed])

  return { ref, offset }
}

/* ─── Eyebrow ─── */

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  )
}

/* ─── Product Mockups (static, decorative) ─── */

function PomodoroPanel() {
  const { ref, offset } = useParallax()
  return (
    <div ref={ref} className="mx-auto w-full max-w-2xl" style={{ transform: `translateY(${offset}px)` }}>
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TimerIcon size={15} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">Pomodoro</p>
              <p className="text-[11px] text-muted-foreground">Deep work session</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" />
            Work · 25:00
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <div className="relative">
            <CircularProgress value={62} size={176} strokeWidth={8} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">25:00</span>
              <span className="mt-1 text-[11px] text-muted-foreground">62% complete</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PlayIcon size={16} />
            </span>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
              <SkipForwardIcon size={16} />
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { label: "Sessions today", value: "3 / 8" },
            { label: "Streak", value: "12 days" },
            { label: "Focus score", value: "86" },
          ].map((s) => (
            <div key={s.label} className="min-w-0 rounded-xl border border-border/40 bg-muted/20 px-3 py-3 text-center">
              <p className="truncate text-lg font-semibold text-foreground tabular-nums">{s.value}</p>
              <p className="truncate text-[11px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const WEEK_BARS = [42, 66, 51, 80, 58, 91, 70]

function ChartPanel() {
  const { ref, offset } = useParallax(0.1)
  return (
    <div ref={ref} className="w-full" style={{ transform: `translateY(${offset}px)` }}>
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-7 shadow-soft">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Focus this week</p>
          <p className="text-xs text-muted-foreground tabular-nums">4h 20m · +18%</p>
        </div>

        <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
          {WEEK_BARS.map((bar, i) => (
            <div key={i} className="flex h-full flex-1 items-end">
              <div
                className={cn(
                  "w-full rounded-md transition-all duration-500",
                  i === WEEK_BARS.length - 1 ? "bg-success" : "bg-foreground/[0.08]"
                )}
                style={{ height: `${bar}%` }}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2 sm:gap-3">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className={cn("flex-1 text-center text-[10px] tabular-nums", i === 6 ? "font-semibold text-foreground" : "text-muted-foreground/70")}>
              {d}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-success" />
            Today
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-foreground/[0.08]" />
            Past days
          </div>
        </div>
      </div>
    </div>
  )
}

function TasksPanel() {
  const { ref, offset } = useParallax(0.1)
  const tasks = [
    { label: "Finish design review", done: true },
    { label: "Outline chapter three", done: true },
    { label: "Deep focus on the report", done: true },
    { label: "Review focus music library", done: false },
    { label: "Plan tomorrow's sessions", done: false },
  ]
  return (
    <div ref={ref} className="w-full" style={{ transform: `translateY(${offset}px)` }}>
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-7 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ListTodoIcon size={15} />
            </span>
            <p className="truncate text-sm font-semibold text-foreground">Today&apos;s tasks</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">3 / 5 done</span>
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div className="h-full w-3/5 rounded-full bg-primary" />
        </div>

        <div className="mt-4 space-y-1">
          {tasks.map((task) => (
            <div key={task.label} className="flex items-center gap-3 rounded-lg px-2 py-2">
              <span className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-full",
                task.done ? "bg-success text-success-foreground" : "border border-border"
              )}>
                {task.done && <CheckIcon size={10} />}
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-sm", task.done ? "text-muted-foreground line-through" : "text-foreground")}>
                {task.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Feature Card ─── */

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="group h-full rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-soft">
      <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors duration-300 group-hover:bg-primary/[0.06] group-hover:text-foreground">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  )
}

/* ─── FAQ ─── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-foreground transition-colors hover:text-foreground/80"
      >
        <span className="min-w-0">{q}</span>
        <span className={cn("shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </button>
      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="min-h-0 overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Navbar ─── */

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border/20 bg-background/80 px-4 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold tracking-tight">
          SW
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:block">Study Workspace</span>
      </div>

      <div className="hidden items-center gap-7 md:flex">
        <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
        <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
      </div>

      <div className="flex items-center gap-2.5">
        {isLoading ? (
          <Button disabled size="sm"><Loader2Icon className="animate-spin" size={14} /></Button>
        ) : isAuthenticated ? (
          <Link href="/dashboard"><Button size="sm" className="gap-1.5">Dashboard <ArrowRightIcon size={14} /></Button></Link>
        ) : (
          <>
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/register"><Button size="sm">Sign up</Button></Link>
          </>
        )}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="absolute left-0 right-0 top-16 flex flex-col gap-1 border-b border-border/20 bg-background/95 p-4 backdrop-blur-xl md:hidden">
          <a href="#features" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm text-foreground">Features</a>
          <a href="#faq" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm text-foreground">FAQ</a>
        </div>
      )}
    </nav>
  )
}

/* ─── Page ─── */

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  const heroCta = isLoading ? (
    <Button size="lg" disabled className="h-11 px-6"><Loader2Icon className="animate-spin" size={16} />Loading...</Button>
  ) : isAuthenticated ? (
    <Link href="/dashboard"><Button size="lg" className="h-11 gap-2 px-6 hover:-translate-y-px">Open Dashboard <ArrowRightIcon size={16} /></Button></Link>
  ) : (
    <Link href="/register"><Button size="lg" className="h-11 gap-2 px-6 hover:-translate-y-px">Start free <ArrowRightIcon size={16} /></Button></Link>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-32 sm:px-8">
        <div className="mx-auto w-full max-w-3xl text-center">
          <div className="mb-6 flex animate-slide-in items-center justify-center" style={{ animationDelay: "0.05s" }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" />
              A calm workspace for deep work
            </span>
          </div>

          <h1 className="animate-slide-in text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl" style={{ animationDelay: "0.1s" }}>
            Your focus is
            <span className="block text-muted-foreground">everything.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl animate-slide-in text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: "0.18s" }}>
            Pomodoro, deep focus sessions, and quiet analytics — everything you need to do your best work, in one calm place.
          </p>

          <div className="mt-9 flex animate-slide-in flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.26s" }}>
            {heroCta}
            {!isLoading && !isAuthenticated && (
              <Link href="/login"><Button variant="outline" size="lg" className="h-11 px-6 hover:-translate-y-px">Log in</Button></Link>
            )}
          </div>
        </div>

        <div className="mx-auto mt-16 w-full max-w-3xl animate-slide-in px-0 sm:mt-20" style={{ animationDelay: "0.34s" }}>
          <PomodoroPanel />
        </div>
      </section>

      {/* ─── Manifesto ─── */}
      <section className="border-t border-border/20 px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <Eyebrow>Why it exists</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.12] tracking-[-0.025em] text-foreground sm:text-5xl">
              Focus is a practice,
              <br className="hidden sm:block" />
              <span className="text-muted-foreground">not a feature.</span>
            </h2>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Study Workspace strips away the noise — the timers, distractions, and half-baked dashboards — so you can build the habit, one session at a time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="border-t border-border/20 px-4 py-28 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="max-w-2xl">
              <Eyebrow>What&apos;s inside</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">A focused toolkit. Nothing more.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Four quiet tools that work together — a timer, a focus mode, music, and analytics that stay out of your way.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <TimerIcon size={16} />, title: "Pomodoro Timer", description: "Work in 25-minute blocks with automatic breaks, session history, and daily goals." },
              { icon: <FocusIcon size={16} />, title: "Deep Focus Mode", description: "Strict mode locks you in. Distraction tracking and clear summaries keep you honest." },
              { icon: <BarChart3Icon size={16} />, title: "Analytics & Insights", description: "Focus minutes, streaks, and trends — clear numbers, presented quietly." },
              { icon: <ListTodoIcon size={16} />, title: "Task Management", description: "Prioritize, filter, and check off tasks without leaving your flow." },
              { icon: <MusicIcon size={16} />, title: "Focus Music", description: "Ambient audio that starts and stops with your sessions." },
              { icon: <TargetIcon size={16} />, title: "Productivity Score", description: "A daily score that turns your habits into something you can see." },
            ].map((feature, i) => (
              <Reveal key={feature.title} delay={i * 60} className="h-full">
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Editorial: Analytics ─── */}
      <section className="border-t border-border/20 px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Analytics</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">
                Numbers that respect your attention
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                See the shape of your day — focus minutes, completed sessions, and streaks — without the gamified noise.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Focus minutes per day, week, and month",
                  "Completion rates and streak history",
                  "A single daily productivity score",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/[0.06] text-foreground">
                      <CheckIcon size={11} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div>
            <Reveal delay={120}>
              <ChartPanel />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── Editorial: Tasks & Music ─── */}
      <section className="border-t border-border/20 px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <Reveal delay={120}>
              <TasksPanel />
            </Reveal>
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow>Tasks & Music</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">
                Everything, in the same calm place
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
                Your tasks live next to your sessions. Ambient music follows your focus mode automatically — no tab-hopping.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Priority and status filtering, in-line with your work",
                  "Ambient audio tied to your focus sessions",
                  "A single workspace from first pomodoro to last task",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/[0.06] text-foreground">
                      <CheckIcon size={11} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="border-t border-border/20 px-4 py-28 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="text-center">
              <Eyebrow>Questions</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl">Frequently asked</h2>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10 rounded-xl border border-border/50 bg-card px-6 py-2 shadow-soft">
              <FAQItem q="Is Study Workspace free?" a="Yes. The workspace is free to use — Pomodoro timer, focus sessions, analytics, and task management are all included." />
              <FAQItem q="How does Deep Focus Mode work?" a="Deep Focus Mode locks you into a session with an optional strict mode, which prevents navigation away from the workspace. Violations end the session." />
              <FAQItem q="Can I use my own music?" a="You can upload any audio track to the Music section. The built-in ambient tracks are included too." />
              <FAQItem q="Is my data private?" a="Yes. Your data is encrypted in transit and at rest. We never share or sell your personal information." />
              <FAQItem q="What makes this different from a plain timer?" a="Your sessions, tasks, music, and focus time live in one place — so progress becomes visible, not just measured." />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border/20 px-4 py-28 sm:px-8 sm:py-36">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Eyebrow>Get started</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-5xl">
              Ready to focus?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              Your next deep work session is one click away.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              {heroCta}
              {!isLoading && !isAuthenticated && (
                <Link href="/login"><Button variant="outline" size="lg" className="h-11 px-6 hover:-translate-y-px">Log in</Button></Link>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/20 px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold">
              SW
            </div>
            <span className="text-sm text-muted-foreground">Study Workspace</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Study Workspace. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">Terms</a>
            <a href="#" className="text-xs text-muted-foreground/60 transition-colors hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
