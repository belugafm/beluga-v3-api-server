-- AlterTable
ALTER TABLE `Message` ADD COLUMN `lastReplyMessageCreatedAt` DATETIME(3) NULL,
    ADD COLUMN `lastReplyMessageId` INTEGER NULL;
