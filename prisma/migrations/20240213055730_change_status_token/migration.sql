/*
  Warnings:

  - The `status` column on the `Tokens` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- AlterTable
ALTER TABLE "Tokens" DROP COLUMN "status",
ADD COLUMN     "status" "TokenStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "UserSessionStatus";
