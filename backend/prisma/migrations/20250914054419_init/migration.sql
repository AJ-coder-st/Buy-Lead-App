-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "buyers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "bhk" TEXT,
    "purpose" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "timeline" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'New',
    "notes" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "ownerId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "buyers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "buyer_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diff" TEXT NOT NULL,
    CONSTRAINT "buyer_history_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "buyers_phone_idx" ON "buyers"("phone");

-- CreateIndex
CREATE INDEX "buyers_email_idx" ON "buyers"("email");

-- CreateIndex
CREATE INDEX "buyers_updatedAt_idx" ON "buyers"("updatedAt");

-- CreateIndex
CREATE INDEX "buyers_ownerId_idx" ON "buyers"("ownerId");

-- CreateIndex
CREATE INDEX "buyers_status_idx" ON "buyers"("status");

-- CreateIndex
CREATE INDEX "buyers_city_idx" ON "buyers"("city");

-- CreateIndex
CREATE INDEX "buyers_propertyType_idx" ON "buyers"("propertyType");

-- CreateIndex
CREATE INDEX "buyer_history_buyerId_idx" ON "buyer_history"("buyerId");

-- CreateIndex
CREATE INDEX "buyer_history_changedAt_idx" ON "buyer_history"("changedAt");
