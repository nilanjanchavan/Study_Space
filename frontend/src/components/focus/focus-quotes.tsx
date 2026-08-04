"use client"

import { useState } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { QuoteIcon } from "lucide-react"

const FOCUS_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
]

export function FocusQuotes() {
  const [index] = useState(() => Math.floor(Math.random() * FOCUS_QUOTES.length))

  const quote = FOCUS_QUOTES[index]

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <QuoteIcon size={14} className="text-muted-foreground/40" />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Inspiration</h3>
      </div>
      <blockquote className="text-sm text-foreground/80 leading-relaxed italic break-words">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <p className="text-xs text-muted-foreground/50 mt-2.5">&mdash; {quote.author}</p>
    </GlassCard>
  )
}
