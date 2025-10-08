import { pgTable, uuid, text, varchar, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core"

export const external_sources = pgTable("external_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(), // "seopowersuite:blog"
  url: text("url").notNull(),
  title: text("title"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  // store only hashes/metadata, not full article
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
}, (table) => ({
  tenantIdx: index("external_sources_tenant_idx").on(table.tenantId),
  providerIdx: index("external_sources_provider_idx").on(table.provider),
  fetchedAtIdx: index("external_sources_fetched_at_idx").on(table.fetchedAt),
}))

export const geo_signals = pgTable("geo_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  sourceId: uuid("source_id").references(() => external_sources.id).notNull(),
  // normalized 0–100
  geoChecklistScore: integer("geo_checklist_score").notNull(),
  aioExposurePct: numeric("aio_exposure_pct").notNull(),         // 0–100
  topicalDepthScore: integer("topical_depth_score").notNull(),   // 0–100
  kgPresent: boolean("kg_present").notNull(),
  kgCompleteness: integer("kg_completeness").notNull(),          // 0–100
  mentionVelocity4w: integer("mention_velocity_4w").notNull(),   // count
  extractabilityScore: integer("extractability_score").notNull(), // 0–100
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("geo_signals_tenant_idx").on(table.tenantId),
  sourceIdx: index("geo_signals_source_idx").on(table.sourceId),
  computedAtIdx: index("geo_signals_computed_at_idx").on(table.computedAt),
}))

// Composite scores table for AIV integration
export const geo_composite_scores = pgTable("geo_composite_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  dealershipId: uuid("dealership_id"),
  // AIV sub-factor
  aivGeoScore: numeric("aiv_geo_score").notNull(), // 0–100
  // RaR adjustment factor
  rarAdjustmentFactor: numeric("rar_adjustment_factor").notNull(), // 0.8–1.2
  // Weekly change tracking
  weeklyChange: numeric("weekly_change").notNull().default("0"),
  // Stability flag
  isStable: boolean("is_stable").notNull().default(true),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("geo_composite_tenant_idx").on(table.tenantId),
  dealershipIdx: index("geo_composite_dealership_idx").on(table.dealershipId),
  computedAtIdx: index("geo_composite_computed_at_idx").on(table.computedAt),
}))
