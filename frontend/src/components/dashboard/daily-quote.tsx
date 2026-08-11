"use client"

import { useState } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { QuoteIcon } from "lucide-react"

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
]

function useDailyQuote() {
  const [quote] = useState(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    return QUOTES[dayOfYear % QUOTES.length]
  })
  return quote
}

export function DailyQuote() {
  const quote = useDailyQuote()

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Daily Quote"
        className="mb-3"
        accent={{ icon: <QuoteIcon size={14} />, className: "bg-indigo-500/10 text-indigo-500" }}
      />
      <blockquote className="text-sm text-foreground/80 leading-relaxed italic break-words">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-xs text-muted-foreground/60 mt-2.5">&mdash; {quote.author}</p>
    </GlassCard>
  )
}
