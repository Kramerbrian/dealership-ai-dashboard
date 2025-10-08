import { pgTable, uuid, text, varchar, integer, numeric, boolean, timestamp, index, pgEnum } from "drizzle-orm/pg-core"

// Enums
export const intentEnum = pgEnum('intent', ['local', 'inventory', 'finance', 'trade', 'info', 'service', 'brand'])
export const aiPositionEnum = pgEnum('ai_position', ['top', 'mid', 'bottom', 'none'])

// Queries table - stores query metadata
export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  query: text("query").notNull(),
  intent: intentEnum("intent").notNull(),
  locality: varchar("locality", { length: 100 }), // city/zip for dealer groups
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("queries_tenant_idx").on(table.tenantId),
  queryIdx: index("queries_query_idx").on(table.query),
  intentIdx: index("queries_intent_idx").on(table.intent),
}))

// Checks table - one row per crawl/check
export const queryChecks = pgTable("query_checks", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id").references(() => queries.id).notNull(),
  tenantId: uuid("tenant_id").notNull(),
  checkDate: timestamp("check_date", { withTimezone: true }).notNull(),
  
  // Volume and ranking data
  volume: integer("volume").notNull(), // monthly search volume
  serpPosition: integer("serp_position"), // 1-10, null allowed
  
  // AI Overview data
  aiOverviewPresent: boolean("ai_overview_present").notNull().default(false),
  aiOverviewPosition: aiPositionEnum("ai_overview_position").notNull().default("none"),
  aiCitationDomains: text("ai_citation_domains"), // JSON array of domains
  hasOurCitation: boolean("has_our_citation").notNull().default(false),
  aiOverviewTokens: integer("ai_overview_tokens").default(0),
  aiLinksCount: integer("ai_links_count").default(0),
  
  // Other SERP features
  paaPresent: boolean("paa_present").notNull().default(false),
  mapPackPresent: boolean("map_pack_present").notNull().default(false),
  shoppingPresent: boolean("shopping_present").notNull().default(false),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  queryIdx: index("query_checks_query_idx").on(table.queryId),
  tenantIdx: index("query_checks_tenant_idx").on(table.tenantId),
  checkDateIdx: index("query_checks_date_idx").on(table.checkDate),
  aiPresentIdx: index("query_checks_ai_present_idx").on(table.aiOverviewPresent),
}))

// Metrics table - derived calculations
export const queryMetrics = pgTable("query_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkId: uuid("check_id").references(() => queryChecks.id).notNull(),
  queryId: uuid("query_id").references(() => queries.id).notNull(),
  tenantId: uuid("tenant_id").notNull(),
  
  // Core AOER metrics
  aiClaimScore: numeric("ai_claim_score").notNull(), // 0-100
  clickLoss: numeric("click_loss").notNull(), // estimated monthly click loss
  priorityScore: numeric("priority_score").notNull(), // 0-100, for ranking
  
  // CTR calculations
  ctrBase: numeric("ctr_base").notNull(), // baseline CTR
  ctrWithAI: numeric("ctr_with_ai").notNull(), // CTR with AI present
  clicksNoAI: numeric("clicks_no_ai").notNull(), // estimated clicks without AI
  clicksWithAI: numeric("clicks_with_ai").notNull(), // estimated clicks with AI
  
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  checkIdx: index("query_metrics_check_idx").on(table.checkId),
  queryIdx: index("query_metrics_query_idx").on(table.queryId),
  tenantIdx: index("query_metrics_tenant_idx").on(table.tenantId),
  priorityIdx: index("query_metrics_priority_idx").on(table.priorityScore),
  computedAtIdx: index("query_metrics_computed_at_idx").on(table.computedAt),
}))

// AOER rollups table - aggregated metrics by tenant/date
export const aoerRollups = pgTable("aoer_rollups", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  intent: intentEnum("intent"), // null for overall rollup
  rollupDate: timestamp("rollup_date", { withTimezone: true }).notNull(),
  
  // AOER metrics
  aoerUnweighted: numeric("aoer_unweighted").notNull(), // basic AOER
  aoerVolumeWeighted: numeric("aoer_volume_weighted").notNull(), // volume-weighted AOER
  aoerPositional: numeric("aoer_positional").notNull(), // prominence-aware AOER
  aoerPositionalWeighted: numeric("aoer_positional_weighted").notNull(), // volume + prominence
  
  // Additional metrics
  avgAiClaimScore: numeric("avg_ai_claim_score").notNull(),
  citationShare: numeric("citation_share").notNull(), // % queries with our citation
  estimatedMonthlyClickLoss: numeric("estimated_monthly_click_loss").notNull(),
  totalQueries: integer("total_queries").notNull(),
  queriesWithAI: integer("queries_with_ai").notNull(),
  
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("aoer_rollups_tenant_idx").on(table.tenantId),
  intentIdx: index("aoer_rollups_intent_idx").on(table.intent),
  rollupDateIdx: index("aoer_rollups_date_idx").on(table.rollupDate),
}))
