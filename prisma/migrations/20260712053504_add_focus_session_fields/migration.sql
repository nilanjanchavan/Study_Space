-- AlterTable
ALTER TABLE "FocusSession" ADD COLUMN     "cancelledPomodoros" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedPomodoros" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "strictModeEnabled" BOOLEAN NOT NULL DEFAULT false;
