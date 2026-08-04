export interface Track {
  id: string
  name: string
  file: string
  category: "nature" | "ambient" | "urban"
}

export const TRACKS: Track[] = [
  { id: "rain", name: "Rain", file: "/music/rain.mp3", category: "nature" },
  { id: "forest", name: "Forest", file: "/music/forest.mp3", category: "nature" },
  { id: "fireplace", name: "Fireplace", file: "/music/fireplace.mp3", category: "ambient" },
  { id: "white-noise", name: "White Noise", file: "/music/white-noise.mp3", category: "ambient" },
  { id: "ocean", name: "Ocean", file: "/music/ocean.mp3", category: "nature" },
  { id: "cafe", name: "Cafe", file: "/music/cafe.mp3", category: "urban" },
  { id: "night", name: "Night", file: "/music/night.mp3", category: "nature" },
  { id: "wind", name: "Wind", file: "/music/wind.mp3", category: "nature" },
]

export const BREAK_TRACKS: Track[] = [
  TRACKS.find((t) => t.id === "forest")!,
  TRACKS.find((t) => t.id === "rain")!,
  TRACKS.find((t) => t.id === "ocean")!,
  TRACKS.find((t) => t.id === "wind")!,
  TRACKS.find((t) => t.id === "night")!,
]

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id)
}
