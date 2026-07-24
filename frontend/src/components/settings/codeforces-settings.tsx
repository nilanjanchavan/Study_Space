"use client"

import { useState } from "react"
import { SettingsSection } from "./settings-section"
import { useCodeforcesSettings } from "@/hooks/use-settings"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { codeforcesApi } from "@/services/codeforces"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { RefreshCwIcon, LinkIcon, UnlinkIcon } from "lucide-react"

export function CodeforcesSettings() {
  const [settings, updateSettings] = useCodeforcesSettings()
  const [handleInput, setHandleInput] = useState("")
  const queryClient = useQueryClient()

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["codeforces", "profile"],
    queryFn: () => codeforcesApi.getProfile(),
    staleTime: 60_000,
  })

  const profile = profileData?.data.profile

  const upsertMutation = useMutation({
    mutationFn: (handle: string) => codeforcesApi.upsertProfile(handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codeforces", "profile"] })
      setHandleInput("")
      toast.success("Codeforces handle linked")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to link handle")
    },
  })

  const syncMutation = useMutation({
    mutationFn: () => codeforcesApi.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codeforces", "profile"] })
      toast.success("Profile synced")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Sync failed")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => codeforcesApi.deleteProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codeforces", "profile"] })
      toast.success("Handle unlinked")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to unlink")
    },
  })

  return (
    <SettingsSection
      title="Codeforces"
      description="Track your competitive programming progress."
    >
      {profileLoading ? (
        <div className="text-sm text-muted-foreground">Loading profile...</div>
      ) : profile ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon size={14} className="text-emerald-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <Badge variant="secondary">{profile.codeforcesHandle}</Badge>
          </div>

          {profile.rating !== null && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Rating</span>
                <span className="ml-2 font-medium">{profile.rating}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Rating</span>
                <span className="ml-2 font-medium">{profile.maxRating}</span>
              </div>
              {profile.rank && (
                <div>
                  <span className="text-muted-foreground">Rank</span>
                  <span className="ml-2 font-medium">{profile.rank}</span>
                </div>
              )}
              {profile.lastSyncedAt && (
                <div>
                  <span className="text-muted-foreground">Last Synced</span>
                  <span className="ml-2 font-medium">
                    {new Date(profile.lastSyncedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCwIcon size={14} className={syncMutation.isPending ? "animate-spin" : ""} />
              Sync Now
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <UnlinkIcon size={14} />
              Unlink
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">No Codeforces handle linked.</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="cf-handle">Codeforces Handle</Label>
              <Input
                id="cf-handle"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                placeholder="e.g. tourist"
                className="mt-1"
              />
            </div>
            <Button
              onClick={() => handleInput.trim() && upsertMutation.mutate(handleInput.trim())}
              disabled={!handleInput.trim() || upsertMutation.isPending}
            >
              <LinkIcon size={14} />
              Link
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Auto-sync</p>
          <p className="text-xs text-muted-foreground">Automatically sync profile on login.</p>
        </div>
        <Switch
          checked={settings.autoSync}
          onCheckedChange={(v) => updateSettings({ autoSync: v })}
        />
      </div>
    </SettingsSection>
  )
}
