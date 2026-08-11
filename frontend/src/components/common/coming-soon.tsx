import { ConstructionIcon } from "lucide-react"
import { EmptyState } from "@/components/design-system/empty-state"

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <EmptyState
        icon={<ConstructionIcon size={22} />}
        title={title}
        description="Coming soon."
        accent="bg-muted text-muted-foreground"
      />
    </div>
  )
}
