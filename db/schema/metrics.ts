// Elasticity Metrics Schema
// DealershipAI - $ per +1% AIV Signal Implementation

import { pgTable, uuid, date, numeric, integer, boolean, text, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const weekly_kpis = pgTable("weekly_kpis", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  weekStart: date("week_start").notNull(),                 // ISO Mon
  aiVisibilityPct: numeric("ai_visibility_pct").notNull(), // 0–100
  expectedAiDemand: integer("expected_ai_demand").notNull(),
  expectedCvr: numeric("expected_cvr").notNull(),          // 0–1
  avgGrossPerSale: numeric("avg_gross_per_sale").notNull(),
  actualRevenueCaptured: numeric("actual_revenue_captured").notNull(),
  revenueAtRisk: numeric("revenue_at_risk").notNull(),     // computed
  // provenance
  lockedRaRDefinition: boolean("locked_rar_definition").notNull().default(true),
  notes: text("notes"), // for mid-week anomalies
  createdAt: date("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantWeekIdx: index("idx_weekly_kpis_tenant_week").on(table.tenantId, table.weekStart),
}));

export const elasticity_history = pgTable("elasticity_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  computedAt: date("computed_at").notNull(),
  windowWeeks: integer("window_weeks").notNull().default(8),
  elasticityUsdPerPoint: numeric("elasticity_usd_per_point").notNull(), // $ per +1% AIV
  r2: numeric("r2").notNull(),                                          // stability
  deltaCount: integer("delta_count").notNull(), // number of data points used
  status: text("status").notNull().default("stable"), // stable, unstable, paused
  notes: text("notes"), // for definition changes, etc.
  createdAt: date("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantComputedIdx: index("idx_elasticity_tenant_computed").on(table.tenantId, table.computedAt),
}));

export const backlog_tasks = pgTable("backlog_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().index(),
  title: text("title").notNull(),
  description: text("description"),
  effortPoints: integer("effort_points").notNull(),        // 1–13
  estDeltaAivPtsLow: numeric("est_delta_aiv_low").notNull(),
  estDeltaAivPtsHigh: numeric("est_delta_aiv_high").notNull(),
  projectedImpactLow: numeric("projected_impact_low"),     // filled by job
  projectedImpactHigh: numeric("projected_impact_high"),
  impactPerEffortLow: numeric("impact_per_effort_low"),
  impactPerEffortHigh: numeric("impact_per_effort_high"),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, cancelled
  priority: integer("priority").notNull().default(0), // computed from impact/effort
  category: text("category"), // seo, content, technical, etc.
  assignedTo: uuid("assigned_to"), // user ID
  dueDate: date("due_date"),
  createdAt: date("created_at").notNull().defaultNow(),
  updatedAt: date("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantPriorityIdx: index("idx_backlog_tenant_priority").on(table.tenantId, table.priority),
}));

// Relations
export const weeklyKpisRelations = relations(weekly_kpis, ({ one }) => ({
  // Add relations as needed
}));

export const elasticityHistoryRelations = relations(elasticity_history, ({ one }) => ({
  // Add relations as needed
}));

export const backlogTasksRelations = relations(backlog_tasks, ({ one }) => ({
  // Add relations as needed
}));

// Types for TypeScript
export type WeeklyKpi = typeof weekly_kpis.$inferSelect;
export type NewWeeklyKpi = typeof weekly_kpis.$inferInsert;
export type ElasticityHistory = typeof elasticity_history.$inferSelect;
export type NewElasticityHistory = typeof elasticity_history.$inferInsert;
export type BacklogTask = typeof backlog_tasks.$inferSelect;
export type NewBacklogTask = typeof backlog_tasks.$inferInsert;
