-- AlterTable
ALTER TABLE `Channel` ADD COLUMN `minimumTrustRank` VARCHAR(255) NOT NULL DEFAULT 'Visitor';

-- AlterTable
ALTER TABLE `ChannelGroup` ADD COLUMN `minimumTrustRank` VARCHAR(255) NOT NULL DEFAULT 'Visitor';
