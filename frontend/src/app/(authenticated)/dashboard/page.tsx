"use client"

import { useAuth } from "@/providers/auth-provider"
import { useDashboardAnalytics } from "@/hooks/use-analytics"
import { useTodos } from "@/hooks/use-todos"
import { PageHeader } from "@/components/common/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
import { PriorityBadge } from "@/components/todo/priority-badge"
import { StatusBadge } from "@/components/todo/status-badge"
import {
  CheckSquareIcon,
  CheckCircle2Icon,
  TimerIcon,
  FocusIcon,
  CircleDotIcon,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number | string
  icon: React.ComponentType<{ size?: number; className?: string }>
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
          </div>
          <Icon size={20} className="text-muted-foreground/50" />
        </div>
      </CardContent>
    </Card>
  )
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-10" />
          </div>
          <Skeleton className="h-5 w-5 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: analytics, isLoading: analyticsLoading } = useDashboardAnalytics()
  const { data: recentTodos, isLoading: todosLoading } = useTodos({ limit: 5, sortBy: "createdAt", sortOrder: "desc" })

  const stats = analytics?.data

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <PageHeader
        title={`Welcome back${user?.name ? `, ${user.name}` : user?.username ? `, ${user.username}` : ""}`}
        description="Here's an overview of your productivity."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              label="Total Todos"
              value={stats.todos.totalTodos}
              icon={CheckSquareIcon}
            />
            <StatCard
              label="Completed"
              value={stats.todos.completedTodos}
              icon={CheckCircle2Icon}
            />
            <StatCard
              label="Pomodoros"
              value={stats.pomodoros.completedPomodoros}
              icon={TimerIcon}
            />
            <StatCard
              label="Focus Minutes"
              value={stats.pomodoros.totalFocusMinutes}
              icon={FocusIcon}
            />
          </>
        ) : (
          <>
            <StatCard label="Total Todos" value={0} icon={CheckSquareIcon} />
            <StatCard label="Completed" value={0} icon={CheckCircle2Icon} />
            <StatCard label="Pomodoros" value={0} icon={TimerIcon} />
            <StatCard label="Focus Minutes" value={0} icon={FocusIcon} />
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Recent Todos</h2>
          <Link href="/todos">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View all
            </Button>
          </Link>
        </div>

        {todosLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recentTodos?.data.todos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CircleDotIcon size={32} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No todos yet.</p>
              <Link href="/todos">
                <Button variant="link" size="sm" className="mt-1 h-auto p-0">
                  Create your first todo
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentTodos?.data.todos.map((todo) => (
              <Link key={todo.id} href="/todos">
                <div className={cn(
                  "flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30 cursor-pointer",
                  todo.status === "DONE" && "opacity-60"
                )}>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium text-foreground truncate",
                      todo.status === "DONE" && "line-through text-muted-foreground"
                    )}>
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={todo.status} />
                      <PriorityBadge priority={todo.priority} />
                      {todo.dueDate && (
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(todo.dueDate), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
