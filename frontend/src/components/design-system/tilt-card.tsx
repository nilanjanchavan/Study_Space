import { useRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  maxTilt?: number
  scale?: number
  glare?: boolean
}

/**
 * 3D hover tilt card. Tracks the pointer to apply subtle rotateX/rotateY
 * transforms with a soft radial glare. Disables itself under
 * prefers-reduced-motion.
 */
function TiltCard({ className, children, maxTilt = 8, scale = 1.02, glare = true, ...props }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - py) * maxTilt
    const ry = (px - 0.5) * maxTilt
    el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`)
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`)
  }

  const handlePointerLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ""
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative [transform-style:preserve-3d] transition-transform duration-200 ease-out will-change-transform",
        glare &&
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-300 after:bg-[radial-gradient(14rem_10rem_at_var(--gx,50%)_var(--gy,50%),oklch(1_0_0/0.28),transparent_60%)] hover:after:opacity-100 dark:after:bg-[radial-gradient(14rem_10rem_at_var(--gx,50%)_var(--gy,50%),oklch(1_0_0/0.12),transparent_60%)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
TiltCard.displayName = "TiltCard"

export { TiltCard, type TiltCardProps }
