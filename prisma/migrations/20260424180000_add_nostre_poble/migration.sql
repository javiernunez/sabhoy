-- CreateEnum
CREATE TYPE "PoblePageCategory" AS ENUM ('MONUMENTS', 'TRADITIONS', 'HISTORY', 'MAYORS', 'OTHER');

-- CreateTable
CREATE TABLE "NostrePoblePage" (
    "id" SERIAL NOT NULL,
    "category" "PoblePageCategory" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleVal" TEXT,
    "summary" TEXT,
    "summaryVal" TEXT,
    "content" TEXT NOT NULL,
    "contentVal" TEXT,
    "imageUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NostrePoblePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NostrePoblePage_slug_key" ON "NostrePoblePage"("slug");

-- CreateIndex
CREATE INDEX "NostrePoblePage_category_isPublished_sortOrder_idx" ON "NostrePoblePage"("category", "isPublished", "sortOrder");
