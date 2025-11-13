// Elasticity model with 8-week rolling regression
export interface ElasticityDataPoint {
  week: number;
  aiv: number;
  ati: number;
  crs: number;
  revenue: number;
  traffic: number;
  conversions: number;
  timestamp: Date;
}

export interface ElasticityModel {
  coefficients: {
    aiv: number;
    ati: number;
    crs: number;
    intercept: number;
  };
  r2: number;
  mse: number;
  confidence: number;
  windowSize: number;
  lastUpdated: Date;
}

export interface ElasticityPrediction {
  predictedRevenue: number;
  confidence: number;
  factors: {
    aiv: number;
    ati: number;
    crs: number;
  };
  recommendation: string;
}

export class ElasticityModelEngine {
  private readonly windowSize = 8; // 8-week rolling window
  private readonly minDataPoints = 6; // Minimum data points for reliable model
  private historicalData: ElasticityDataPoint[] = [];

  // Add new data point
  addDataPoint(data: ElasticityDataPoint) {
    this.historicalData.push(data);
    
    // Keep only recent data (2x window size for rolling calculations)
    if (this.historicalData.length > this.windowSize * 2) {
      this.historicalData = this.historicalData.slice(-this.windowSize * 2);
    }
  }

  // Calculate rolling elasticity model
  calculateElasticityModel(): ElasticityModel | null {
    if (this.historicalData.length < this.minDataPoints) {
      return null;
    }

    // Use most recent window of data
    const windowData = this.historicalData.slice(-this.windowSize);
    
    // Prepare data for regression
    const X = windowData.map(d => [1, d.aiv, d.ati, d.crs]); // Add intercept
    const y = windowData.map(d => d.revenue);

    // Perform linear regression
    const regression = this.performLinearRegression(X, y);
    
    if (!regression) {
      return null;
    }

    // Calculate model metrics
    const r2 = this.calculateR2(X, y, regression.coefficients);
    const mse = this.calculateMSE(X, y, regression.coefficients);
    const confidence = this.calculateConfidence(r2, mse, windowData.length);

    return {
      coefficients: {
        aiv: regression.coefficients[1],
        ati: regression.coefficients[2],
        crs: regression.coefficients[3],
        intercept: regression.coefficients[0]
      },
      r2,
      mse,
      confidence,
      windowSize: this.windowSize,
      lastUpdated: new Date()
    };
  }

  // Predict revenue based on AIV, ATI, CRS values
  predictRevenue(aiv: number, ati: number, crs: number): ElasticityPrediction | null {
    const model = this.calculateElasticityModel();
    
    if (!model) {
      return null;
    }

    const predictedRevenue = 
      model.coefficients.intercept +
      model.coefficients.aiv * aiv +
      model.coefficients.ati * ati +
      model.coefficients.crs * crs;

    const factors = {
      aiv: model.coefficients.aiv * aiv,
      ati: model.coefficients.ati * ati,
      crs: model.coefficients.crs * crs
    };

    const recommendation = this.generateRecommendation(model, factors);

    return {
      predictedRevenue: Math.max(0, predictedRevenue),
      confidence: model.confidence,
      factors,
      recommendation
    };
  }

  // Calculate elasticity per point for each metric
  calculateElasticityPerPoint(): { aiv: number; ati: number; crs: number } | null {
    const model = this.calculateElasticityModel();
    
    if (!model) {
      return null;
    }

    return {
      aiv: model.coefficients.aiv,
      ati: model.coefficients.ati,
      crs: model.coefficients.crs
    };
  }

  // Perform linear regression using normal equations
  private performLinearRegression(X: number[][], y: number[]): { coefficients: number[] } | null {
    const n = X.length;
    const p = X[0].length;

    if (n < p) {
      return null; // Not enough data points
    }

    // Calculate X'X and X'y
    const XtX = Array(p).fill(0).map(() => Array(p).fill(0));
    const Xty = Array(p).fill(0);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < p; k++) {
          XtX[j][k] += X[i][j] * X[i][k];
        }
        Xty[j] += X[i][j] * y[i];
      }
    }

    // Solve normal equations: (X'X)β = X'y
    const coefficients = this.solveLinearSystem(XtX, Xty);
    
    return { coefficients };
  }

  // Solve linear system using Gaussian elimination
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

  // Calculate R-squared
  private calculateR2(X: number[][], y: number[], coefficients: number[]): number {
    const n = y.length;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    // Calculate predicted values
    const yPred = X.map(row => {
      let pred = 0;
      for (let i = 0; i < coefficients.length; i++) {
        pred += coefficients[i] * row[i];
      }
      return pred;
    });

    // Calculate SS_tot and SS_res
    const ssTot = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const ssRes = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);

    return ssTot > 0 ? 1 - (ssRes / ssTot) : 0;
  }

  // Calculate Mean Squared Error
  private calculateMSE(X: number[][], y: number[], coefficients: number[]): number {
    const n = y.length;
    const yPred = X.map(row => {
      let pred = 0;
      for (let i = 0; i < coefficients.length; i++) {
        pred += coefficients[i] * row[i];
      }
      return pred;
    });

    const mse = y.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0) / n;
    return mse;
  }

  // Calculate model confidence
  private calculateConfidence(r2: number, mse: number, dataPoints: number): number {
    // Base confidence on R²
    let confidence = r2;
    
    // Adjust for data points (more data = higher confidence)
    const dataPointFactor = Math.min(1, dataPoints / this.windowSize);
    confidence *= dataPointFactor;
    
    // Adjust for MSE (lower error = higher confidence)
    const mseFactor = Math.max(0.5, 1 - (mse / 10000)); // Assuming max MSE of 10000
    confidence *= mseFactor;
    
    return Math.max(0, Math.min(1, confidence));
  }

  // Generate recommendation based on model
  private generateRecommendation(model: ElasticityModel, factors: any): string {
    const recommendations: string[] = [];
    
    // Find the most impactful factor
    const factorValues = [
      { name: 'AIV', value: factors.aiv, coefficient: model.coefficients.aiv },
      { name: 'ATI', value: factors.ati, coefficient: model.coefficients.ati },
      { name: 'CRS', value: factors.crs, coefficient: model.coefficients.crs }
    ];
    
    factorValues.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    const topFactor = factorValues[0];
    
    if (topFactor.coefficient > 0) {
      recommendations.push(`Focus on improving ${topFactor.name} - it has the highest positive impact on revenue`);
    } else {
      recommendations.push(`Address ${topFactor.name} issues - it's negatively impacting revenue`);
    }
    
    // Add specific recommendations based on model quality
    if (model.r2 < 0.5) {
      recommendations.push("Model confidence is low - consider collecting more data or investigating other factors");
    } else if (model.r2 > 0.8) {
      recommendations.push("Strong model fit - focus on the identified high-impact factors");
    }
    
    return recommendations.join('. ');
  }

  // Get model status
  getModelStatus() {
    const model = this.calculateElasticityModel();
    
    return {
      hasModel: model !== null,
      dataPoints: this.historicalData.length,
      windowSize: this.windowSize,
      model: model,
      lastDataPoint: this.historicalData.length > 0 ? this.historicalData[this.historicalData.length - 1] : null
    };
  }

  // Reset model
  reset() {
    this.historicalData = [];
  }
}

// Export singleton instance
export const elasticityModelEngine = new ElasticityModelEngine();
