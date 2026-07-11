-- CreateEnum
CREATE TYPE "PomodoroType" AS ENUM ('WORK', 'SHORT_BREAK', 'LONG_BREAK');

-- AlterEnum
ALTER TYPE "SessionStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "PomodoroSession" ADD COLUMN     "accumulatedPausedMs" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "type" "PomodoroType" NOT NULL DEFAULT 'WORK';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "longBreakLength" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "shortBreakLength" INTEGER NOT NULL DEFAULT 5;

-- CreateIndex
CREATE INDEX "PomodoroSession_userId_status_idx" ON "PomodoroSession"("userId", "status");
