-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "showLocation" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "PostDailyMetric" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostDailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDailyMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followers" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserDailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostDailyMetric_postId_date_key" ON "PostDailyMetric"("postId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserDailyMetric_userId_date_key" ON "UserDailyMetric"("userId", "date");

-- AddForeignKey
ALTER TABLE "PostDailyMetric" ADD CONSTRAINT "PostDailyMetric_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDailyMetric" ADD CONSTRAINT "UserDailyMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
