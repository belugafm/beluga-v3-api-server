-- AlterTable
ALTER TABLE `ChannelGroup` ADD COLUMN `imageUrl` VARCHAR(255) NULL;

-- CreateTable
CREATE TABLE `MessageEntityUrl` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `text` TEXT NOT NULL,
    `favoriteCount` INTEGER NOT NULL DEFAULT 0,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `replyCount` INTEGER NOT NULL DEFAULT 0,
    `threadId` INTEGER NULL,
    `deleted` BOOLEAN NOT NULL DEFAULT false,
    `textStyle` TEXT NULL,
    `associatedFiles` TEXT NULL,
    `associatedMessages` TEXT NULL,
    `associatedChannels` TEXT NULL,
    `associatedChannelGroups` TEXT NULL,
    `associatedUrlContents` TEXT NULL,

    INDEX `MessageEntityUrl_threadId_deleted_idx`(`threadId`, `deleted`),
    INDEX `MessageEntityUrl_userId_deleted_idx`(`userId`, `deleted`),
    INDEX `MessageEntityUrl_channelId_threadId_deleted_idx`(`channelId`, `threadId`, `deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
