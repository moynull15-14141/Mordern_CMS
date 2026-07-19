-- CreateEnum
CREATE TYPE "layout_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "layout_assignment_content_type" AS ENUM ('HOMEPAGE', 'PAGE', 'ARTICLE', 'CATEGORY');

-- CreateTable
CREATE TABLE "layouts" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "theme_id" UUID,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "layout_status" NOT NULL DEFAULT 'DRAFT',
    "layout_preset" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layout_assignments" (
    "id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "layout_id" UUID NOT NULL,
    "content_type" "layout_assignment_content_type" NOT NULL,
    "page_id" UUID,
    "article_id" UUID,
    "category_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "layout_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "layouts_site_id_slug_idx" ON "layouts"("site_id", "slug");

-- CreateIndex
CREATE INDEX "layouts_site_id_status_idx" ON "layouts"("site_id", "status");

-- CreateIndex
CREATE INDEX "layouts_theme_id_idx" ON "layouts"("theme_id");

-- CreateIndex
CREATE INDEX "layout_assignments_site_id_content_type_idx" ON "layout_assignments"("site_id", "content_type");

-- CreateIndex
CREATE INDEX "layout_assignments_site_id_content_type_page_id_idx" ON "layout_assignments"("site_id", "content_type", "page_id");

-- CreateIndex
CREATE INDEX "layout_assignments_site_id_content_type_article_id_idx" ON "layout_assignments"("site_id", "content_type", "article_id");

-- CreateIndex
CREATE INDEX "layout_assignments_site_id_content_type_category_id_idx" ON "layout_assignments"("site_id", "content_type", "category_id");

-- CreateIndex
CREATE INDEX "layout_assignments_layout_id_idx" ON "layout_assignments"("layout_id");

-- AddForeignKey
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layouts" ADD CONSTRAINT "layouts_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_assignments" ADD CONSTRAINT "layout_assignments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_assignments" ADD CONSTRAINT "layout_assignments_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_assignments" ADD CONSTRAINT "layout_assignments_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_assignments" ADD CONSTRAINT "layout_assignments_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layout_assignments" ADD CONSTRAINT "layout_assignments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
