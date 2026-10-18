"use client"

import { useState } from "react"
import { SectionHeader } from "@/components/design-system/layout"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { PomodoroSettings } from "@/components/settings/pomodoro-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { MusicSettings } from "@/components/settings/music-settings"
import { FocusSettings } from "@/components/settings/focus-settings"
import { CodeforcesSettings } from "@/components/settings/codeforces-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { SettingsIcon, LayersIcon, UserIcon, TimerIcon, BellIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SettingsTab = "all" | "profile" | "focus" | "integrations"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("all")

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All Settings", icon: <LayersIcon size={14} /> },
    { id: "profile", label: "Account & Theme", icon: <UserIcon size={14} /> },
    { id: "focus", label: "Focus & Timers", icon: <TimerIcon size={14} /> },
    { id: "integrations", label: "Alerts & Sync", icon: <BellIcon size={14} /> },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full pb-10">
      <SectionHeader
        title="Settings"
        subtitle="Manage your account profile, study parameters, and integrations"
        accent={{
          icon: <SettingsIcon size={14} />,
          className: "bg-primary/10 text-primary",
        }}
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 shrink-0 select-none",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                  : "bg-card/70 text-muted-foreground hover:text-foreground hover:bg-card border border-black/[0.04] dark:border-white/[0.06] backdrop-blur-sm"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab views */}
      {activeTab === "all" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="flex flex-col gap-6">
            <AccountSettings />
            <AppearanceSettings />
            <NotificationSettings />
          </div>
          <div className="flex flex-col gap-6">
            <PomodoroSettings />
            <FocusSettings />
            <MusicSettings />
            <CodeforcesSettings />
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <AccountSettings />
          <AppearanceSettings />
        </div>
      )}

      {activeTab === "focus" && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <PomodoroSettings />
          <FocusSettings />
          <MusicSettings />
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <NotificationSettings />
          <CodeforcesSettings />
        </div>
      )}
    </div>
  )
}
