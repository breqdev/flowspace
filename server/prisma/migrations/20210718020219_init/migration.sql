-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "registeredOn" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "pronouns" TEXT,
    "url" TEXT,
    "location" TEXT,
    "bio" TEXT,

    PRIMARY KEY ("id")
);
