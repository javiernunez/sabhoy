-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('GENERAL', 'POLITICA_LOCAL', 'SUCESOS', 'CULTURA', 'DEPORTE');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "summary" TEXT,
ADD COLUMN     "isHero" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "category" "ArticleCategory" NOT NULL DEFAULT 'GENERAL';
