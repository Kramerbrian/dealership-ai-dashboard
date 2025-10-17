-- Knowledge Graph entities for grounding and alignment tracking
CREATE TABLE IF NOT EXISTS kg_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  entity_id text NOT NULL,            -- canonical org/dealer entity
  wikidata_qid text,                  -- e.g., Q#####
  schema_org_id text,                 -- @id in JSON-LD graph
  same_as jsonb DEFAULT '[]'::jsonb,  -- ["https://...", "..."]
  completeness_pct numeric(5,2) NOT NULL DEFAULT 0,  -- coverage across IDs/props
  alignment_pct numeric(5,2) NOT NULL DEFAULT 0,     -- query/topic alignment proxy
  updated_at timestamptz DEFAULT now(),
  UNIQUE (tenant_id, entity_id)
);

-- Enable RLS
ALTER TABLE kg_entities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY kg_entities_tenant_select ON kg_entities
  FOR SELECT USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kg_entities_tenant_insert ON kg_entities
  FOR INSERT WITH CHECK (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kg_entities_tenant_update ON kg_entities
  FOR UPDATE USING (tenant_id = current_setting('app.tenant')::uuid);

CREATE POLICY kg_entities_tenant_delete ON kg_entities
  FOR DELETE USING (tenant_id = current_setting('app.tenant')::uuid);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kg_tenant ON kg_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kg_entity_id ON kg_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_kg_wikidata ON kg_entities(wikidata_qid) WHERE wikidata_qid IS NOT NULL;
