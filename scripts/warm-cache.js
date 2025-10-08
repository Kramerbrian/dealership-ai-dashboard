// scripts/warm-cache.js
// Runs: Every 30 minutes (cron: */30 * * * *)

const { Pool } = require('pg');
const Redis = require('ioredis');
const { calculateSyntheticScore } = require('../src/lib/scoring');

class CacheWarmer {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async warmCache() {
    console.log('🔥 Starting cache warming...');
    
    const dealerships = await this.getActiveDealerships();
    const warmed = [];

    for (const dealer of dealerships) {
      const scores = await this.computeScores(dealer);
      await this.cacheScores(dealer, scores);
      warmed.push(dealer.domain);
    }

    console.log(`✅ Cache warmed: ${warmed.length} dealerships`);
    
    // Also warm geographic pools
    await this.warmGeographicPools();
    
    return warmed;
  }

  async getActiveDealerships() {
    const result = await this.db.query(`
      SELECT 
        id,
        domain,
        name,
        city,
        state,
        dealer_type,
        last_updated
      FROM dealerships
      WHERE active = true
        AND (last_cache_update IS NULL OR last_cache_update < NOW() - INTERVAL '25 minutes')
      ORDER BY priority DESC, last_updated ASC
      LIMIT 500
    `);
    
    return result.rows;
  }

  async computeScores(dealer) {
    // Gather all data sources
    const [gmb, reviews, schema, citations, calibration] = await Promise.all([
      this.getGMBData(dealer),
      this.getReviewData(dealer),
      this.getSchemaData(dealer),
      this.getCitationData(dealer),
      this.getCalibrationData(dealer),
    ]);

    // Compute synthetic scores (90%)
    const synthetic = calculateSyntheticScore({
      gmb_completeness: gmb.completeness,
      schema_presence: schema.score,
      review_velocity: reviews.velocity,
      citation_consistency: citations.consistency,
      local_rank: citations.rank,
    });

    // Blend with real calibration data (10%)
    const aiVisibility = Math.round(
      synthetic.ai_visibility * 0.9 + (calibration?.ai_score || 50) * 0.1
    );

    return {
      ai_visibility: aiVisibility,
      zero_click_shield: synthetic.zero_click,
      ugc_health: reviews.health_score,
      geo_trust: citations.trust_score,
      sgp_integrity: schema.integrity_score,
      last_updated: new Date(),
    };
  }

  async getGMBData(dealer) {
    // Check cache first
    const cached = await this.redis.get(`gmb:${dealer.domain}`);
    if (cached) return JSON.parse(cached);

    // Fetch from GMB API (or use synthetic if unavailable)
    try {
      // Actual GMB API call would go here
      const data = {
        completeness: 75 + Math.random() * 20,
        verified: true,
      };
      
      await this.redis.setex(`gmb:${dealer.domain}`, 86400, JSON.stringify(data));
      return data;
    } catch (error) {
      return { completeness: 65, verified: false };
    }
  }

  async getReviewData(dealer) {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total,
        AVG(rating) as avg_rating,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as recent_count,
        COUNT(*) FILTER (WHERE response IS NOT NULL) as responded
      FROM reviews
      WHERE dealership_id = $1
    `, [dealer.id]);

    const row = result.rows[0];
    
    return {
      velocity: row.recent_count / 30, // reviews per day
      health_score: Math.round(
        (row.total / 100) * 30 +
        (row.avg_rating / 5) * 40 +
        (row.responded / Math.max(row.total, 1)) * 30
      ),
    };
  }

  async getSchemaData(dealer) {
    // Check if domain has proper schema markup
    const cached = await this.redis.get(`schema:${dealer.domain}`);
    if (cached) return JSON.parse(cached);

    // Would normally crawl the site, but we'll use synthetic for now
    const data = {
      score: 60 + Math.random() * 35,
      integrity_score: 55 + Math.random() * 40,
    };

    await this.redis.setex(`schema:${dealer.domain}`, 86400, JSON.stringify(data));
    return data;
  }

  async getCitationData(dealer) {
    const result = await this.db.query(`
      SELECT 
        nap_consistency,
        local_citations,
        rank_estimate
      FROM citation_data
      WHERE dealership_id = $1
      ORDER BY updated_at DESC
      LIMIT 1
    `, [dealer.id]);

    if (result.rows.length === 0) {
      return {
        consistency: 70,
        trust_score: 65,
        rank: 5,
      };
    }

    const row = result.rows[0];
    return {
      consistency: row.nap_consistency,
      trust_score: Math.round(row.nap_consistency * 0.6 + (100 - row.rank_estimate * 10) * 0.4),
      rank: row.rank_estimate,
    };
  }

  async getCalibrationData(dealer) {
    // Get latest calibration data for this dealer's city
    const key = `dai:calibration:${dealer.city}:${dealer.state}`;
    const cached = await this.redis.get(key);
    
    if (!cached) return null;

    const data = JSON.parse(cached);
    const mentioned = data.dealerships.find(d => 
      d.name.toLowerCase().includes(dealer.name.toLowerCase())
    );

    return mentioned ? {
      ai_score: 100 - (mentioned.position * 10),
      position: mentioned.position,
    } : null;
  }

  async cacheScores(dealer, scores) {
    const key = `dai:scores:${dealer.domain}`;
    const data = {
      ...scores,
      dealer_name: dealer.name,
      dealer_type: dealer.dealer_type,
    };

    // Cache for 24 hours
    await this.redis.setex(key, 86400, JSON.stringify(data));

    // Update database
    await this.db.query(`
      UPDATE dealership_scores
      SET 
        ai_visibility = $1,
        zero_click_shield = $2,
        ugc_health = $3,
        geo_trust = $4,
        sgp_integrity = $5,
        last_cache_update = NOW()
      WHERE dealership_id = $6
    `, [
      scores.ai_visibility,
      scores.zero_click_shield,
      scores.ugc_health,
      scores.geo_trust,
      scores.sgp_integrity,
      dealer.id,
    ]);
  }

  async warmGeographicPools() {
    // Pre-compute city-level aggregates for geographic pooling
    const result = await this.db.query(`
      SELECT DISTINCT city, state
      FROM dealerships
      WHERE active = true
    `);

    for (const location of result.rows) {
      const dealers = await this.db.query(`
        SELECT domain, name
        FROM dealerships
        WHERE city = $1 AND state = $2 AND active = true
      `, [location.city, location.state]);

      const scores = await Promise.all(
        dealers.rows.map(d => this.redis.get(`dai:scores:${d.domain}`))
      );

      const validScores = scores.filter(Boolean).map(JSON.parse);
      
      if (validScores.length > 0) {
        const poolKey = `dai:pool:${location.city}:${location.state}`;
        await this.redis.setex(poolKey, 86400, JSON.stringify({
          average_scores: this.calculateAverages(validScores),
          dealer_count: validScores.length,
          updated: new Date(),
        }));
      }
    }
  }

  calculateAverages(scores) {
    const sum = scores.reduce((acc, s) => ({
      ai_visibility: acc.ai_visibility + s.ai_visibility,
      zero_click_shield: acc.zero_click_shield + s.zero_click_shield,
      ugc_health: acc.ugc_health + s.ugc_health,
      geo_trust: acc.geo_trust + s.geo_trust,
      sgp_integrity: acc.sgp_integrity + s.sgp_integrity,
    }), {
      ai_visibility: 0,
      zero_click_shield: 0,
      ugc_health: 0,
      geo_trust: 0,
      sgp_integrity: 0,
    });

    return {
      ai_visibility: Math.round(sum.ai_visibility / scores.length),
      zero_click_shield: Math.round(sum.zero_click_shield / scores.length),
      ugc_health: Math.round(sum.ugc_health / scores.length),
      geo_trust: Math.round(sum.geo_trust / scores.length),
      sgp_integrity: Math.round(sum.sgp_integrity / scores.length),
    };
  }
}

// Execute
if (require.main === module) {
  const warmer = new CacheWarmer();
  warmer.warmCache()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Cache warming failed:', err);
      process.exit(1);
    });
}

module.exports = CacheWarmer;
