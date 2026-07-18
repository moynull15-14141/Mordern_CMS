/*
  Warnings:

  - The `open_mode` column on the `menu_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "open_mode",
ADD COLUMN     "open_mode" "menu_item_open_mode" NOT NULL DEFAULT 'SELF';
