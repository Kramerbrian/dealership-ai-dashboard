-- Reuse existing 'integrations' table; store provider-specific data in metadata JSON.
-- Add convenience indexes for common lookups.

-- kind = 'reviews' → metadata: { "place_id": "ChIJ...", "provider": "google" }
-- kind = 'visibility' → metadata: { "engines": { "ChatGPT": true, "Perplexity": true, "Gemini": true, "Copilot": true } }

create index if not exists integrations_kind_idx on public.integrations(kind);
create index if not exists integrations_tenant_idx on public.integrations(tenant_id);

-- (Optional) JSON indexes for quick filter
create index if not exists integrations_metadata_placeid_idx
  on public.integrations ((metadata->>'place_id'))
  where kind = 'reviews';

create index if not exists integrations_metadata_engines_idx
  on public.integrations ((metadata->'engines'))
  where kind = 'visibility';

