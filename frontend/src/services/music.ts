import api from "@/lib/api"

export interface MusicPreference {
  id: string
  source: string
  volume: number
  isAutoplay: boolean
  customPlaylistUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateMusicRequest {
  source?: string
  volume?: number
  isAutoplay?: boolean
  customPlaylistUrl?: string | null
}

export const musicApi = {
  async getPreferences(): Promise<{ success: boolean; data: { preference: MusicPreference } }> {
    const response = await api.get("/api/music/preferences")
    return response.data
  },

  async updatePreferences(data: UpdateMusicRequest): Promise<{ success: boolean; data: { preference: MusicPreference } }> {
    const response = await api.patch("/api/music/preferences", data)
    return response.data
  },
}
