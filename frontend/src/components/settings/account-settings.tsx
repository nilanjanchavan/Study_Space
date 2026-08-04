"use client"

import { useAuth } from "@/providers/auth-provider"
import { useLogout } from "@/hooks/use-auth"
import { SettingsSection } from "./settings-section"
import { SoftCard } from "@/components/design-system/soft-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOutIcon, LockIcon, ImageIcon } from "lucide-react"

export function AccountSettings() {
  const { user } = useAuth()
  const logoutMutation = useLogout()

  const initials = user
    ? (user.name ?? user.username).slice(0, 2).toUpperCase()
    : "??"

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        window.location.href = "/login"
      },
    })
  }

  return (
    <SettingsSection
      title="Account"
      description="Manage your account settings"
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-12 ring-2 ring-primary/10">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name ?? user?.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Username", value: user?.username },
          { label: "Role", value: user?.role?.toLowerCase() },
          { label: "Email Verified", value: user?.isEmailVerified ? "Yes" : "No" },
          { label: "Joined", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—" },
        ].map((item) => (
          <div key={item.label} className="min-w-0 rounded-lg bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider truncate">{item.label}</p>
            <p className="text-sm font-medium text-foreground mt-0.5 truncate">{item.value}</p>
          </div>
        ))}
      </div>

      <Button
        variant="destructive"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="gap-1.5"
      >
        <LogOutIcon size={14} />
        {logoutMutation.isPending ? "Logging out..." : "Log Out"}
      </Button>

      <div className="border-t border-border/50 pt-4">
        <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">Coming Soon</p>
        <div className="grid grid-cols-2 gap-3">
          <SoftCard className="p-3 opacity-60">
            <div className="flex items-center gap-2 mb-1">
              <LockIcon size={12} className="text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Change Password</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Coming soon</p>
          </SoftCard>
          <SoftCard className="p-3 opacity-60">
            <div className="flex items-center gap-2 mb-1">
              <ImageIcon size={12} className="text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Edit Avatar</p>
            </div>
            <p className="text-[11px] text-muted-foreground">Coming soon</p>
          </SoftCard>
        </div>
      </div>
    </SettingsSection>
  )
}
