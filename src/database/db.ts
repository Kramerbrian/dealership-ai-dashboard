/**
 * Unified Database + Cache Layer
 * Consolidates all data persistence operations
 */

import { Pool } from 'pg';
import { createClient } from 'redis';
import { Dealer, ThreePillarScores } from '../core/types';

class Database {
  private pg: Pool;
  private redis: any;

  constructor() {
    this.pg = new Pool({ connectionString: process.env.DATABASE_URL });
    this.redis = createClient({ url: process.env.REDIS_URL });
    this.redis.connect();
  }

  async getDealer(id: string): Promise<Dealer | null> {
    const cached = await this.redis.get(`dealer:${id}`);
    if (cached) return JSON.parse(cached);

    const result = await this.pg.query('SELECT * FROM dealers WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;

    const dealer = result.rows[0];
    await this.redis.setEx(`dealer:${id}`, 3600, JSON.stringify(dealer));
    return dealer;
  }

  async saveScores(dealerId: string, scores: ThreePillarScores) {
    await this.pg.query(
      'INSERT INTO scores (dealer_id, seo_score, aeo_score, geo_score, overall_score, raw_data) VALUES ($1, $2, $3, $4, $5, $6)',
      [dealerId, scores.seo.score, scores.aeo.score, scores.geo.score, scores.overall, JSON.stringify(scores)]
    );
    await this.redis.setEx(`scores:${dealerId}`, 86400, JSON.stringify(scores));
  }

  async getScores(dealerId: string): Promise<ThreePillarScores | null> {
    const cached = await this.redis.get(`scores:${dealerId}`);
    if (cached) return JSON.parse(cached);

    const result = await this.pg.query(
      'SELECT raw_data FROM scores WHERE dealer_id = $1 ORDER BY created_at DESC LIMIT 1',
      [dealerId]
    );
    
    return result.rows.length > 0 ? result.rows[0].raw_data : null;
  }

  async getAllDealers(): Promise<Dealer[]> {
    const result = await this.pg.query('SELECT * FROM dealers WHERE active = true');
    return result.rows;
  }

  async updateDealer(dealer: Dealer) {
    await this.pg.query(
      'UPDATE dealers SET name = $2, domain = $3, city = $4, state = $5, tier = $6 WHERE id = $1',
      [dealer.id, dealer.name, dealer.domain, dealer.city, dealer.state, dealer.tier]
    );
    await this.redis.del(`dealer:${dealer.id}`);
  }
}

export const db = new Database();
