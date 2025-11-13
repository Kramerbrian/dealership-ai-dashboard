export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || process.env.POSTGRES_URL,
    directUrl: process.env.DIRECT_URL || process.env.POSTGRES_URL,
  },

  // Redis
  redis: {
    url: process.env.REDIS_URL || process.env.KV_URL || 'redis://localhost:6379',
    enabled: process.env.REDIS_URL !== undefined || process.env.KV_URL !== undefined,
  },

  // Webhook Security
  webhook: {
    secret: process.env.WEBHOOK_SECRET || 'default-webhook-secret',
    signatureHeader: process.env.WEBHOOK_SIGNATURE_HEADER || 'x-signature',
    timestampHeader: process.env.WEBHOOK_TIMESTAMP_HEADER || 'x-timestamp',
    algorithm: process.env.HMAC_ALGORITHM || 'sha256',
    timestampTolerance: parseInt(process.env.HMAC_TIMESTAMP_TOLERANCE || '300', 10),
  },

  // OpenTelemetry
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
    serviceName: process.env.OTEL_SERVICE_NAME || 'dealershipai-api',
    serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    enabled: process.env.OTEL_EXPORTER_OTLP_ENDPOINT !== undefined,
  },

  // Feature Flags
  features: {
    enabled: process.env.FEATURE_FLAGS_ENABLED === 'true',
    bandit: process.env.BANDIT_ENABLED === 'true',
    jsonLdPack: process.env.JSON_LD_PACK_ENABLED === 'true',
  },

  // Rate Limiting
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
    api: parseInt(process.env.API_RATE_LIMIT || '1000', 10),
    webhook: parseInt(process.env.WEBHOOK_RATE_LIMIT || '100', 10),
    tenant: parseInt(process.env.TENANT_RATE_LIMIT || '10000', 10),
  },

  // SLO Monitoring
  slo: {
    enabled: process.env.SLO_ENABLED === 'true',
    readP95Target: parseInt(process.env.READ_P95_TARGET || '150', 10),
    writeP95Target: parseInt(process.env.WRITE_P95_TARGET || '400', 10),
    uptimeTarget: parseFloat(process.env.UPTIME_TARGET || '99.9'),
  },

  // Idempotency
  idempotency: {
    enabled: process.env.IDEMPOTENCY_ENABLED === 'true',
    ttl: parseInt(process.env.IDEMPOTENCY_TTL || '86400', 10), // 24 hours
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Environment
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  },
} as const;

export type Config = typeof config;
