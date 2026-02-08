/*
  Warnings:

  - You are about to drop the column `description` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `instagram` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `mediaUrl` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `setUrl` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `stageName` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `hourKey` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `voterId` on the `Vote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_artistId_fkey";

-- DropIndex
DROP INDEX "Vote_artistId_voterId_hourKey_key";

-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "firstName",
DROP COLUMN "instagram",
DROP COLUMN "isPublished",
DROP COLUMN "lastName",
DROP COLUMN "mediaUrl",
DROP COLUMN "setUrl",
DROP COLUMN "stageName",
ADD COLUMN     "name" TEXT;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "hourKey",
DROP COLUMN "voterId";

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "instagram" TEXT,
    "description" TEXT,
    "setLink" TEXT,
    "mediaLink" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);
