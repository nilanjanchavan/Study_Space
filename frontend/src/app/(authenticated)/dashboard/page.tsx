"use client"

import { PageContainer } from "@/components/design-system/layout"
import { useAuth } from "@/providers/auth-provider"
import { useDailyAnalytics, useStreakAnalytics } from "@/hooks/use-analytics"
import { useCurrentPomodoro } from "@/hooks/use-pomodoro"
import { useCurrentFocus } from "@/hooks/use-focus"
import { HeroSection } from "@/components/dashboard/hero-section"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { ResumeSessionWidget } from "@/components/dashboard/resume-session-widget"
import { MusicWidget } from "@/components/dashboard/music-widget"
import { TodaysTasks } from "@/components/dashboard/todays-tasks"
import { WeeklyGoals } from "@/components/dashboard/weekly-goals"
import { DailyQuote } from "@/components/dashboard/daily-quote"
import { WeeklyHeatmap } from "@/components/dashboard/weekly-heatmap"
import { ProductivityScore } from "@/components/dashboard/productivity-score"
import { Insights } from "@/components/dashboard/insights"
import { AchievementsPreview } from "@/components/dashboard/achievements-preview"
import { ActivityTimeline } from "@/components/dashboard/activity-timeline"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: daily } = useDailyAnalytics()
  const { data: currentPomodoro } = useCurrentPomodoro()
  const { data: currentFocus } = useCurrentFocus()
  const { data: streak } = useStreakAnalytics()

  const dailyStats = daily?.data
  const streakData = streak?.data
  const displayName = user?.name || user?.username || "there"

  const hasActiveSession = !!(
    currentPomodoro?.data.session &&
    (currentPomodoro.data.session.status === "RUNNING" ||
      currentPomodoro.data.session.status === "PAUSED")
  ) || !!(
    currentFocus?.data.session &&
    (currentFocus.data.session.status === "RUNNING" ||
      currentFocus.data.session.status === "PAUSED")
  )

  return (
    <PageContainer maxWidth="xl">
      <HeroSection
        dailyStats={dailyStats}
        hasActiveSession={hasActiveSession}
        currentStreak={streakData?.currentStreak ?? 0}
        displayName={displayName}
      />

      {/* Row 2: Stats | Session | Music */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <QuickStats />
        </div>
        <div className="lg:col-span-4">
          <ResumeSessionWidget />
        </div>
        <div className="lg:col-span-4">
          <MusicWidget />
        </div>
      </div>

      {/* Row 3: Tasks | Goals | Quote */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TodaysTasks />
        </div>
        <div className="lg:col-span-4">
          <WeeklyGoals />
        </div>
        <div className="lg:col-span-3">
          <DailyQuote />
        </div>
      </div>

      {/* Row 4: Heatmap */}
      <div className="mt-5">
        <WeeklyHeatmap />
      </div>

      {/* Row 5: Score | Insights | Achievements */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <ProductivityScore />
        </div>
        <div className="lg:col-span-5">
          <Insights />
        </div>
        <div className="lg:col-span-3">
          <AchievementsPreview />
        </div>
      </div>

      {/* Row 6: Timeline */}
      <div className="mt-5 pb-8">
        <ActivityTimeline />
      </div>
    </PageContainer>
  )
}
