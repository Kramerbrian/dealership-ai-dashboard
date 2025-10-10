/**
 * Base Scorer Class - Eliminates Code Duplication
 * All three pillars inherit from this base class
 */

import { Dealer } from './types';

export abstract class BaseScorer {
  protected weights: Record<string, number> = {};
  
  abstract calculateComponents(dealer: Dealer, data: any): Record<string, number>;
  
  calculateScore(components: Record<string, number>): number {
    return Object.entries(components).reduce(
      (sum, [key, value]) => sum + value * (this.weights[key] || 0),
      0
    );
  }
  
  normalize(value: number, min: number, max: number): number {
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  protected calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  protected calculatePercentage(part: number, total: number): number {
    return total > 0 ? (part / total) * 100 : 0;
  }
}
