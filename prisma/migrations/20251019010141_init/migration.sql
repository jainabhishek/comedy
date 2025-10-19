-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "aiSuggestionsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Joke" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "premiseId" TEXT,
    "title" TEXT NOT NULL,
    "setup" TEXT NOT NULL,
    "punchline" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedTime" INTEGER NOT NULL DEFAULT 30,
    "energy" TEXT NOT NULL DEFAULT 'medium',
    "type" TEXT NOT NULL DEFAULT 'observational',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Joke_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JokeVersion" (
    "id" TEXT NOT NULL,
    "jokeId" TEXT NOT NULL,
    "setup" TEXT NOT NULL,
    "punchline" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JokeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetTime" INTEGER NOT NULL DEFAULT 300,
    "flowScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineJoke" (
    "id" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "jokeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoutineJoke_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jokeId" TEXT NOT NULL,
    "routineId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualTime" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "notes" TEXT,
    "venue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "Joke_userId_idx" ON "Joke"("userId");

-- CreateIndex
CREATE INDEX "Joke_status_idx" ON "Joke"("status");

-- CreateIndex
CREATE INDEX "Joke_createdAt_idx" ON "Joke"("createdAt");

-- CreateIndex
CREATE INDEX "Joke_userId_status_idx" ON "Joke"("userId", "status");

-- CreateIndex
CREATE INDEX "Joke_userId_createdAt_idx" ON "Joke"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "JokeVersion_jokeId_idx" ON "JokeVersion"("jokeId");

-- CreateIndex
CREATE INDEX "JokeVersion_createdAt_idx" ON "JokeVersion"("createdAt");

-- CreateIndex
CREATE INDEX "Routine_userId_idx" ON "Routine"("userId");

-- CreateIndex
CREATE INDEX "Routine_createdAt_idx" ON "Routine"("createdAt");

-- CreateIndex
CREATE INDEX "Routine_userId_createdAt_idx" ON "Routine"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RoutineJoke_routineId_idx" ON "RoutineJoke"("routineId");

-- CreateIndex
CREATE INDEX "RoutineJoke_jokeId_idx" ON "RoutineJoke"("jokeId");

-- CreateIndex
CREATE INDEX "RoutineJoke_routineId_order_idx" ON "RoutineJoke"("routineId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineJoke_routineId_jokeId_key" ON "RoutineJoke"("routineId", "jokeId");

-- CreateIndex
CREATE INDEX "Performance_userId_idx" ON "Performance"("userId");

-- CreateIndex
CREATE INDEX "Performance_jokeId_idx" ON "Performance"("jokeId");

-- CreateIndex
CREATE INDEX "Performance_routineId_idx" ON "Performance"("routineId");

-- CreateIndex
CREATE INDEX "Performance_date_idx" ON "Performance"("date");

-- CreateIndex
CREATE INDEX "Performance_userId_date_idx" ON "Performance"("userId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Joke" ADD CONSTRAINT "Joke_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JokeVersion" ADD CONSTRAINT "JokeVersion_jokeId_fkey" FOREIGN KEY ("jokeId") REFERENCES "Joke"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineJoke" ADD CONSTRAINT "RoutineJoke_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineJoke" ADD CONSTRAINT "RoutineJoke_jokeId_fkey" FOREIGN KEY ("jokeId") REFERENCES "Joke"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_jokeId_fkey" FOREIGN KEY ("jokeId") REFERENCES "Joke"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
