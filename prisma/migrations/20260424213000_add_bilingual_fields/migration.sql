-- Article bilingual fields
ALTER TABLE "Article" ADD COLUMN "titleVal" TEXT;
ALTER TABLE "Article" ADD COLUMN "contentVal" TEXT;
ALTER TABLE "Article" ADD COLUMN "summaryVal" TEXT;

-- EvergreenPage bilingual fields
ALTER TABLE "EvergreenPage" ADD COLUMN "titleVal" TEXT;
ALTER TABLE "EvergreenPage" ADD COLUMN "contentVal" TEXT;

-- LocalDirectoryEntry bilingual fields
ALTER TABLE "LocalDirectoryEntry" ADD COLUMN "nameVal" TEXT;
ALTER TABLE "LocalDirectoryEntry" ADD COLUMN "categoryVal" TEXT;
ALTER TABLE "LocalDirectoryEntry" ADD COLUMN "descriptionVal" TEXT;

-- Video bilingual fields
ALTER TABLE "Video" ADD COLUMN "descriptionVal" TEXT;
