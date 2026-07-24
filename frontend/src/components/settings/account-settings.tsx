"use client"

import { useAuth } from "@/providers/auth-provider"
import { useLogout } from "@/hooks/use-auth"
import { SettingsSection } from "./settings-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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
      description="Manage your account settings."
    >
      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name ?? user?.username}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">Username</span>
          <p className="font-medium">{user?.username}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Role</span>
          <p className="font-medium capitalize">{user?.role?.toLowerCase()}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Email Verified</span>
          <p className="font-medium">{user?.isEmailVerified ? "Yes" : "No"}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Joined</span>
          <p className="font-medium">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
          </p>
        </div>
      </div>

      <Button
        variant="destructive"
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
      >
        <LogOutIcon size={14} />
        {logoutMutation.isPending ? "Logging out..." : "Log Out"}
      </Button>

      <Separator />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Coming Soon</p>
        <div className="grid grid-cols-2 gap-3">
          <Card size="sm" className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs">
                <LockIcon size={12} />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
          <Card size="sm" className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xs">
                <ImageIcon size={12} />
                Edit Avatar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SettingsSection>
  )
}
