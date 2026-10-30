ALTER TABLE "Score"
ADD COLUMN "finalScoreEntered" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Score"
SET "finalScoreEntered" = true
WHERE "finalScore" <> 0;

CREATE TABLE "InformationPage" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "scheduleImage" BYTEA,
    "scheduleImageName" TEXT,
    "scheduleImageMimeType" TEXT,
    "finalResultsPublishedAt" TIMESTAMP(3),
    "publishedReexamStudents" JSONB,

    CONSTRAINT "InformationPage_pkey" PRIMARY KEY ("id")
);
