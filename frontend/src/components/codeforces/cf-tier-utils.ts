export interface CfTier {
  name: string
  color: string
  badgeClass: string
  textClass: string
  borderClass: string
}

export function getCfTier(rating: number | null): CfTier {
  if (rating === null || rating === undefined) {
    return {
      name: "Unrated",
      color: "#9ca3af",
      badgeClass: "bg-muted text-muted-foreground border-border",
      textClass: "text-muted-foreground",
      borderClass: "border-border",
    }
  }

  if (rating < 1200) {
    return {
      name: "Newbie",
      color: "#9ca3af",
      badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      textClass: "text-slate-400",
      borderClass: "border-slate-500/30",
    }
  }
  if (rating < 1400) {
    return {
      name: "Pupil",
      color: "#22c55e",
      badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      textClass: "text-emerald-500",
      borderClass: "border-emerald-500/30",
    }
  }
  if (rating < 1600) {
    return {
      name: "Specialist",
      color: "#06b6d4",
      badgeClass: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      textClass: "text-cyan-500",
      borderClass: "border-cyan-500/30",
    }
  }
  if (rating < 1900) {
    return {
      name: "Expert",
      color: "#3b82f6",
      badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      textClass: "text-blue-500",
      borderClass: "border-blue-500/30",
    }
  }
  if (rating < 2100) {
    return {
      name: "Candidate Master",
      color: "#a855f7",
      badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      textClass: "text-purple-500",
      borderClass: "border-purple-500/30",
    }
  }
  if (rating < 2300) {
    return {
      name: "Master",
      color: "#f59e0b",
      badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      textClass: "text-amber-500",
      borderClass: "border-amber-500/30",
    }
  }
  if (rating < 2400) {
    return {
      name: "International Master",
      color: "#f97316",
      badgeClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      textClass: "text-orange-500",
      borderClass: "border-orange-500/30",
    }
  }
  if (rating < 2600) {
    return {
      name: "Grandmaster",
      color: "#ef4444",
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
      textClass: "text-red-500",
      borderClass: "border-red-500/30",
    }
  }
  if (rating < 3000) {
    return {
      name: "International Grandmaster",
      color: "#dc2626",
      badgeClass: "bg-red-600/10 text-red-600 border-red-600/20",
      textClass: "text-red-600",
      borderClass: "border-red-600/30",
    }
  }
  return {
    name: "Legendary Grandmaster",
    color: "#b91c1c",
    badgeClass: "bg-red-700/10 text-red-700 border-red-700/20",
    textClass: "text-red-700 font-bold",
    borderClass: "border-red-700/30",
  }
}
