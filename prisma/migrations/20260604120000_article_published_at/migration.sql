-- AlterTable
ALTER TABLE "Article" ADD COLUMN "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill from creation time (preserves current public ordering)
UPDATE "Article" SET "publishedAt" = "createdAt";

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");
