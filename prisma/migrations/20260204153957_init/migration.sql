-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "instagram" TEXT,
    "email" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "setUrl" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artistId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "hourKey" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_artistId_voterId_hourKey_key" ON "Vote"("artistId", "voterId", "hourKey");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
