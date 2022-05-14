-- AlterTable
ALTER TABLE `Channel` MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `ChannelGroup` ADD COLUMN `description` TEXT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `description` TEXT NULL;
