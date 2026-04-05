-- AlterTable: Add new fields to Member
ALTER TABLE "Member" ADD COLUMN "rank" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "transferType" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "destDept" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "transferDate" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "comment" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "approvalStatus" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Member" ADD COLUMN "retirementDate" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "HiringPlan" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "targetDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "HiringPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferInPlan" (
    "id" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "sourceOrg" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "destOrgId" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT NOT NULL DEFAULT '',
    "isInbound" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TransferInPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HiringPlan_no_key" ON "HiringPlan"("no");

-- CreateIndex
CREATE UNIQUE INDEX "TransferInPlan_no_key" ON "TransferInPlan"("no");

-- AddForeignKey
ALTER TABLE "HiringPlan" ADD CONSTRAINT "HiringPlan_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferInPlan" ADD CONSTRAINT "TransferInPlan_destOrgId_fkey" FOREIGN KEY ("destOrgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
