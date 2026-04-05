-- CreateTable
CREATE TABLE "HeadcountQuota" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "fiscalYear" INTEGER NOT NULL,
    "q1" INTEGER NOT NULL,
    "q2" INTEGER NOT NULL,
    "q3" INTEGER NOT NULL,
    "q4" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "HeadcountQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeadcountQuota_orgId_fiscalYear_key" ON "HeadcountQuota"("orgId", "fiscalYear");

-- AddForeignKey
ALTER TABLE "HeadcountQuota" ADD CONSTRAINT "HeadcountQuota_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
