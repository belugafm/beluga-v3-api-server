-- CreateTable
CREATE TABLE `Application` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `callbackUrl` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT true,
    `write` BOOLEAN NOT NULL DEFAULT false,
    `token` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `Application_token_key`(`token`),
    UNIQUE INDEX `Application_secret_key`(`secret`),
    UNIQUE INDEX `Application_token_secret_key`(`token`, `secret`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `applicationId` INTEGER NOT NULL,
    `expireDate` DATETIME(3) NOT NULL,
    `verifier` VARCHAR(255) NULL,
    `verifiedUserId` INTEGER NULL,

    UNIQUE INDEX `RequestToken_token_key`(`token`),
    UNIQUE INDEX `RequestToken_secret_key`(`secret`),
    UNIQUE INDEX `RequestToken_token_secret_key`(`token`, `secret`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccessToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(255) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `userId` INTEGER NOT NULL,
    `applicationId` INTEGER NOT NULL,

    UNIQUE INDEX `AccessToken_token_key`(`token`),
    UNIQUE INDEX `AccessToken_secret_key`(`secret`),
    UNIQUE INDEX `AccessToken_token_secret_key`(`token`, `secret`),
    UNIQUE INDEX `AccessToken_applicationId_userId_key`(`applicationId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
