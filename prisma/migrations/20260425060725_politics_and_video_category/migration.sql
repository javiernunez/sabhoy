-- CreateEnum
CREATE TYPE "VideoCategory" AS ENUM ('GENERAL', 'POLITICA');

-- AlterEnum
ALTER TYPE "DirectoryKind" ADD VALUE 'POLITICS';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "category" "VideoCategory" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "Video_category_createdAt_idx" ON "Video"("category", "createdAt");
