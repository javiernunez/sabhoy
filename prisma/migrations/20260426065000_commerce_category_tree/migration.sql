-- Category tree for local directory + many-to-many entry mapping.
CREATE TABLE "LocalDirectoryCategory" (
    "id" SERIAL NOT NULL,
    "kind" "DirectoryKind" NOT NULL,
    "name" TEXT NOT NULL,
    "nameVal" TEXT,
    "slug" TEXT NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LocalDirectoryCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalDirectoryEntryCategory" (
    "entryId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LocalDirectoryEntryCategory_pkey" PRIMARY KEY ("entryId","categoryId")
);

CREATE UNIQUE INDEX "LocalDirectoryCategory_kind_slug_key" ON "LocalDirectoryCategory"("kind", "slug");
CREATE UNIQUE INDEX "LocalDirectoryCategory_kind_parentId_name_key" ON "LocalDirectoryCategory"("kind", "parentId", "name");
CREATE INDEX "LocalDirectoryCategory_kind_parentId_name_idx" ON "LocalDirectoryCategory"("kind", "parentId", "name");
CREATE INDEX "LocalDirectoryEntryCategory_categoryId_idx" ON "LocalDirectoryEntryCategory"("categoryId");

ALTER TABLE "LocalDirectoryCategory"
    ADD CONSTRAINT "LocalDirectoryCategory_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "LocalDirectoryCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LocalDirectoryEntryCategory"
    ADD CONSTRAINT "LocalDirectoryEntryCategory_entryId_fkey"
    FOREIGN KEY ("entryId") REFERENCES "LocalDirectoryEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalDirectoryEntryCategory"
    ADD CONSTRAINT "LocalDirectoryEntryCategory_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "LocalDirectoryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill categories from current text field `LocalDirectoryEntry.category`.
WITH parsed AS (
    SELECT
        e.id AS entry_id,
        e.kind,
        trim(split_part(e.category, '/', 1)) AS parent_name,
        NULLIF(trim(split_part(e.category, '/', 2)), '') AS child_name,
        trim(split_part(COALESCE(e."categoryVal", ''), '/', 1)) AS parent_name_val,
        NULLIF(trim(split_part(COALESCE(e."categoryVal", ''), '/', 2)), '') AS child_name_val
    FROM "LocalDirectoryEntry" e
    WHERE trim(e.category) <> ''
),
parent_seed AS (
    SELECT DISTINCT
        kind,
        parent_name AS name,
        NULLIF(parent_name_val, '') AS name_val
    FROM parsed
    WHERE parent_name <> ''
),
insert_parents AS (
    INSERT INTO "LocalDirectoryCategory" ("kind", "name", "nameVal", "slug", "createdAt", "updatedAt")
    SELECT
        ps.kind,
        ps.name,
        ps.name_val,
        regexp_replace(
          lower(
            translate(
              ps.name,
              'ÁÀÄÂáàäâÉÈËÊéèëêÍÌÏÎíìïîÓÒÖÔóòöôÚÙÜÛúùüûÑñÇç',
              'AAAAaaaaEEEEeeeeIIIIiiiiOOOOooooUUUUuuuuNnCc'
            )
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        NOW(),
        NOW()
    FROM parent_seed ps
    ON CONFLICT ("kind", "parentId", "name") DO UPDATE
      SET "nameVal" = COALESCE("LocalDirectoryCategory"."nameVal", EXCLUDED."nameVal"),
          "updatedAt" = NOW()
    RETURNING id, kind, name
),
parent_rows AS (
    SELECT id, kind, name
    FROM "LocalDirectoryCategory"
    WHERE "parentId" IS NULL
),
child_seed AS (
    SELECT DISTINCT
        p.kind,
        p.id AS parent_id,
        parsed.child_name AS name,
        parsed.child_name_val AS name_val
    FROM parsed
    JOIN parent_rows p ON p.kind = parsed.kind AND p.name = parsed.parent_name
    WHERE parsed.child_name IS NOT NULL
),
insert_children AS (
    INSERT INTO "LocalDirectoryCategory" ("kind", "name", "nameVal", "slug", "parentId", "createdAt", "updatedAt")
    SELECT
        cs.kind,
        cs.name,
        cs.name_val,
        regexp_replace(
          lower(
            translate(
              (SELECT p.name FROM "LocalDirectoryCategory" p WHERE p.id = cs.parent_id) || '-' || cs.name,
              'ÁÀÄÂáàäâÉÈËÊéèëêÍÌÏÎíìïîÓÒÖÔóòöôÚÙÜÛúùüûÑñÇç',
              'AAAAaaaaEEEEeeeeIIIIiiiiOOOOooooUUUUuuuuNnCc'
            )
          ),
          '[^a-z0-9]+',
          '-',
          'g'
        ),
        cs.parent_id,
        NOW(),
        NOW()
    FROM child_seed cs
    ON CONFLICT ("kind", "parentId", "name") DO UPDATE
      SET "nameVal" = COALESCE("LocalDirectoryCategory"."nameVal", EXCLUDED."nameVal"),
          "updatedAt" = NOW()
    RETURNING id
)
INSERT INTO "LocalDirectoryEntryCategory" ("entryId", "categoryId", "createdAt")
SELECT DISTINCT
    p.entry_id,
    COALESCE(c.id, pr.id) AS category_id,
    NOW()
FROM parsed p
JOIN parent_rows pr ON pr.kind = p.kind AND pr.name = p.parent_name
LEFT JOIN "LocalDirectoryCategory" c
    ON c.kind = p.kind
   AND c."parentId" = pr.id
   AND c.name = p.child_name
ON CONFLICT ("entryId", "categoryId") DO NOTHING;
