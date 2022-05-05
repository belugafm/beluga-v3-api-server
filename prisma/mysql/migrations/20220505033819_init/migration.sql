/*
  Warnings:

  - Added the required column `group` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `File_userId_idx` ON `File`;

-- AlterTable
ALTER TABLE `File` ADD COLUMN `group` VARCHAR(255) NOT NULL,
    ADD COLUMN `original` BOOLEAN NOT NULL;

-- CreateIndex
CREATE INDEX `File_userId_original_idx` ON `File`(`userId`, `original`);

-- CreateIndex
CREATE INDEX `File_group_idx` ON `File`(`group`);
