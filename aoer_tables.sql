-- DealershipAI v2.0 - AOER Tables Creation
-- Execute this SQL directly in your database client (pgAdmin, DBeaver, etc.)

-- Create the main aoer_queries table (partitioned)
CREATE TABLE IF NOT EXISTS public.aoer_queries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    query text NOT NULL,
    week_start date NOT NULL,
    intent text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT aoer_queries_pkey PRIMARY KEY (id, week_start),
    CONSTRAINT aoer_queries_intent_check CHECK (
        intent = ANY (ARRAY[
            'informational'::text,
            'commercial'::text,
            'navigational'::text,
            'other'::text
        ])
    )
) PARTITION BY RANGE (week_start) TABLESPACE pg_default;

-- Create 2025 Q4 partition
CREATE TABLE IF NOT EXISTS public.aoer_queries_2025q4 
PARTITION OF public.aoer_queries 
FOR VALUES FROM ('2025-10-01') TO ('2025-12-31') 
TABLESPACE pg_default;

-- Create unique index for 2025 Q4 partition
CREATE UNIQUE INDEX IF NOT EXISTS aoer_queries_2025q4_pkey 
ON public.aoer_queries_2025q4 
USING btree (tenant_id, query, week_start) 
TABLESPACE pg_default;

-- Create 2026 Q1 partition
CREATE TABLE IF NOT EXISTS public.aoer_queries_2026q1 
PARTITION OF public.aoer_queries 
FOR VALUES FROM ('2026-01-01') TO ('2026-03-31') 
TABLESPACE pg_default;

-- Create unique index for 2026 Q1 partition
CREATE UNIQUE INDEX IF NOT EXISTS aoer_queries_2026q1_pkey 
ON public.aoer_queries_2026q1 
USING btree (tenant_id, query, week_start) 
TABLESPACE pg_default;

-- Create AIV raw signals table
CREATE TABLE IF NOT EXISTS public.aiv_raw_signals (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    dealer_id uuid NULL,
    date date NULL,
    seo numeric NULL,
    aeo numeric NULL,
    geo numeric NULL,
    ugc numeric NULL,
    geolocal numeric NULL,
    observed_aiv numeric NULL,
    observed_rar numeric NULL,
    CONSTRAINT aiv_raw_signals_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create AOER failures table
CREATE TABLE IF NOT EXISTS public.aoer_failures (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    job_name text NULL,
    error_text text NULL,
    payload jsonb NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    CONSTRAINT aoer_failures_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aoer_queries_tenant_week 
ON public.aoer_queries (tenant_id, week_start);

CREATE INDEX IF NOT EXISTS idx_aoer_queries_intent 
ON public.aoer_queries (intent);

CREATE INDEX IF NOT EXISTS idx_aiv_raw_signals_dealer_date 
ON public.aiv_raw_signals (dealer_id, date);

CREATE INDEX IF NOT EXISTS idx_aoer_failures_tenant_created 
ON public.aoer_failures (tenant_id, created_at);

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('aoer_queries', 'aoer_queries_2025q4', 'aoer_queries_2026q1', 'aiv_raw_signals', 'aoer_failures')
ORDER BY tablename;
