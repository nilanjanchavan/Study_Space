"use client"

import { PageHeader } from "@/components/common/page-header"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { PomodoroSettings } from "@/components/settings/pomodoro-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { MusicSettings } from "@/components/settings/music-settings"
import { FocusSettings } from "@/components/settings/focus-settings"
import { CodeforcesSettings } from "@/components/settings/codeforces-settings"
import { AccountSettings } from "@/components/settings/account-settings"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Customize your workspace preferences."
      />

      <div className="flex flex-col gap-6 max-w-2xl">
        <AccountSettings />
        <AppearanceSettings />
        <PomodoroSettings />
        <NotificationSettings />
        <MusicSettings />
        <FocusSettings />
        <CodeforcesSettings />
      </div>
    </div>
  )
}
