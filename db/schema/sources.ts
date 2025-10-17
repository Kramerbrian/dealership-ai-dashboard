// External Sources & GEO Signals Schema
// DealershipAI - Third-party Evidence Ingestion (Metadata Only)

import { pgTable, uuid, text, varchar, integer, numeric, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const external_sources = pgTable("external_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  provider: varchar("provider", { length: 64 }).notNull(), // "seopowersuite:blog", "ahrefs:blog", etc.
  url: text("url").notNull(),
  title: text("title"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
  // store only hashes/metadata, not full article
  contentHash: varchar("content_hash", { length: 64 }).notNull(),
  // provenance tracking
  sourceType: varchar("source_type", { length: 32 }).notNull().default("blog"), // blog, guide, tool, etc.
  author: text("author"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  // metadata for governance
  isActive: boolean("is_active").notNull().default(true),
  lastProcessedAt: timestamp("last_processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  tenantProviderIdx: index("idx_external_sources_tenant_provider").on(table.tenantId, table.provider),
  urlIdx: index("idx_external_sources_url").on(table.url),
}));

export const geo_signals = pgTable("geo_signals", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  sourceId: uuid("source_id").references(() => external_sources.id).notNull(),
  // normalized 0–100 scores
  geoChecklistScore: integer("geo_checklist_score").notNull(), // 0–100
  aioExposurePct: numeric("aio_exposure_pct").notNull(),         // 0–100
  topicalDepthScore: integer("topical_depth_score").notNull(),   // 0–100
  kgPresent: boolean("kg_present").notNull(),
  kgCompleteness: integer("kg_completeness").notNull(),          // 0–100
  mentionVelocity4w: integer("mention_velocity_4w").notNull(),   // count
  extractabilityScore: integer("extractability_score").notNull(), // 0–100
  // computed composite scores
  geoReadinessScore: integer("geo_readiness_score").notNull(),   // computed AIV_geo
  stabilityScore: integer("stability_score").notNull(),          // 0–100 (swing detection)
  // metadata
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  dataPoints: integer("data_points").notNull().default(1), // number of sources used
  confidence: numeric("confidence").notNull().default(0.8), // 0–1
  notes: text("notes"), // for instability flags, etc.
}, (table) => ({
  tenantComputedIdx: index("idx_geo_signals_tenant_computed").on(table.tenantId, table.computedAt),
  sourceIdx: index("idx_geo_signals_source").on(table.sourceId),
}));

// Composite scores table for AIV integration
export const composite_scores = pgTable("composite_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  scoreType: varchar("score_type", { length: 32 }).notNull(), // "aiv_geo", "rar_geo", "elasticity_geo"
  scoreValue: numeric("score_value").notNull(),
  components: text("components").notNull(), // JSON of component scores
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  windowWeeks: integer("window_weeks").notNull().default(1),
  confidence: numeric("confidence").notNull().default(0.8),
  status: varchar("status", { length: 16 }).notNull().default("stable"), // stable, unstable, paused
}, (table) => ({
  tenantTypeIdx: index("idx_composite_scores_tenant_type").on(table.tenantId, table.scoreType),
}));

// Relations
export const externalSourcesRelations = relations(external_sources, ({ many }) => ({
  geoSignals: many(geo_signals),
}));

export const geoSignalsRelations = relations(geo_signals, ({ one }) => ({
  source: one(external_sources, {
    fields: [geo_signals.sourceId],
    references: [external_sources.id],
  }),
}));

export const compositeScoresRelations = relations(composite_scores, ({ one }) => ({
  // Add relations as needed
}));

// Types for TypeScript
export type ExternalSource = typeof external_sources.$inferSelect;
export type NewExternalSource = typeof external_sources.$inferInsert;
export type GeoSignal = typeof geo_signals.$inferSelect;
export type NewGeoSignal = typeof geo_signals.$inferInsert;
export type CompositeScore = typeof composite_scores.$inferSelect;
export type NewCompositeScore = typeof composite_scores.$inferInsert;

// GEO Readiness Score Components
export interface GeoReadinessComponents {
  geoChecklist: number;
  topicalDepth: number;
  extractability: number;
  kgPresence: number;
  aioExposure: number;
  mentionVelocity: number;
}

// Signal computation result
export interface SignalComputationResult {
  geoChecklistScore: number;
  aioExposurePct: number;
  topicalDepthScore: number;
  kgPresent: boolean;
  kgCompleteness: number;
  mentionVelocity4w: number;
  extractabilityScore: number;
  geoReadinessScore: number;
  confidence: number;
}
