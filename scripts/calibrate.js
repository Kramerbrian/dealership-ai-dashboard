// scripts/calibrate.js
// Runs: Monday 2am (cron: 0 2 * * 1)

const { ChatOpenAI } = require('langchain/chat_models/openai');
const { Pool } = require('pg');
const Redis = require('ioredis');

const CALIBRATION_PROMPTS = [
  'Best Hyundai dealer in Naples FL',
  'Where to buy a Honda in Naples',
  'Trustworthy car dealership Naples Florida',
  'Sell my car Naples',
  'Honda service center Naples',
];

class CalibrationEngine {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.3,
    });
    this.monthlyBudget = parseInt(process.env.MINIMAL_AI_QUERY_BUDGET || '50');
  }

  async calibrate() {
    console.log('🎯 Starting calibration run...');
    
    const cities = await this.getCitiesForCalibration();
    const results = [];

    for (const city of cities) {
      const cityPrompts = this.localizPrompts(CALIBRATION_PROMPTS, city);
      
      for (const prompt of cityPrompts.slice(0, 2)) { // Only 2 per city to save budget
        const aiResponse = await this.queryAI(prompt);
        const dealerships = this.extractDealerships(aiResponse);
        
        results.push({
          city,
          prompt,
          dealerships,
          timestamp: new Date(),
        });

        // Cache for geographic pooling
        await this.cacheCalibration(city, dealerships);
        
        // Update real visibility scores
        await this.updateVisibilityScores(city, dealerships);
      }
    }

    await this.logCalibration(results);
    console.log(`✅ Calibration complete: ${results.length} queries executed`);
    
    return results;
  }

  async getCitiesForCalibration() {
    // Get cities with most active dealers
    const result = await this.db.query(`
      SELECT DISTINCT city, state, COUNT(*) as dealer_count
      FROM dealerships
      WHERE active = true
      GROUP BY city, state
      ORDER BY dealer_count DESC
      LIMIT 10
    `);
    
    return result.rows;
  }

  localizPrompts(prompts, city) {
    return prompts.map(p => 
      p.replace(/Naples/g, city.city)
       .replace(/FL/g, city.state)
    );
  }

  async queryAI(prompt) {
    try {
      const response = await this.llm.call([
        { role: 'user', content: prompt }
      ]);
      
      return response.content;
    } catch (error) {
      console.error(`❌ AI query failed: ${error.message}`);
      return '';
    }
  }

  extractDealerships(response) {
    // Extract dealership mentions using regex and NLP
    const dealerships = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      // Match patterns like:
      // "1. Terry Reid Hyundai"
      // "- Joe Smith Honda"
      const match = line.match(/(?:\d+\.|\-)\s*([A-Z][a-zA-Z\s]+(?:Honda|Hyundai|Toyota|Ford|Chevrolet|BMW|Mercedes))/);
      
      if (match) {
        dealerships.push({
          name: match[1].trim(),
          mentioned: true,
          position: dealerships.length + 1,
        });
      }
    }
    
    return dealerships;
  }

  async cacheCalibration(city, dealerships) {
    const key = `dai:calibration:${city.city}:${city.state}`;
    const data = {
      dealerships,
      timestamp: Date.now(),
      ttl: 14 * 24 * 60 * 60, // 14 days
    };
    
    await this.redis.setex(key, data.ttl, JSON.stringify(data));
  }

  async updateVisibilityScores(city, dealerships) {
    // Update real AI visibility component (10% of total score)
    for (const dealer of dealerships) {
      await this.db.query(`
        UPDATE dealership_scores
        SET 
          ai_visibility_real = $1,
          last_calibration = NOW()
        WHERE dealership_name ILIKE $2
          AND city = $3
          AND state = $4
      `, [
        Math.min(100, dealer.position ? (100 - dealer.position * 10) : 0),
        `%${dealer.name}%`,
        city.city,
        city.state,
      ]);
    }
  }

  async logCalibration(results) {
    await this.db.query(`
      INSERT INTO calibration_logs (results, query_count, timestamp)
      VALUES ($1, $2, NOW())
    `, [JSON.stringify(results), results.length]);
  }
}

// Execute
if (require.main === module) {
  const engine = new CalibrationEngine();
  engine.calibrate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Calibration failed:', err);
      process.exit(1);
    });
}

module.exports = CalibrationEngine;
