/*
  Warnings:

  - You are about to drop the column `targetId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,type,postId]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,type,commentId]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "ReactionComment";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "ReactionPost";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "ReportComment";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "ReportPost";

-- DropIndex
DROP INDEX "Reaction_targetType_targetId_idx";

-- DropIndex
DROP INDEX "Reaction_userId_targetType_targetId_type_key";

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "targetId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "postId" TEXT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "targetId",
ADD COLUMN     "commentId" TEXT,
ADD COLUMN     "postId" TEXT;

-- CreateIndex
CREATE INDEX "Reaction_userId_idx" ON "Reaction"("userId");

-- CreateIndex
CREATE INDEX "Reaction_postId_idx" ON "Reaction"("postId");

-- CreateIndex
CREATE INDEX "Reaction_commentId_idx" ON "Reaction"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_postId_key" ON "Reaction"("userId", "type", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_type_commentId_key" ON "Reaction"("userId", "type", "commentId");

-- CreateIndex
CREATE INDEX "Report_postId_idx" ON "Report"("postId");

-- CreateIndex
CREATE INDEX "Report_commentId_idx" ON "Report"("commentId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
