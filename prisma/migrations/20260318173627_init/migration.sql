-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "parentId" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'business',

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "empNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferPlan" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "empNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dest" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "diffKind" TEXT NOT NULL,

    CONSTRAINT "TransferPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeadcountPlan" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "monthIdx" INTEGER NOT NULL,
    "planned" INTEGER NOT NULL,
    "actual" INTEGER,

    CONSTRAINT "HeadcountPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FutureHeadcount" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "monthIdx" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "comment" TEXT,

    CONSTRAINT "FutureHeadcount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "azureAdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "orgId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_empNo_key" ON "Member"("empNo");

-- CreateIndex
CREATE UNIQUE INDEX "HeadcountPlan_orgId_monthIdx_key" ON "HeadcountPlan"("orgId", "monthIdx");

-- CreateIndex
CREATE UNIQUE INDEX "FutureHeadcount_orgId_monthIdx_key" ON "FutureHeadcount"("orgId", "monthIdx");

-- CreateIndex
CREATE UNIQUE INDEX "User_azureAdId_key" ON "User"("azureAdId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferPlan" ADD CONSTRAINT "TransferPlan_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeadcountPlan" ADD CONSTRAINT "HeadcountPlan_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FutureHeadcount" ADD CONSTRAINT "FutureHeadcount_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
