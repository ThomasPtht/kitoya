/*
  Warnings:

  - Added the required column `type` to the `Jersey` table without a default value. This is not possible if the table is not empty.
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
ALTER TABLE "Jersey" ADD COLUMN     "isOfficial" BOOLEAN,
ADD COLUMN     "purchasePrice" DOUBLE PRECISION,
DROP COLUMN "type",
ADD COLUMN     "type" "JerseyType" NOT NULL,
DROP COLUMN "condition",
ADD COLUMN     "condition" "KitCondition" NOT NULL,
DROP COLUMN "version",
ADD COLUMN     "version" "KitVersion" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
