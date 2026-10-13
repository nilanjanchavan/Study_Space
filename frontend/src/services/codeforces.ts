import api from "@/lib/api"

export interface CodeforcesStats {
  totalSolved: number
  solvedToday: number
  streak: {
    current: number
    longest: number
  }
  calendar: Record<string, number>
  ratingHistory: Array<{
    contestId: number
    contestName: string
    rank: number
    oldRating: number
    newRating: number
    ratingUpdateTimeSeconds: number
  }>
  ratingDistribution: Array<{ bracket: string; count: number }>
  topicTags: Array<{ tag: string; count: number }>
  recentSolved: Array<{
    id: string
    name: string
    contestId: number
    index: string
    rating: number | null
    tags: string[]
    solvedAt: number
  }>
  upcomingContests: Array<{
    id: number
    name: string
    durationSeconds: number
    startTimeSeconds: number
  }>
}

export interface CodeforcesProfile {
  id: string
  codeforcesHandle: string
  rating: number | null
  maxRating: number | null
  rank: string | null
  maxRank: string | null
  contribution: number | null
  avatar: string | null
  titlePhoto: string | null
  stats: CodeforcesStats | null
  lastSyncedAt: string | null
  createdAt: string
  updatedAt: string
}

export const codeforcesApi = {
  async getProfile(): Promise<{ success: boolean; data: { profile: CodeforcesProfile | null } }> {
    const response = await api.get("/api/codeforces/profile")
    return response.data
  },

  async upsertProfile(handle: string): Promise<{ success: boolean; data: { profile: CodeforcesProfile } }> {
    const response = await api.put("/api/codeforces/profile", { handle })
    return response.data
  },

  async sync(): Promise<{ success: boolean; data: { profile: CodeforcesProfile } }> {
    const response = await api.post("/api/codeforces/sync")
    return response.data
  },

  async deleteProfile(): Promise<void> {
    await api.delete("/api/codeforces/profile")
  },
}
