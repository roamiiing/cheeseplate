-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('IsItHype', 'SensorsAreShit');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "countersId" INTEGER;

-- CreateTable
CREATE TABLE "Counters" (
    "id" SERIAL NOT NULL,
    "telegramUserId" BIGINT NOT NULL,
    "telegramChatId" BIGINT NOT NULL,
    "isItHypeCounter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "telegramUserId" BIGINT NOT NULL,
    "telegramChatId" BIGINT NOT NULL,
    "achievements" "Achievement"[],

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Counters_telegramChatId_telegramUserId_key" ON "Counters"("telegramChatId", "telegramUserId");

-- AddForeignKey
ALTER TABLE "Counters" ADD CONSTRAINT "Counters_telegramChatId_telegramUserId_fkey" FOREIGN KEY ("telegramChatId", "telegramUserId") REFERENCES "User"("chatTelegramId", "telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_telegramChatId_telegramUserId_fkey" FOREIGN KEY ("telegramChatId", "telegramUserId") REFERENCES "User"("chatTelegramId", "telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;
