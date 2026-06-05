-- AlterTable
ALTER TABLE "NewsletterSubscription" ADD COLUMN "confirmToken" TEXT,
ADD COLUMN "confirmedAt" TIMESTAMP(3);

-- Suscripciones existentes: ya confirmadas
UPDATE "NewsletterSubscription" SET "confirmedAt" = "createdAt" WHERE "confirmedAt" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_confirmToken_key" ON "NewsletterSubscription"("confirmToken");
