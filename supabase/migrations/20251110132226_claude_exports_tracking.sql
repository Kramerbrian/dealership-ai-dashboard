-- Claude Export Tracking
-- Tracks when exports are generated and accessed for analytics

CREATE TABLE IF NOT EXISTS claude_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  manifest_version TEXT,
  git_branch TEXT,
  git_commit TEXT,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exported_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,

  -- Indexes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Export download tracking
CREATE TABLE IF NOT EXISTS claude_export_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_id UUID NOT NULL REFERENCES claude_exports(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_claude_exports_version ON claude_exports(version);
CREATE INDEX IF NOT EXISTS idx_claude_exports_exported_at ON claude_exports(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_claude_export_downloads_export_id ON claude_export_downloads(export_id);
CREATE INDEX IF NOT EXISTS idx_claude_export_downloads_downloaded_at ON claude_export_downloads(downloaded_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_claude_exports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_claude_exports_updated_at
  BEFORE UPDATE ON claude_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_claude_exports_updated_at();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_export_download_count(export_version TEXT)
RETURNS void AS $$
BEGIN
  UPDATE claude_exports
  SET
    download_count = download_count + 1,
    last_downloaded_at = NOW()
  WHERE version = export_version;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (allow public read for export metadata)
ALTER TABLE claude_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE claude_export_downloads ENABLE ROW LEVEL SECURITY;

-- Allow public to read export metadata
CREATE POLICY "Allow public read on claude_exports"
  ON claude_exports
  FOR SELECT
  USING (true);

-- Only service role can insert/update
CREATE POLICY "Allow service role all on claude_exports"
  ON claude_exports
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role all on claude_export_downloads"
  ON claude_export_downloads
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE claude_exports IS 'Tracks Claude-ingestible export packages for version control and analytics';
COMMENT ON TABLE claude_export_downloads IS 'Tracks individual download events for export analytics';
COMMENT ON COLUMN claude_exports.version IS 'Semantic version or git tag (e.g., v3.0-claude)';
COMMENT ON COLUMN claude_exports.file_size_bytes IS 'Size of the ZIP archive in bytes';
COMMENT ON COLUMN claude_exports.manifest_version IS 'Version from exports/manifest.json';
COMMENT ON COLUMN claude_exports.metadata IS 'Additional metadata: component counts, file counts, etc.';
