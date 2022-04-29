-- CreateTable
CREATE TABLE `LoginCredential` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `LoginCredential_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `sessionId` VARCHAR(255) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `expireDate` DATETIME(3) NOT NULL,
    `expired` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastLocation` VARCHAR(255) NULL,
    `device` VARCHAR(255) NULL,

    UNIQUE INDEX `LoginSession_sessionId_key`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthenticityToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `AuthenticityToken_sessionId_key`(`sessionId`),
    UNIQUE INDEX `AuthenticityToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `twitterUserId` VARCHAR(255) NULL,
    `displayName` VARCHAR(255) NULL,
    `profileImageUrl` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `url` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `messageCount` INTEGER NOT NULL,
    `favoritesCount` INTEGER NOT NULL,
    `favoritedCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `bot` BOOLEAN NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,
    `dormant` BOOLEAN NOT NULL DEFAULT false,
    `suspended` BOOLEAN NOT NULL DEFAULT false,
    `trustLevel` INTEGER NOT NULL,
    `lastActivityDate` DATETIME(3) NULL,
    `termsOfServiceAgreementDate` DATETIME(3) NULL,
    `termsOfServiceAgreementVersion` VARCHAR(255) NULL,
    `registrationIpAddress` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    UNIQUE INDEX `User_twitterUserId_key`(`twitterUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `uniqueName` VARCHAR(255) NOT NULL,
    `parentId` INTEGER NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `level` INTEGER NOT NULL,
    `channelCount` INTEGER NOT NULL DEFAULT 0,
    `messageCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ChannelGroup_uniqueName_key`(`uniqueName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Channel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `uniqueName` VARCHAR(255) NOT NULL,
    `parentChannelGroupId` INTEGER NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `messageCount` INTEGER NOT NULL DEFAULT 0,
    `statusString` VARCHAR(1) NOT NULL DEFAULT '#',
    `description` TEXT NOT NULL,
    `lastMessageId` INTEGER NULL,

    UNIQUE INDEX `Channel_uniqueName_key`(`uniqueName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
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

    INDEX `Message_threadId_deleted_idx`(`threadId`, `deleted`),
    INDEX `Message_userId_deleted_idx`(`userId`, `deleted`),
    INDEX `Message_channelId_threadId_deleted_idx`(`channelId`, `threadId`, `deleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelGroupTimeline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelGroupId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `messageId` INTEGER NOT NULL,

    INDEX `ChannelGroupTimeline_channelGroupId_idx`(`channelGroupId`),
    INDEX `ChannelGroupTimeline_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelReadState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `channelId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `lastMessageId` INTEGER NOT NULL,

    UNIQUE INDEX `ChannelReadState_channelId_userId_key`(`channelId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
