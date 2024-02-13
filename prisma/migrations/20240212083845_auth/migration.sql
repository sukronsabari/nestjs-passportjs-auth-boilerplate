-- AlterTable
ALTER TABLE "Tokens" ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "refresh_token" DROP NOT NULL,
ADD CONSTRAINT "Tokens_pkey" PRIMARY KEY ("id");
