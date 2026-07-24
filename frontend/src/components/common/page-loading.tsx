import { LoadingSpinner } from "./loading-spinner"

interface PageLoadingProps {
  text?: string
}

export function PageLoading({ text }: PageLoadingProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <LoadingSpinner size={24} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  )
}
