-- Move single report category to multi-tag categories.
ALTER TABLE "Report"
ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Report"
SET "categories" = CASE
  WHEN "category" IS NULL OR btrim("category") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY[lower("category")]
END;

ALTER TABLE "Report"
DROP COLUMN "category";
