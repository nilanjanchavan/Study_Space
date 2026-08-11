"use client"

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  /** Transition delay in ms (used for staggered entrances) */
  delay?: number
  /** Initial vertical offset in px */
  y?: number
  /** Initial horizontal offset in px */
  x?: number
  /** Initial scale */
  scale?: number
  /** Blur the element before it enters */
  blur?: boolean
  /** Only reveal once (default) or re-run every time it enters the viewport */
  once?: boolean
  className?: string
  as?: ElementType
}

/**
 * Scroll-triggered reveal. Combines translate, scale and optional blur with a
 * spring-like ease. Honors prefers-reduced-motion by rendering visible.
 */
function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  scale = 0.985,
  blur = true,
  once = true,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.opacity = "1"
      el.style.transform = "none"
      el.style.filter = "none"
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [once])

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? "none" : `translate(${x}px, ${y}px) scale(${scale})`,
    filter: blur && !visible ? "blur(8px)" : "none",
    willChange: "opacity, transform, filter",
  }

  return (
    <Tag
      ref={ref}
      style={style}
      className={cn(
        "transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
    >
      {children}
    </Tag>
  )
}

export { Reveal, type RevealProps }
