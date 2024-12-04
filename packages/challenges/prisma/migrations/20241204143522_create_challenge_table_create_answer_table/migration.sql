-- CreateEnum
CREATE TYPE "AnswerStatus" AS ENUM ('PENDING', 'ERROR', 'DONE');

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "repository_url" TEXT NOT NULL,
    "status" "AnswerStatus" NOT NULL DEFAULT 'PENDING',
    "grade" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "answer_repository_url_key" ON "answer"("repository_url");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_title_key" ON "challenge"("title");

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
