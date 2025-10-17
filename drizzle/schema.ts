/**
 * DealershipAI Site Intelligence - Drizzle Schema
 * 
 * Database schema for site intelligence features including:
 * - Page crawling and analysis
 * - Issue tracking and remediation
 * - AIV/EEAT scoring
 * - Revenue at risk calculations
 */

import { pgTable, text, timestamp, uuid, integer, boolean, jsonb, decimal, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Pages table - stores crawled page data
export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  h1: text('h1'),
  h2: text('h2'),
  h3: text('h3'),
  metaKeywords: text('meta_keywords'),
  metaDescription: text('meta_description'),
  canonicalUrl: text('canonical_url'),
  robotsMeta: text('robots_meta'),
  viewportMeta: text('viewport_meta'),
  openGraphTitle: text('open_graph_title'),
  openGraphDescription: text('open_graph_description'),
  openGraphImage: text('open_graph_image'),
  twitterCard: text('twitter_card'),
  twitterTitle: text('twitter_title'),
  twitterDescription: text('twitter_description'),
  twitterImage: text('twitter_image'),
  structuredData: jsonb('structured_data'),
  internalLinks: jsonb('internal_links'),
  externalLinks: jsonb('external_links'),
  images: jsonb('images'),
  videos: jsonb('videos'),
  forms: jsonb('forms'),
  buttons: jsonb('buttons'),
  navigation: jsonb('navigation'),
  footer: jsonb('footer'),
  header: jsonb('header'),
  content: text('content'),
  wordCount: integer('word_count'),
  readingTime: integer('reading_time'),
  loadTime: decimal('load_time', { precision: 10, scale: 3 }),
  pageSize: integer('page_size'),
  statusCode: integer('status_code'),
  redirectUrl: text('redirect_url'),
  lastCrawled: timestamp('last_crawled').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Issues table - stores identified issues and recommendations
export const issues = pgTable('issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  pageId: uuid('page_id').references(() => pages.id),
  url: text('url').notNull(),
  issueType: varchar('issue_type', { length: 100 }).notNull(), // 'seo', 'performance', 'accessibility', 'security', 'content'
  severity: varchar('severity', { length: 20 }).notNull(), // 'low', 'medium', 'high', 'critical'
  category: varchar('category', { length: 100 }).notNull(), // 'meta', 'content', 'technical', 'ux'
  title: text('title').notNull(),
  description: text('description').notNull(),
  recommendation: text('recommendation').notNull(),
  impact: text('impact'),
  effort: varchar('effort', { length: 20 }), // 'low', 'medium', 'high'
  priority: integer('priority').default(0), // 0-100, higher = more important
  status: varchar('status', { length: 20 }).default('open'), // 'open', 'in_progress', 'resolved', 'ignored'
  assignedTo: uuid('assigned_to'),
  dueDate: timestamp('due_date'),
  resolvedAt: timestamp('resolved_at'),
  resolution: text('resolution'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// AIV Scores table - stores AI Visibility scores
export const aivScores = pgTable('aiv_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  pageId: uuid('page_id').references(() => pages.id),
  url: text('url').notNull(),
  overallScore: decimal('overall_score', { precision: 5, scale: 2 }),
  seoScore: decimal('seo_score', { precision: 5, scale: 2 }),
  aeoScore: decimal('aeo_score', { precision: 5, scale: 2 }),
  geoScore: decimal('geo_score', { precision: 5, scale: 2 }),
  ugcScore: decimal('ugc_score', { precision: 5, scale: 2 }),
  geolocalScore: decimal('geolocal_score', { precision: 5, scale: 2 }),
  observedAiv: decimal('observed_aiv', { precision: 5, scale: 2 }),
  observedRar: decimal('observed_rar', { precision: 5, scale: 2 }),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// EEAT Scores table - stores E-E-A-T scores
export const eeatScores = pgTable('eeat_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  pageId: uuid('page_id').references(() => pages.id),
  url: text('url').notNull(),
  expertiseScore: decimal('expertise_score', { precision: 5, scale: 2 }),
  experienceScore: decimal('experience_score', { precision: 5, scale: 2 }),
  authoritativenessScore: decimal('authoritativeness_score', { precision: 5, scale: 2 }),
  trustworthinessScore: decimal('trustworthiness_score', { precision: 5, scale: 2 }),
  overallScore: decimal('overall_score', { precision: 5, scale: 2 }),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Revenue at Risk table - stores revenue impact calculations
export const revenueAtRisk = pgTable('revenue_at_risk', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  pageId: uuid('page_id').references(() => pages.id),
  url: text('url').notNull(),
  monthlyTraffic: integer('monthly_traffic'),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 4 }),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }),
  currentRevenue: decimal('current_revenue', { precision: 12, scale: 2 }),
  potentialRevenue: decimal('potential_revenue', { precision: 12, scale: 2 }),
  revenueAtRisk: decimal('revenue_at_risk', { precision: 12, scale: 2 }),
  riskPercentage: decimal('risk_percentage', { precision: 5, scale: 2 }),
  priorityIssues: jsonb('priority_issues'),
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow()
});

// Crawl Jobs table - tracks crawling progress
export const crawlJobs = pgTable('crawl_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  jobType: varchar('job_type', { length: 50 }).notNull(), // 'full', 'incremental', 'priority'
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'running', 'completed', 'failed'
  totalPages: integer('total_pages').default(0),
  processedPages: integer('processed_pages').default(0),
  failedPages: integer('failed_pages').default(0),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

// Zod schemas for validation
export const insertPageSchema = createInsertSchema(pages);
export const selectPageSchema = createSelectSchema(pages);

export const insertIssueSchema = createInsertSchema(issues);
export const selectIssueSchema = createSelectSchema(issues);

export const insertAivScoreSchema = createInsertSchema(aivScores);
export const selectAivScoreSchema = createSelectSchema(aivScores);

export const insertEeatScoreSchema = createInsertSchema(eeatScores);
export const selectEeatScoreSchema = createSelectSchema(eeatScores);

export const insertRevenueAtRiskSchema = createInsertSchema(revenueAtRisk);
export const selectRevenueAtRiskSchema = createSelectSchema(revenueAtRisk);

export const insertCrawlJobSchema = createInsertSchema(crawlJobs);
export const selectCrawlJobSchema = createSelectSchema(crawlJobs);

// Type exports
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

export type AivScore = typeof aivScores.$inferSelect;
export type NewAivScore = typeof aivScores.$inferInsert;

export type EeatScore = typeof eeatScores.$inferSelect;
export type NewEeatScore = typeof eeatScores.$inferInsert;

export type RevenueAtRisk = typeof revenueAtRisk.$inferSelect;
export type NewRevenueAtRisk = typeof revenueAtRisk.$inferInsert;

export type CrawlJob = typeof crawlJobs.$inferSelect;
export type NewCrawlJob = typeof crawlJobs.$inferInsert;
