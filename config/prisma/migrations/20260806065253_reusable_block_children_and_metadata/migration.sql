-- AlterTable
ALTER TABLE "reusable_blocks" ADD COLUMN     "category" TEXT,
ADD COLUMN     "children" JSONB,
ADD COLUMN     "description" TEXT;
