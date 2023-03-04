-- AlterTable
ALTER TABLE `User` ADD COLUMN `botOwnerId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `User_botOwnerId_idx` ON `User`(`botOwnerId`);
