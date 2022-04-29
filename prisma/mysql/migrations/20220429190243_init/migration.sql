/*
  Warnings:

  - Added the required column `lastMessageCreatedAt` to the `ChannelReadState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Channel` ADD COLUMN `lastMessageCreatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ChannelReadState` ADD COLUMN `lastMessageCreatedAt` DATETIME(3) NOT NULL;
