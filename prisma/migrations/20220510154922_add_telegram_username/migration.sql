/*
  Warnings:

  - A unique constraint covering the columns `[telegramUsername,chatTelegramId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telegramUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramUsername_chatTelegramId_key" ON "User"("telegramUsername", "chatTelegramId");
