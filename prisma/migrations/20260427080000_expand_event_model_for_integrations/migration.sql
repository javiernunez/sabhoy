-- AlterTable
ALTER TABLE "Event"
ADD COLUMN "slug" TEXT,
ADD COLUMN "externalId" TEXT,
ADD COLUMN "source" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN "lastSeenAt" TIMESTAMP(3);

-- Backfill slug for existing rows using id suffix for uniqueness
UPDATE "Event"
SET "slug" = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || id
WHERE "slug" IS NULL;

-- Ensure slug is always present after backfill
ALTER TABLE "Event"
ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_externalId_key" ON "Event"("externalId");

-- CreateIndex
CREATE INDEX "Event_status_eventDate_idx" ON "Event"("status", "eventDate");
