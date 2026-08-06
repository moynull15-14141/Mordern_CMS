-- CreateTable
CREATE TABLE "reusable_blocks" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "block_type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "reusable_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reusable_blocks_site_id_idx" ON "reusable_blocks"("site_id");

-- CreateIndex (partial unique — name unique per site, active rows only; matches the
-- established slug/name uniqueness pattern from 20260716000001_partial_unique_indexes)
CREATE UNIQUE INDEX "reusable_blocks_site_id_name_active_key" ON "reusable_blocks"("site_id", "name") WHERE "deleted_at" IS NULL;

-- AddForeignKey
ALTER TABLE "reusable_blocks" ADD CONSTRAINT "reusable_blocks_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
