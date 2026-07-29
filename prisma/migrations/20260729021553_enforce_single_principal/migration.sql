-- Jika sudah terlanjur ada lebih dari satu kepala sekolah,
-- pertahankan satu data terbaru dan lepaskan sisanya.
WITH ranked_principals AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      ORDER BY "updatedAt" DESC, "createdAt" ASC, "id" ASC
    ) AS row_number
  FROM "Teacher"
  WHERE "isPrincipal" = true
)
UPDATE "Teacher" AS teacher
SET "isPrincipal" = false
FROM ranked_principals AS ranked
WHERE teacher."id" = ranked."id"
  AND ranked.row_number > 1;

-- PostgreSQL partial unique index:
-- hanya satu baris yang boleh memiliki isPrincipal = true.
CREATE UNIQUE INDEX "Teacher_single_principal_idx"
ON "Teacher" ("isPrincipal")
WHERE "isPrincipal" = true;
