import { ConstructionIcon } from "lucide-react"

interface ComingSoonPageProps {
  title: string
}

export function ComingSoonPage({ title }: ComingSoonPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <ConstructionIcon size={40} className="text-muted-foreground/30" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">Coming soon.</p>
      </div>
    </div>
  )
}
