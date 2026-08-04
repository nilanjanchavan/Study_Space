import { PomodoroView } from "@/components/pomodoro/pomodoro-view"
import { PomodoroMusicPanel } from "@/components/pomodoro/pomodoro-music-panel"

export default function PomodoroPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
      <PomodoroView />
      <div className="lg:sticky lg:top-24 order-first lg:order-last">
        <PomodoroMusicPanel />
      </div>
    </div>
  )
}
