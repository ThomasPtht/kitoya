/*
  Warnings:

  - Added the required column `brand` to the `Jersey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isOfficial` to the `Jersey` table without a default value. This is not possible if the table is not empty.
  - Made the column `season` on table `Jersey` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `Jersey` table without a default value. This is not possible if the table is not empty.
  - Made the column `size` on table `Jersey` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `condition` to the `Jersey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Jersey` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "KitCondition" AS ENUM ('NEW_WITH_TAGS', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR');

-- CreateEnum
CREATE TYPE "KitVersion" AS ENUM ('REPLICA', 'AUTHENTIC', 'PLAYER_ISSUE', 'MATCH_WORN');

-- CreateEnum
CREATE TYPE "JerseyType" AS ENUM ('HOME', 'AWAY', 'THIRD', 'FOURTH', 'SPECIAL', 'GOALKEEPER', 'TRAINING');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "Jersey" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "isOfficial" BOOLEAN NOT NULL,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION,
ALTER COLUMN "season" SET NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "JerseyType" NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
DROP COLUMN "condition",
ADD COLUMN     "condition" "KitCondition" NOT NULL,
DROP COLUMN "version",
ADD COLUMN     "version" "KitVersion" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "expoPushToken" TEXT,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "location" TEXT,
ADD COLUMN     "rank" TEXT,
ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "resetCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "stripeCustomerId" TEXT,
ALTER COLUMN "isPublic" SET DEFAULT true;

-- CreateTable
CREATE TABLE "DailyKitNotification" (
    "id" TEXT NOT NULL,
    "jerseyId" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "DailyKitNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "revenueCatId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JerseyLike" (
    "id" TEXT NOT NULL,
    "jerseyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JerseyLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyKitNotification_jerseyId_date_key" ON "DailyKitNotification"("jerseyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JerseyLike_jerseyId_userId_key" ON "JerseyLike"("jerseyId", "userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JerseyLike" ADD CONSTRAINT "JerseyLike_jerseyId_fkey" FOREIGN KEY ("jerseyId") REFERENCES "Jersey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JerseyLike" ADD CONSTRAINT "JerseyLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
