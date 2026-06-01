-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('generico', 'teatro', 'feria');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "category" "EventCategory" NOT NULL DEFAULT 'generico';
ALTER TABLE "Event" ADD COLUMN "details" JSONB;

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");
