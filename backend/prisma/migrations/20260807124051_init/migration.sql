-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "matricNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EligibilityRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "faculty" TEXT,
    "department" TEXT,
    "level" TEXT,
    CONSTRAINT "EligibilityRule_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    CONSTRAINT "Position_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "profilePicture" TEXT,
    "manifesto" TEXT NOT NULL,
    "slogan" TEXT,
    "isDisqualified" BOOLEAN NOT NULL DEFAULT false,
    "disqualifyReason" TEXT,
    "electionId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Candidate_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VoterRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "votedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptHash" TEXT NOT NULL,
    CONSTRAINT "VoterRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VoterRecord_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "electionId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "castAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "electionId" TEXT,
    CONSTRAINT "Announcement_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_matricNumber_key" ON "User"("matricNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EligibilityRule_electionId_key" ON "EligibilityRule"("electionId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRecord_receiptHash_key" ON "VoterRecord"("receiptHash");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRecord_userId_electionId_positionId_key" ON "VoterRecord"("userId", "electionId", "positionId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
