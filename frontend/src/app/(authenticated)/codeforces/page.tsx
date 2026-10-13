"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { codeforcesApi } from "@/services/codeforces"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { CfHeader } from "@/components/codeforces/cf-header"
import { CfDailyGoal } from "@/components/codeforces/cf-daily-goal"
import { CfCalendarHeatmap } from "@/components/codeforces/cf-calendar-heatmap"
import { CfRatingChart } from "@/components/codeforces/cf-rating-chart"
import { CfAnalytics } from "@/components/codeforces/cf-analytics"
import { CfRecentSolved } from "@/components/codeforces/cf-recent-solved"
import { CfUpcomingContests } from "@/components/codeforces/cf-upcoming-contests"
import { CfUnlinkedState } from "@/components/codeforces/cf-unlinked-state"
import { toast } from "sonner"

export default function CodeforcesPage() {
  const queryClient = useQueryClient()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["codeforces", "profile"],
    queryFn: () => codeforcesApi.getProfile(),
    staleTime: 60_000,
  })

  const syncMutation = useMutation({
    mutationFn: () => codeforcesApi.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codeforces", "profile"] })
      toast.success("Codeforces profile & stats updated")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to sync Codeforces data")
    },
  })

  const linkMutation = useMutation({
    mutationFn: (handle: string) => codeforcesApi.upsertProfile(handle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codeforces", "profile"] })
      toast.success("Codeforces handle linked & synced!")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to link handle")
    },
  })

  const profile = profileData?.data.profile

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl">
        <SectionHeader
          title="Codeforces"
          subtitle="Monitor problem solving consistency, contest ratings, and upcoming rounds"
        />
        <Skeleton className="w-full h-44 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Skeleton className="w-full h-48 rounded-2xl" />
          <Skeleton className="w-full h-48 rounded-2xl" />
        </div>
        <Skeleton className="w-full h-64 rounded-2xl" />
      </div>
    )
  }

  if (!profile || !profile.codeforcesHandle) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl">
        <SectionHeader
          title="Codeforces"
          subtitle="Monitor problem solving consistency, contest ratings, and upcoming rounds"
        />
        <CfUnlinkedState
          onLink={(handle) => linkMutation.mutate(handle)}
          isLinking={linkMutation.isPending}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-10">
      <SectionHeader
        title="Codeforces"
        subtitle="Monitor problem solving consistency, contest ratings, and upcoming rounds"
      />

      {/* Profile summary header */}
      <CfHeader
        profile={profile}
        onSync={() => syncMutation.mutate()}
        isSyncing={syncMutation.isPending}
      />

      {/* Daily Goal & Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <CfDailyGoal stats={profile.stats} />
        </div>
        <div className="lg:col-span-2">
          <CfUpcomingContests contests={profile.stats?.upcomingContests} />
        </div>
      </div>

      {/* Activity Heatmap / Questions Solved Calendar */}
      <CfCalendarHeatmap calendar={profile.stats?.calendar} />

      {/* Rating Progression Map */}
      <CfRatingChart
        ratingHistory={profile.stats?.ratingHistory}
        currentRating={profile.rating}
        maxRating={profile.maxRating}
      />

      {/* Difficulty & Topic Analytics */}
      <CfAnalytics
        ratingDistribution={profile.stats?.ratingDistribution}
        topicTags={profile.stats?.topicTags}
      />

      {/* Recent Solved Feed */}
      <CfRecentSolved problems={profile.stats?.recentSolved} />
    </div>
  )
}
