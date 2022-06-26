-- AlterTable
ALTER TABLE `ChannelGroup` ADD COLUMN `lastMessageCreatedAt` DATETIME(3) NULL,
    ADD COLUMN `lastMessageId` INTEGER NULL;
