-- Move sports entities to associations
UPDATE "LocalDirectoryEntry"
SET "kind" = 'ASSOCIATION'
WHERE "kind" = 'SPORT';

UPDATE "LocalDirectoryCategory"
SET "kind" = 'ASSOCIATION'
WHERE "kind" = 'SPORT';

-- Reclassify likely non-profit entities from commerce to associations
UPDATE "LocalDirectoryEntry"
SET "kind" = 'ASSOCIATION'
WHERE "kind" = 'COMMERCE'
  AND (
    lower(coalesce("category", '')) SIMILAR TO '%(casal|falla|asociaci|association|associacio|ampa|ong|vecin|vein)%'
    OR lower(coalesce("name", '')) SIMILAR TO '%(falla|casal|ampa|ong|asociaci|association|associacio|veinos|vecinos)%'
  );

UPDATE "LocalDirectoryCategory"
SET "kind" = 'ASSOCIATION'
WHERE "kind" = 'COMMERCE'
  AND (
    lower(coalesce("name", '')) SIMILAR TO '%(casal|falla|asociaci|association|associacio|ampa|ong|vecin|vein)%'
    OR lower(coalesce("slug", '')) SIMILAR TO '%(casal|falla|asoci|ampa|ong|vecin|vein)%'
  );
