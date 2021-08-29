-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('DIRECT');

-- DropForeignKey
ALTER TABLE "UserRelationship" DROP CONSTRAINT "UserRelationship_fromId_fkey";

-- DropForeignKey
ALTER TABLE "UserRelationship" DROP CONSTRAINT "UserRelationship_toId_fkey";

-- CreateTable
CREATE TABLE "Channel" (
    "id" BIGINT NOT NULL,
    "type" "ChannelType" NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" BIGINT NOT NULL,
    "sentOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channelId" BIGINT NOT NULL,
    "authorId" BIGINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChannelToUser" (
    "A" BIGINT NOT NULL,
    "B" BIGINT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChannelToUser_AB_unique" ON "_ChannelToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChannelToUser_B_index" ON "_ChannelToUser"("B");

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToUser" ADD FOREIGN KEY ("A") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChannelToUser" ADD FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
