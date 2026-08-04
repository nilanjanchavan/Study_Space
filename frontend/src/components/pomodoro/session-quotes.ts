export const SESSION_QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It is not enough to be busy. The question is: what are we busy about?", author: "Henry David Thoreau" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "You don't have to see the whole staircase, just take the first step.", author: "Martin Luther King Jr." },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Your mind is a garden, your thoughts are the seeds.", author: "William Wordsworth" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
]

const STORAGE_KEY = "pomodoro-quote-index"

export function getQuoteIndex(): number {
  if (typeof window === "undefined") return 0
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0
  } catch {
    return 0
  }
}

export function advanceQuoteIndex(): number {
  const current = getQuoteIndex()
  const next = (current + 1) % SESSION_QUOTES.length
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch { /* ignore */ }
  }
  return next
}

export function getQuoteForIndex(index: number) {
  return SESSION_QUOTES[index % SESSION_QUOTES.length]
}
