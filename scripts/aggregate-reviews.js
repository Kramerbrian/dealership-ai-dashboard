// scripts/aggregate-reviews.js
// Runs: Every 6 hours (cron: 0 */6 * * *)

const axios = require('axios');
const { Pool } = require('pg');
const Redis = require('ioredis');

class ReviewAggregator {
  constructor() {
    this.db = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = new Redis(process.env.REDIS_URL);
    this.sources = ['google', 'dealerrater', 'cars.com'];
  }

  async aggregate() {
    console.log('📊 Starting review aggregation...');
    
    const dealerships = await this.getDealershipsForUpdate();
    const results = {
      success: 0,
      failed: 0,
      new_reviews: 0,
    };

    for (const dealer of dealerships) {
      try {
        const reviews = await this.fetchAllReviews(dealer);
        const saved = await this.saveReviews(dealer.id, reviews);
        
        results.success++;
        results.new_reviews += saved;
      } catch (error) {
        console.error(`❌ Failed for ${dealer.domain}:`, error.message);
        results.failed++;
      }
    }

    console.log(`✅ Aggregation complete:`, results);
    return results;
  }

  async getDealershipsForUpdate() {
    // Prioritize dealers who haven't been updated in 7+ days
    const result = await this.db.query(`
      SELECT id, domain, name, google_place_id
      FROM dealerships
      WHERE active = true
        AND (last_review_fetch IS NULL OR last_review_fetch < NOW() - INTERVAL '6 hours')
      ORDER BY last_review_fetch ASC NULLS FIRST
      LIMIT 100
    `);
    
    return result.rows;
  }

  async fetchAllReviews(dealer) {
    const allReviews = [];

    for (const source of this.sources) {
      try {
        const reviews = await this.fetchFromSource(source, dealer);
        allReviews.push(...reviews);
      } catch (error) {
        console.warn(`⚠️  ${source} fetch failed for ${dealer.domain}`);
      }
    }

    return allReviews;
  }

  async fetchFromSource(source, dealer) {
    switch (source) {
      case 'google':
        return this.fetchGoogleReviews(dealer);
      case 'dealerrater':
        return this.fetchDealerRaterReviews(dealer);
      case 'cars.com':
        return this.fetchCarsComReviews(dealer);
      default:
        return [];
    }
  }

  async fetchGoogleReviews(dealer) {
    if (!dealer.google_place_id) return [];

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json`,
        {
          params: {
            place_id: dealer.google_place_id,
            fields: 'reviews',
            key: process.env.GOOGLE_PLACES_API_KEY,
          },
        }
      );

      return (response.data.result?.reviews || []).map(r => ({
        source: 'google',
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        created_at: new Date(r.time * 1000),
        source_id: r.time.toString(),
      }));
    } catch (error) {
      console.error('Google API error:', error.message);
      return [];
    }
  }

  async fetchDealerRaterReviews(dealer) {
    // DealerRater scraping (would need proper implementation)
    // This is a placeholder showing the structure
    return [];
  }

  async fetchCarsComReviews(dealer) {
    // Cars.com API integration
    return [];
  }

  async saveReviews(dealershipId, reviews) {
    let newCount = 0;

    for (const review of reviews) {
      try {
        const result = await this.db.query(`
          INSERT INTO reviews (
            dealership_id,
            source,
            author,
            rating,
            text,
            created_at,
            source_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (dealership_id, source, source_id) DO NOTHING
          RETURNING id
        `, [
          dealershipId,
          review.source,
          review.author,
          review.rating,
          review.text,
          review.created_at,
          review.source_id,
        ]);

        if (result.rows.length > 0) newCount++;
      } catch (error) {
        console.error('Review save error:', error.message);
      }
    }

    // Update last fetch timestamp
    await this.db.query(`
      UPDATE dealerships
      SET last_review_fetch = NOW()
      WHERE id = $1
    `, [dealershipId]);

    return newCount;
  }
}

// Execute
if (require.main === module) {
  const aggregator = new ReviewAggregator();
  aggregator.aggregate()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Aggregation failed:', err);
      process.exit(1);
    });
}

module.exports = ReviewAggregator;
