ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_token_key"
ON "VerificationToken"("token");
CREATE INDEX IF NOT EXISTS "VerificationToken_email_idx"
ON "VerificationToken"("email");
CREATE INDEX IF NOT EXISTS "VerificationToken_expiresAt_idx"
ON "VerificationToken"("expiresAt");
