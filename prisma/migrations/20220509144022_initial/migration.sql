-- CreateTable
CREATE TABLE "Chat" (
    "telegramId" BIGINT NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("telegramId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,
    "chatTelegramId" BIGINT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "displayName" TEXT NOT NULL,
    "chatTelegramId" BIGINT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TagToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_tag_chatTelegramId_key" ON "Tag"("tag", "chatTelegramId");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_chatTelegramId_key" ON "User"("telegramId", "chatTelegramId");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUser_AB_unique" ON "_TagToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUser_B_index" ON "_TagToUser"("B");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_chatTelegramId_fkey" FOREIGN KEY ("chatTelegramId") REFERENCES "Chat"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_chatTelegramId_fkey" FOREIGN KEY ("chatTelegramId") REFERENCES "Chat"("telegramId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
