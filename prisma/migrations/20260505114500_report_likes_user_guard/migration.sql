-- Enforce one like per user and require auth for interactions.
ALTER TABLE "ReportComment"
ADD COLUMN "userId" TEXT;

CREATE INDEX "ReportComment_userId_idx" ON "ReportComment"("userId");

ALTER TABLE "ReportComment"
ADD CONSTRAINT "ReportComment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ReportLike" (
  "id" SERIAL NOT NULL,
  "reportId" INTEGER NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ReportLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReportLike_reportId_userId_key" ON "ReportLike"("reportId", "userId");
CREATE INDEX "ReportLike_reportId_createdAt_idx" ON "ReportLike"("reportId", "createdAt");

ALTER TABLE "ReportLike"
ADD CONSTRAINT "ReportLike_reportId_fkey"
FOREIGN KEY ("reportId") REFERENCES "Report"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReportLike"
ADD CONSTRAINT "ReportLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
