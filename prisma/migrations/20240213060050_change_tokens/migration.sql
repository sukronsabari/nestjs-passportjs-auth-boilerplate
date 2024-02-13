/*
  Warnings:

  - You are about to drop the `Tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tokens" DROP CONSTRAINT "Tokens_user_id_fkey";

-- DropTable
DROP TABLE "Tokens";

-- CreateTable
CREATE TABLE "Tokenize" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "refresh_token" TEXT,

    CONSTRAINT "Tokenize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Tokenize_refresh_token_idx" ON "Tokenize"("refresh_token");

-- CreateIndex
CREATE UNIQUE INDEX "Tokenize_refresh_token_key" ON "Tokenize"("refresh_token");

-- AddForeignKey
ALTER TABLE "Tokenize" ADD CONSTRAINT "Tokenize_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
