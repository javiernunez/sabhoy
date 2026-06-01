-- Add popularity and discussion support for public reports.
ALTER TABLE "Report"
ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ReportComment" (
  "id" SERIAL NOT NULL,
  "reportId" INTEGER NOT NULL,
  "author" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReportComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReportComment_reportId_createdAt_idx" ON "ReportComment"("reportId", "createdAt");

ALTER TABLE "ReportComment"
ADD CONSTRAINT "ReportComment_reportId_fkey"
FOREIGN KEY ("reportId") REFERENCES "Report"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
