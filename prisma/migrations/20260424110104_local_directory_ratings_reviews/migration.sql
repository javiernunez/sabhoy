-- AlterTable
ALTER TABLE "LocalDirectoryEntry" ADD COLUMN     "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LocalDirectoryReview" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalDirectoryReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocalDirectoryReview_entryId_createdAt_idx" ON "LocalDirectoryReview"("entryId", "createdAt");

-- AddForeignKey
ALTER TABLE "LocalDirectoryReview" ADD CONSTRAINT "LocalDirectoryReview_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "LocalDirectoryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
