-- CreateEnum
CREATE TYPE "UserRelationshipType" AS ENUM ('WAVE', 'FOLLOW', 'BLOCK');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "registeredOn" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "UserRelationship" (
    "establishedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "UserRelationshipType" NOT NULL,
    "fromId" BIGINT NOT NULL,
    "toId" BIGINT NOT NULL,

    PRIMARY KEY ("fromId","toId")
);

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRelationship" ADD FOREIGN KEY ("toId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
