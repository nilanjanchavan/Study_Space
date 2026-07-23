"use client"

import { useAuth } from "@/providers/auth-provider"
import { useLogout } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2Icon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const logout = useLogout()
  const router = useRouter()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out")
        router.push("/login")
      },
      onError: () => {
        toast.error("Failed to log out")
      },
    })
  }

  return (
    <div className="flex flex-1 items-start justify-center bg-background px-4 py-12">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome, {user?.name || user?.username}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <LogOutIcon />
            )}
            Log out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are logged in as{" "}
              <span className="font-medium text-foreground">{user?.email}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
