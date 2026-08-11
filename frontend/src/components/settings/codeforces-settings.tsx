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
import { RefreshCwIcon, LinkIcon, UnlinkIcon, CheckCircle2Icon } from "lucide-react"

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
      description="Track your competitive programming progress"
    >
      {profileLoading ? (
        <div className="text-sm text-muted-foreground py-2">Loading profile...</div>
      ) : profile ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Connected</span>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400">
                <CheckCircle2Icon size={14} />
              </span>
            </div>
            <Badge variant="secondary" className="font-mono text-xs truncate max-w-[120px]">{profile.codeforcesHandle}</Badge>
          </div>

          {profile.rating !== null && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Rating", value: profile.rating },
                { label: "Max Rating", value: profile.maxRating },
                profile.rank && { label: "Rank", value: profile.rank },
                profile.lastSyncedAt && {
                  label: "Last Synced",
                  value: new Date(profile.lastSyncedAt).toLocaleDateString(),
                },
              ]
                .filter(Boolean)
                .map((item) => item && (
                  <div key={item.label} className="min-w-0 rounded-lg border border-border/50 bg-card/50 px-3 py-2 dark:bg-white/[0.03]">
                    <p className="truncate text-[11px] text-muted-foreground">{item.label}</p>
                    <p className="truncate text-sm font-medium text-foreground tabular-nums">{item.value}</p>
                  </div>
                ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className="gap-2"
            >
              Sync Now
              <RefreshCwIcon size={13} className={syncMutation.isPending ? "animate-spin" : ""} />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="gap-2"
            >
              Unlink
              <UnlinkIcon size={13} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">No Codeforces handle linked.</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="cf-handle" className="text-xs">Codeforces Handle</Label>
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
              className="gap-2"
            >
              Link
              <LinkIcon size={13} />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card/50 px-3 py-2.5 dark:bg-white/[0.03]">
        <div>
          <p className="text-sm font-medium text-foreground">Auto-sync</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sync profile on login</p>
        </div>
        <Switch
          checked={settings.autoSync}
          onCheckedChange={(v) => updateSettings({ autoSync: v })}
        />
      </div>
    </SettingsSection>
  )
}
