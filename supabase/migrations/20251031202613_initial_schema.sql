-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN', 'OWNER');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "DealerType" AS ENUM ('FRANCHISE', 'INDEPENDENT', 'LUXURY', 'VOLUME');

-- CreateEnum
CREATE TYPE "SessionAction" AS ENUM ('ANALYZE', 'VIEW_DASHBOARD', 'GENERATE_SCHEMA', 'MYSTERY_SHOP', 'EXPORT_REPORT');

-- CreateEnum
CREATE TYPE "ShopStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('OAUTH', 'API_KEY', 'USERNAME_PASSWORD');

-- CreateEnum
CREATE TYPE "ImpactLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "EffortLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "tier" "Tier" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealers" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT,
    "phone" TEXT,
    "brands" TEXT[],
    "type" "DealerType" NOT NULL DEFAULT 'FRANCHISE',
    "poolKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAnalyzedAt" TIMESTAMP(3),

    CONSTRAINT "dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "qaiScore" DOUBLE PRECISION NOT NULL,
    "aiVisibility" DOUBLE PRECISION NOT NULL,
    "zeroClickShield" DOUBLE PRECISION NOT NULL,
    "ugcHealth" DOUBLE PRECISION NOT NULL,
    "geoTrust" DOUBLE PRECISION NOT NULL,
    "sgpIntegrity" DOUBLE PRECISION NOT NULL,
    "platforms" JSONB NOT NULL,
    "isRealQuery" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "pooledFrom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eat_scores" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "experience" DOUBLE PRECISION NOT NULL,
    "expertise" DOUBLE PRECISION NOT NULL,
    "authoritativeness" DOUBLE PRECISION NOT NULL,
    "trustworthiness" DOUBLE PRECISION NOT NULL,
    "overallEAT" DOUBLE PRECISION NOT NULL,
    "signals" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eat_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealerId" TEXT,
    "action" "SessionAction" NOT NULL,
    "tier" "Tier" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitors" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "competitorDomain" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "myScore" DOUBLE PRECISION,
    "theirScore" DOUBLE PRECISION,
    "delta" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "alertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastComparedAt" TIMESTAMP(3),

    CONSTRAINT "competitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mystery_shops" (
    "id" TEXT NOT NULL,
    "dealerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "mentioned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,
    "citationQuality" TEXT,
    "competitorsMentioned" TEXT[],
    "fullResponse" TEXT NOT NULL,
    "responseTime" INTEGER,
    "responseScore" DOUBLE PRECISION,
    "followUpScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "status" "ShopStatus" NOT NULL DEFAULT 'COMPLETED',
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.02,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "platformType" "CredentialType" NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cache_entries" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "poolKey" TEXT,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "statusCode" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" "ImpactLevel" NOT NULL,
    "impactScore" DOUBLE PRECISION NOT NULL,
    "priority" INTEGER NOT NULL,
    "estimatedROI" DOUBLE PRECISION NOT NULL,
    "estimatedAIVGain" DOUBLE PRECISION NOT NULL,
    "effort" "EffortLevel" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_events" (
    "id" TEXT NOT NULL,
    "domain" TEXT,
    "featureName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "shareUrl" TEXT NOT NULL,
    "referralCode" TEXT,
    "unlockExpiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "share_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tier_idx" ON "users"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "dealers_domain_key" ON "dealers"("domain");

-- CreateIndex
CREATE INDEX "dealers_userId_idx" ON "dealers"("userId");

-- CreateIndex
CREATE INDEX "dealers_poolKey_idx" ON "dealers"("poolKey");

-- CreateIndex
CREATE INDEX "dealers_domain_idx" ON "dealers"("domain");

-- CreateIndex
CREATE INDEX "scores_dealerId_idx" ON "scores"("dealerId");

-- CreateIndex
CREATE INDEX "scores_analyzedAt_idx" ON "scores"("analyzedAt");

-- CreateIndex
CREATE INDEX "scores_pooledFrom_idx" ON "scores"("pooledFrom");

-- CreateIndex
CREATE INDEX "eat_scores_dealerId_idx" ON "eat_scores"("dealerId");

-- CreateIndex
CREATE INDEX "eat_scores_analyzedAt_idx" ON "eat_scores"("analyzedAt");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_createdAt_idx" ON "sessions"("createdAt");

-- CreateIndex
CREATE INDEX "competitors_dealerId_idx" ON "competitors"("dealerId");

-- CreateIndex
CREATE UNIQUE INDEX "competitors_dealerId_competitorDomain_key" ON "competitors"("dealerId", "competitorDomain");

-- CreateIndex
CREATE INDEX "mystery_shops_dealerId_idx" ON "mystery_shops"("dealerId");

-- CreateIndex
CREATE INDEX "mystery_shops_executedAt_idx" ON "mystery_shops"("executedAt");

-- CreateIndex
CREATE INDEX "mystery_shops_platform_idx" ON "mystery_shops"("platform");

-- CreateIndex
CREATE INDEX "credentials_userId_idx" ON "credentials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_userId_platform_key" ON "credentials"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "cache_entries_key_key" ON "cache_entries"("key");

-- CreateIndex
CREATE INDEX "cache_entries_poolKey_idx" ON "cache_entries"("poolKey");

-- CreateIndex
CREATE INDEX "cache_entries_expiresAt_idx" ON "cache_entries"("expiresAt");

-- CreateIndex
CREATE INDEX "webhook_logs_createdAt_idx" ON "webhook_logs"("createdAt");

-- CreateIndex
CREATE INDEX "opportunities_domain_idx" ON "opportunities"("domain");

-- CreateIndex
CREATE INDEX "opportunities_domain_status_idx" ON "opportunities"("domain", "status");

-- CreateIndex
CREATE INDEX "opportunities_impactScore_id_idx" ON "opportunities"("impactScore", "id" DESC);

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "opportunities"("status");

-- CreateIndex
CREATE INDEX "opportunities_category_idx" ON "opportunities"("category");

-- CreateIndex
CREATE INDEX "share_events_domain_idx" ON "share_events"("domain");

-- CreateIndex
CREATE INDEX "share_events_featureName_idx" ON "share_events"("featureName");

-- CreateIndex
CREATE INDEX "share_events_unlockExpiresAt_idx" ON "share_events"("unlockExpiresAt");

-- CreateIndex
CREATE INDEX "share_events_sessionId_idx" ON "share_events"("sessionId");

-- AddForeignKey
ALTER TABLE "dealers" ADD CONSTRAINT "dealers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eat_scores" ADD CONSTRAINT "eat_scores_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_shops" ADD CONSTRAINT "mystery_shops_dealerId_fkey" FOREIGN KEY ("dealerId") REFERENCES "dealers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_shops" ADD CONSTRAINT "mystery_shops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

