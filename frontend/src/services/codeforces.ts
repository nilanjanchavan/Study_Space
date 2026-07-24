import api from "@/lib/api"

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
