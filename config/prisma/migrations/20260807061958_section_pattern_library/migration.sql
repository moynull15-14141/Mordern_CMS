-- CreateEnum
CREATE TYPE "pattern_status" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "patterns" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "pattern_status" NOT NULL DEFAULT 'ACTIVE',
    "thumbnail_media_id" UUID,
    "body" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "patterns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_favorites" (
    "user_id" UUID NOT NULL,
    "pattern_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_favorites_pkey" PRIMARY KEY ("user_id","pattern_id")
);

-- CreateIndex
CREATE INDEX "patterns_site_id_slug_idx" ON "patterns"("site_id", "slug");

-- CreateIndex
CREATE INDEX "patterns_category_idx" ON "patterns"("category");

-- CreateIndex
CREATE INDEX "patterns_status_idx" ON "patterns"("status");

-- CreateIndex
CREATE INDEX "patterns_deleted_at_idx" ON "patterns"("deleted_at");

-- CreateIndex
CREATE INDEX "pattern_favorites_pattern_id_idx" ON "pattern_favorites"("pattern_id");

-- CreateIndex (partial unique — slug unique per site, active rows only; matches the
-- established slug/name uniqueness pattern from 20260716000001_partial_unique_indexes)
CREATE UNIQUE INDEX "patterns_site_id_slug_active_key" ON "patterns"("site_id", "slug") WHERE "deleted_at" IS NULL;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_thumbnail_media_id_fkey" FOREIGN KEY ("thumbnail_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_favorites" ADD CONSTRAINT "pattern_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pattern_favorites" ADD CONSTRAINT "pattern_favorites_pattern_id_fkey" FOREIGN KEY ("pattern_id") REFERENCES "patterns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
