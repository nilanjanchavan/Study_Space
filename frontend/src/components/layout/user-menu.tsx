"use client"

import { useAuth } from "@/providers/auth-provider"
import { useLogout } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOutIcon, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function UserMenu() {
  const { user } = useAuth()
  const logout = useLogout()
  const router = useRouter()

  const initials = user
    ? (user.name || user.username || user.email)
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out")
        router.push("/login")
      },
      onError: () => toast.error("Failed to log out"),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md p-1.5 hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start text-left min-w-0">
          <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
            {user?.name || user?.username}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">
            {user?.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{user?.name || user?.username}</p>
            <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-muted-foreground cursor-default">
          <UserIcon />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
