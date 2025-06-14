/*
  Warnings:

  - You are about to drop the column `status` on the `Issue` table. All the data in the column will be lost.
  - Added the required column `statusId` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Issue_status_order_idx";

-- AlterTable
ALTER TABLE "Issue" DROP COLUMN "status",
ADD COLUMN     "statusId" TEXT NOT NULL;

-- DropEnum
DROP TYPE "IssueStatus";

-- CreateTable
CREATE TABLE "IssueStatus" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "IssueStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IssueStatus_name_projectId_key" ON "IssueStatus"("name", "projectId");

-- CreateIndex
CREATE INDEX "Issue_statusId_order_idx" ON "Issue"("statusId", "order");

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "IssueStatus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueStatus" ADD CONSTRAINT "IssueStatus_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
