/*
  Warnings:

  - You are about to drop the column `items` on the `menus` table. All the data in the column will be lost.
  - Added the required column `slug` to the `menus` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "menu_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "menu_item_target_type" AS ENUM ('PAGE', 'ARTICLE', 'CATEGORY', 'EXTERNAL_URL', 'CUSTOM_URL');

-- CreateEnum
CREATE TYPE "menu_item_open_mode" AS ENUM ('SELF', 'BLANK');

-- DropIndex
DROP INDEX "menus_site_id_name_idx";

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "items",
ADD COLUMN     "location" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "status" "menu_status" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "parent_id" UUID,
    "label" TEXT NOT NULL,
    "target_type" "menu_item_target_type" NOT NULL,
    "page_id" UUID,
    "article_id" UUID,
    "category_id" UUID,
    "url" TEXT,
    "open_mode" VARCHAR(10) NOT NULL DEFAULT 'SELF',
    "icon" TEXT,
    "css_class" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "layout_meta" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_items_menu_id_parent_id_idx" ON "menu_items"("menu_id", "parent_id");

-- CreateIndex
CREATE INDEX "menu_items_menu_id_sort_order_idx" ON "menu_items"("menu_id", "sort_order");

-- CreateIndex
CREATE INDEX "menu_items_page_id_idx" ON "menu_items"("page_id");

-- CreateIndex
CREATE INDEX "menu_items_article_id_idx" ON "menu_items"("article_id");

-- CreateIndex
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");

-- CreateIndex
CREATE INDEX "menus_site_id_slug_idx" ON "menus"("site_id", "slug");

-- CreateIndex
CREATE INDEX "menus_site_id_location_idx" ON "menus"("site_id", "location");

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
