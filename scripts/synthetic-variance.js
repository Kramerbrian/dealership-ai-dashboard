// scripts/synthetic-variance.js
// Runs: Daily at 3am (cron: 0 3 * * *)

const { Pool } = require('pg');
const Redis = require('ioredis');

class SyntheticVarianceEngine {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async addVariance() {
    console.log('🎲 Adding synthetic variance to scores...');
    
    const dealerships = await this.getActiveDealerships();
    const results = {
      updated: 0,
      errors: 0,
    };

    for (const dealer of dealerships) {
      try {
        await this.addVarianceToDealer(dealer);
        results.updated++;
      } catch (error) {
        console.error(`❌ Failed to add variance for ${dealer.domain}:`, error.message);
        results.errors++;
      }
    }

    console.log(`✅ Variance addition complete: ${results.updated} updated, ${results.errors} errors`);
    return results;
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
        ai_visibility,
        zero_click_shield,
        ugc_health,
        geo_trust,
        sgp_integrity
      FROM dealerships d
      JOIN dealership_scores ds ON d.id = ds.dealership_id
      WHERE d.active = true
        AND ds.last_variance_update < NOW() - INTERVAL '23 hours'
      ORDER BY ds.last_variance_update ASC NULLS FIRST
      LIMIT 1000
    `);
    
    return result.rows;
  }

  async addVarianceToDealer(dealer) {
    // Generate deterministic but time-based variance
    const variance = this.calculateVariance(dealer);
    
    // Apply variance to scores
    const newScores = {
      ai_visibility: this.applyVariance(dealer.ai_visibility, variance.ai_visibility),
      zero_click_shield: this.applyVariance(dealer.zero_click_shield, variance.zero_click_shield),
      ugc_health: this.applyVariance(dealer.ugc_health, variance.ugc_health),
      geo_trust: this.applyVariance(dealer.geo_trust, variance.geo_trust),
      sgp_integrity: this.applyVariance(dealer.sgp_integrity, variance.sgp_integrity),
    };

    // Update database
    await this.db.query(`
      UPDATE dealership_scores
      SET 
        ai_visibility = $1,
        zero_click_shield = $2,
        ugc_health = $3,
        geo_trust = $4,
        sgp_integrity = $5,
        last_variance_update = NOW()
      WHERE dealership_id = $6
    `, [
      newScores.ai_visibility,
      newScores.zero_click_shield,
      newScores.ugc_health,
      newScores.geo_trust,
      newScores.sgp_integrity,
      dealer.id,
    ]);

    // Update cache
    await this.updateCache(dealer.domain, newScores);

    // Log variance application
    await this.logVariance(dealer.id, variance, newScores);
  }

  calculateVariance(dealer) {
    // Create deterministic seed based on dealer + date
    const seed = this.createSeed(dealer.domain, new Date().toISOString().split('T')[0]);
    
    // Generate variance for each score type
    return {
      ai_visibility: this.generateVariance(seed, 'ai_visibility'),
      zero_click_shield: this.generateVariance(seed + 1, 'zero_click_shield'),
      ugc_health: this.generateVariance(seed + 2, 'ugc_health'),
      geo_trust: this.generateVariance(seed + 3, 'geo_trust'),
      sgp_integrity: this.generateVariance(seed + 4, 'sgp_integrity'),
    };
  }

  createSeed(domain, date) {
    // Create deterministic seed from domain + date
    const combined = `${domain}-${date}`;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  generateVariance(seed, scoreType) {
    // Use seeded random number generator
    const random = this.seededRandom(seed);
    
    // Different variance patterns for different score types
    const varianceConfig = {
      ai_visibility: { min: -3, max: 3, frequency: 0.8 },
      zero_click_shield: { min: -2, max: 2, frequency: 0.6 },
      ugc_health: { min: -4, max: 4, frequency: 0.7 },
      geo_trust: { min: -2, max: 2, frequency: 0.5 },
      sgp_integrity: { min: -1, max: 1, frequency: 0.4 },
    };

    const config = varianceConfig[scoreType];
    
    // Apply frequency (not all scores change every day)
    if (random() > config.frequency) {
      return 0; // No change
    }

    // Generate variance within bounds
    const variance = config.min + (random() * (config.max - config.min));
    return Math.round(variance * 10) / 10; // Round to 1 decimal
  }

  seededRandom(seed) {
    // Simple seeded random number generator
    let current = seed;
    return function() {
      current = (current * 9301 + 49297) % 233280;
      return current / 233280;
    };
  }

  applyVariance(currentScore, variance) {
    const newScore = currentScore + variance;
    
    // Clamp to valid range [0, 100]
    return Math.max(0, Math.min(100, Math.round(newScore)));
  }

  async updateCache(domain, scores) {
    const key = `dai:scores:${domain}`;
    
    try {
      // Get existing cached data
      const cached = await this.redis.get(key);
      if (cached) {
        const data = JSON.parse(cached);
        
        // Update scores
        Object.assign(data, scores);
        data.last_updated = new Date().toISOString();
        data.variance_applied = true;
        
        // Update cache
        await this.redis.setex(key, 86400, JSON.stringify(data));
      }
    } catch (error) {
      console.warn(`Failed to update cache for ${domain}:`, error.message);
    }
  }

  async logVariance(dealershipId, variance, newScores) {
    try {
      await this.db.query(`
        INSERT INTO variance_logs (
          dealership_id,
          variance_applied,
          new_scores,
          timestamp
        ) VALUES ($1, $2, $3, NOW())
      `, [
        dealershipId,
        JSON.stringify(variance),
        JSON.stringify(newScores),
      ]);
    } catch (error) {
      console.warn('Failed to log variance:', error.message);
    }
  }

  // Utility method to reset all variance (for testing)
  async resetAllVariance() {
    console.log('🔄 Resetting all variance...');
    
    const result = await this.db.query(`
      UPDATE dealership_scores
      SET 
        ai_visibility = base_ai_visibility,
        zero_click_shield = base_zero_click_shield,
        ugc_health = base_ugc_health,
        geo_trust = base_geo_trust,
        sgp_integrity = base_sgp_integrity,
        last_variance_update = NOW()
      WHERE base_ai_visibility IS NOT NULL
    `);

    console.log(`✅ Reset variance for ${result.rowCount} dealerships`);
    return result.rowCount;
  }
}

// Execute
if (require.main === module) {
  const engine = new SyntheticVarianceEngine();
  
  // Check command line arguments
  const args = process.argv.slice(2);
  if (args.includes('--reset')) {
    engine.resetAllVariance()
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Reset failed:', err);
        process.exit(1);
      });
  } else {
    engine.addVariance()
      .then(() => process.exit(0))
      .catch(err => {
        console.error('Variance addition failed:', err);
        process.exit(1);
      });
  }
}

module.exports = SyntheticVarianceEngine;
