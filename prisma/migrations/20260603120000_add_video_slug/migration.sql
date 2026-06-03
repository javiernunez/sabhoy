-- AlterTable
ALTER TABLE "Video" ADD COLUMN "slug" TEXT;

-- Backfill provisional slugs before NOT NULL
UPDATE "Video" SET "slug" = 'video-' || "id"::text WHERE "slug" IS NULL;

ALTER TABLE "Video" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");
