-- Orden manual de noticias en portada (mayor portadaRank = más arriba).
ALTER TABLE "Article" ADD COLUMN "portadaRank" INTEGER NOT NULL DEFAULT 0;

-- Backfill: la más antigua rank 1, la más reciente rank N (coincide con sort previo por createdAt desc).
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "Article"
  WHERE status = 'published'
)
UPDATE "Article" a
SET "portadaRank" = ranked.rn
FROM ranked
WHERE a.id = ranked.id;

CREATE INDEX "Article_status_portadaRank_idx" ON "Article"("status", "portadaRank");
