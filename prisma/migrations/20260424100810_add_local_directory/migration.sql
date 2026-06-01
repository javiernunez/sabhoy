-- CreateEnum
CREATE TYPE "DirectoryKind" AS ENUM ('COMMERCE', 'SPORT');

-- CreateTable
CREATE TABLE "LocalDirectoryEntry" (
    "id" SERIAL NOT NULL,
    "kind" "DirectoryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "icon" TEXT,
    "href" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalDirectoryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocalDirectoryEntry_slug_key" ON "LocalDirectoryEntry"("slug");

-- CreateIndex
CREATE INDEX "LocalDirectoryEntry_kind_isActive_sortOrder_idx" ON "LocalDirectoryEntry"("kind", "isActive", "sortOrder");
