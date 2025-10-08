/**
 * Setup script for external sources and geo signals data
 * This will create the tables and insert sample data if they don't exist
 */

export async function setupSourcesData(db: any) {
  try {
    // Check if tables exist, if not create them
    const { data: tablesExist } = await db
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['external_sources', 'geo_signals']);

    if (!tablesExist || tablesExist.length < 2) {
      console.log('📊 Creating external_sources and geo_signals tables...');
      
      // Create external_sources table
      await db.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS external_sources (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            provider VARCHAR(64) NOT NULL,
            url TEXT NOT NULL,
            title TEXT,
            fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            content_hash VARCHAR(64) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      // Create geo_signals table
      await db.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS geo_signals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            source_id UUID REFERENCES external_sources(id) ON DELETE CASCADE NOT NULL,
            geo_checklist_score INTEGER NOT NULL CHECK (geo_checklist_score >= 0 AND geo_checklist_score <= 100),
            aio_exposure_pct NUMERIC(5,2) NOT NULL CHECK (aio_exposure_pct >= 0 AND aio_exposure_pct <= 100),
            topical_depth_score INTEGER NOT NULL CHECK (topical_depth_score >= 0 AND topical_depth_score <= 100),
            kg_present BOOLEAN NOT NULL DEFAULT false,
            kg_completeness INTEGER NOT NULL CHECK (kg_completeness >= 0 AND kg_completeness <= 100),
            mention_velocity_4w INTEGER NOT NULL DEFAULT 0,
            extractability_score INTEGER NOT NULL CHECK (extractability_score >= 0 AND extractability_score <= 100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      console.log('✅ Tables created successfully');
    }

    // Insert sample data if tables are empty
    const { data: sourcesCount } = await db
      .from('external_sources')
      .select('id', { count: 'exact' });

    if (!sourcesCount || sourcesCount.length === 0) {
      console.log('📝 Inserting sample external sources data...');
      
      const sampleSources = [
        {
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          provider: 'seopowersuite:blog',
          url: 'https://example.com/blog/seo-best-practices',
          title: 'SEO Best Practices for Dealerships',
          content_hash: 'hash_seo_best_practices_123',
          fetched_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        },
        {
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          provider: 'google:news',
          url: 'https://news.google.com/local-dealership-news',
          title: 'Local Car Dealership News',
          content_hash: 'hash_local_news_456',
          fetched_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          provider: 'bing:web',
          url: 'https://bing.com/dealership-marketing-tips',
          title: 'Dealership Marketing Tips',
          content_hash: 'hash_marketing_tips_789',
          fetched_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        },
        {
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          provider: 'yahoo:finance',
          url: 'https://finance.yahoo.com/auto-industry-trends',
          title: 'Auto Industry Trends',
          content_hash: 'hash_industry_trends_101',
          fetched_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        },
        {
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
          provider: 'seopowersuite:blog',
          url: 'https://example.com/blog/local-seo-guide',
          title: 'Complete Local SEO Guide for Dealerships',
          content_hash: 'hash_local_seo_guide_202',
          fetched_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        },
      ];

      const { data: insertedSources, error: sourcesError } = await db
        .from('external_sources')
        .insert(sampleSources)
        .select();

      if (sourcesError) {
        console.error('Error inserting sample sources:', sourcesError);
        return;
      }

      console.log('✅ Sample sources inserted successfully');

      // Insert corresponding geo signals data
      if (insertedSources && insertedSources.length > 0) {
        console.log('📊 Inserting sample geo signals data...');
        
        const sampleGeoSignals = insertedSources.map((source, index) => ({
          tenant_id: source.tenant_id,
          source_id: source.id,
          geo_checklist_score: Math.floor(Math.random() * 40) + 60, // 60-100
          aio_exposure_pct: Math.round((Math.random() * 30 + 70) * 100) / 100, // 70-100
          topical_depth_score: Math.floor(Math.random() * 35) + 65, // 65-100
          kg_present: Math.random() > 0.3, // 70% true
          kg_completeness: Math.floor(Math.random() * 25) + 75, // 75-100
          mention_velocity_4w: Math.floor(Math.random() * 20) + 5, // 5-25
          extractability_score: Math.floor(Math.random() * 30) + 70, // 70-100
        }));

        const { error: signalsError } = await db
          .from('geo_signals')
          .insert(sampleGeoSignals);

        if (signalsError) {
          console.error('Error inserting sample geo signals:', signalsError);
          return;
        }

        console.log('✅ Sample geo signals inserted successfully');
      }
    }

    console.log('🎉 Sources data setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up sources data:', error);
  }
}
