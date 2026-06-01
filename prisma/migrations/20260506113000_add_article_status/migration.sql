-- Add draft/published state for news articles.
ALTER TABLE "Article"
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'published';

CREATE INDEX "Article_status_createdAt_idx" ON "Article"("status", "createdAt");
