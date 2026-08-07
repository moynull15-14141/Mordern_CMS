-- CreateEnum
CREATE TYPE "media_visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "media_assets" ADD COLUMN     "blur_placeholder" TEXT,
ADD COLUMN     "dominant_color" TEXT,
ADD COLUMN     "exif" JSONB,
ADD COLUMN     "folder_id" UUID,
ADD COLUMN     "pinned_at" TIMESTAMPTZ(6),
ADD COLUMN     "variants" JSONB,
ADD COLUMN     "visibility" "media_visibility" NOT NULL DEFAULT 'PUBLIC';

-- DataMigration: backfill the real folder_id column from the pre-existing metadata.folderId JSON
-- hack (docs/48_MEDIA_LIBRARY_ARCHITECTURE.md Conflict #1), only where the referenced folder still
-- exists (an active, non-soft-deleted MediaFolder). The metadata.folderId key is left in place
-- afterward (inert, non-breaking) rather than stripped.
UPDATE "media_assets" ma
SET "folder_id" = (ma."metadata" ->> 'folderId')::uuid
WHERE ma."metadata" ? 'folderId'
  AND ma."metadata" ->> 'folderId' IS NOT NULL
  AND ma."metadata" ->> 'folderId' ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND EXISTS (
    SELECT 1 FROM "media_folders" mf
    WHERE mf."id" = (ma."metadata" ->> 'folderId')::uuid
      AND mf."deleted_at" IS NULL
  );

-- CreateTable
CREATE TABLE "media_favorites" (
    "user_id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_favorites_pkey" PRIMARY KEY ("user_id","media_asset_id")
);

-- CreateTable
CREATE TABLE "media_recent_views" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "media_asset_id" UUID NOT NULL,
    "viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_recent_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_favorites_media_asset_id_idx" ON "media_favorites"("media_asset_id");

-- CreateIndex
CREATE INDEX "media_recent_views_media_asset_id_idx" ON "media_recent_views"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_recent_views_user_id_media_asset_id_key" ON "media_recent_views"("user_id", "media_asset_id");

-- CreateIndex
CREATE INDEX "media_assets_folder_id_idx" ON "media_assets"("folder_id");

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "media_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_favorites" ADD CONSTRAINT "media_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_favorites" ADD CONSTRAINT "media_favorites_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_recent_views" ADD CONSTRAINT "media_recent_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_recent_views" ADD CONSTRAINT "media_recent_views_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
