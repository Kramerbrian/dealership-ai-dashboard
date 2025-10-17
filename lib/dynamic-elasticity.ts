// Dynamic Elasticity Engine with SHAP drivers
export interface ElasticityFeatures {
  aiv: number;
  ati: number;
  crs: number;
  iti: number;
  cis: number;
  seasonality: number;
  marketConditions: number;
  competitorActivity: number;
  contentFreshness: number;
  schemaCompleteness: number;
}

export interface SHAPDriver {
  feature: string;
  value: number;
  shapValue: number;
  contribution: number; // percentage contribution to elasticity
  direction: 'positive' | 'negative';
  confidence: number;
}

export interface ElasticityModel {
  coefficients: Record<string, number>;
  intercept: number;
  r2: number;
  mse: number;
  featureImportance: Record<string, number>;
  lastUpdated: Date;
  version: string;
}

export class DynamicElasticityEngine {
  private model: ElasticityModel | null = null;
  private historicalData: Array<{ features: ElasticityFeatures; elasticity: number; timestamp: Date }> = [];

  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    // Initialize with default coefficients based on industry research
    this.model = {
      coefficients: {
        aiv: 0.45,
        ati: 0.32,
        crs: 0.28,
        iti: 0.15,
        cis: 0.22,
        seasonality: 0.08,
        marketConditions: 0.12,
        competitorActivity: -0.05,
        contentFreshness: 0.18,
        schemaCompleteness: 0.25
      },
      intercept: 15.2,
      r2: 0.0,
      mse: 0.0,
      featureImportance: {
        aiv: 0.25,
        ati: 0.20,
        crs: 0.18,
        iti: 0.10,
        cis: 0.15,
        seasonality: 0.05,
        marketConditions: 0.08,
        competitorActivity: 0.03,
        contentFreshness: 0.12,
        schemaCompleteness: 0.15
      },
      lastUpdated: new Date(),
      version: '1.0.0'
    };
  }

  // Calculate elasticity using current model
  calculateElasticity(features: ElasticityFeatures): number {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    let elasticity = this.model.intercept;
    
    for (const [feature, coefficient] of Object.entries(this.model.coefficients)) {
      const value = features[feature as keyof ElasticityFeatures] || 0;
      elasticity += coefficient * value;
    }

    return Math.max(0, elasticity); // Ensure non-negative elasticity
  }

  // Calculate SHAP values for feature attribution
  calculateSHAPDrivers(features: ElasticityFeatures): SHAPDriver[] {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const drivers: SHAPDriver[] = [];
    const baseElasticity = this.calculateElasticity(features);

    for (const [feature, coefficient] of Object.entries(this.model.coefficients)) {
      const value = features[feature as keyof ElasticityFeatures] || 0;
      const shapValue = coefficient * value;
      const contribution = (Math.abs(shapValue) / baseElasticity) * 100;
      
      drivers.push({
        feature,
        value,
        shapValue,
        contribution,
        direction: shapValue >= 0 ? 'positive' : 'negative',
        confidence: this.model.featureImportance[feature] || 0
      });
    }

    // Sort by absolute contribution
    return drivers.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  }

  // Update model with new data point
  updateModel(features: ElasticityFeatures, actualElasticity: number) {
    this.historicalData.push({
      features,
      elasticity: actualElasticity,
      timestamp: new Date()
    });

    // Keep only last 100 data points for performance
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }

    // Retrain model if we have enough data
    if (this.historicalData.length >= 20) {
      this.retrainModel();
    }
  }

  // Simple linear regression retraining
  private retrainModel() {
    if (this.historicalData.length < 10) return;

    const X = this.historicalData.map(d => [
      d.features.aiv,
      d.features.ati,
      d.features.crs,
      d.features.iti,
      d.features.cis,
      d.features.seasonality,
      d.features.marketConditions,
      d.features.competitorActivity,
      d.features.contentFreshness,
      d.features.schemaCompleteness
    ]);

    const y = this.historicalData.map(d => d.elasticity);

    // Simple OLS regression (in production, use a proper ML library)
    const { coefficients, intercept, r2, mse } = this.simpleLinearRegression(X, y);

    if (this.model) {
      this.model.coefficients = {
        aiv: coefficients[0],
        ati: coefficients[1],
        crs: coefficients[2],
        iti: coefficients[3],
        cis: coefficients[4],
        seasonality: coefficients[5],
        marketConditions: coefficients[6],
        competitorActivity: coefficients[7],
        contentFreshness: coefficients[8],
        schemaCompleteness: coefficients[9]
      };
      this.model.intercept = intercept;
      this.model.r2 = r2;
      this.model.mse = mse;
      this.model.lastUpdated = new Date();
      this.model.version = this.incrementVersion(this.model.version);
    }
  }

  // Simple linear regression implementation
  private simpleLinearRegression(X: number[][], y: number[]): {
    coefficients: number[];
    intercept: number;
    r2: number;
    mse: number;
  } {
    const n = X.length;
    const p = X[0].length;

    // Add intercept column
    const XWithIntercept = X.map(row => [1, ...row]);
    
    // Calculate X'X and X'y
    const XtX = Array(p + 1).fill(0).map(() => Array(p + 1).fill(0));
    const Xty = Array(p + 1).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= p; j++) {
        for (let k = 0; k <= p; k++) {
          XtX[j][k] += XWithIntercept[i][j] * XWithIntercept[i][k];
        }
        Xty[j] += XWithIntercept[i][j] * y[i];
      }
    }

    // Solve normal equations (simplified - in production use proper matrix solver)
    const coefficients = this.solveLinearSystem(XtX, Xty);
    const intercept = coefficients[0];
    const coefs = coefficients.slice(1);

    // Calculate R² and MSE
    const yPred = X.map(row => {
      let pred = intercept;
      for (let i = 0; i < p; i++) {
        pred += coefs[i] * row[i];
      }
      return pred;
    });

    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    const r2 = 1 - (ssRes / ssTot);
    const mse = ssRes / n;

    return { coefficients: coefs, intercept, r2, mse };
  }

  // Simple Gaussian elimination for solving linear system
  private solveLinearSystem(A: number[][], b: number[]): number[] {
    const n = A.length;
    const augmented = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= augmented[i][j] * x[j];
      }
      x[i] /= augmented[i][i];
    }

    return x;
  }

  private incrementVersion(version: string): string {
    const [major, minor, patch] = version.split('.').map(Number);
    return `${major}.${minor}.${patch + 1}`;
  }

  // Get model status
  getModelStatus() {
    return {
      model: this.model,
      dataPoints: this.historicalData.length,
      lastUpdate: this.historicalData.length > 0 ? this.historicalData[this.historicalData.length - 1].timestamp : null
    };
  }
}

// Export singleton instance
export const elasticityEngine = new DynamicElasticityEngine();
