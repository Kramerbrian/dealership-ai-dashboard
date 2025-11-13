// Hierarchical Bayesian models with partial pooling by vertical and dealer
export interface BayesianConfig {
  num_samples: number;
  num_warmup: number;
  num_chains: number;
  target_accept: number;
  max_treedepth: number;
}

export interface HierarchicalData {
  dealer_id: string;
  vertical: string;
  region: string;
  metrics: {
    dtri: number;
    revenue: number;
    elasticity: number;
    sample_size: number;
  };
  time_period: string;
}

export interface BayesianResult {
  dealer_id: string;
  vertical: string;
  region: string;
  posterior_mean: number;
  posterior_std: number;
  credible_interval: [number, number];
  shrinkage_factor: number;
  effective_sample_size: number;
}

export class HierarchicalBayesianModel {
  private config: BayesianConfig;
  private dealerPool: Map<string, number[]> = new Map();
  private verticalPool: Map<string, number[]> = new Map();
  private regionPool: Map<string, number[]> = new Map();

  constructor(config: BayesianConfig = {
    num_samples: 2000,
    num_warmup: 1000,
    num_chains: 4,
    target_accept: 0.8,
    max_treedepth: 10
  }) {
    this.config = config;
  }

  public async fitModel(data: HierarchicalData[]): Promise<BayesianResult[]> {
    // Group data by hierarchy levels
    const dealerGroups = this.groupByDealer(data);
    const verticalGroups = this.groupByVertical(data);
    const regionGroups = this.groupByRegion(data);

    // Calculate global parameters
    const globalParams = this.calculateGlobalParameters(data);

    // Fit hierarchical model for each dealer
    const results: BayesianResult[] = [];

    for (const [dealerId, dealerData] of dealerGroups) {
      const result = await this.fitDealerModel(
        dealerId,
        dealerData,
        verticalGroups,
        regionGroups,
        globalParams
      );
      results.push(result);
    }

    return results;
  }

  private groupByDealer(data: HierarchicalData[]): Map<string, HierarchicalData[]> {
    const groups = new Map<string, HierarchicalData[]>();
    data.forEach(item => {
      if (!groups.has(item.dealer_id)) {
        groups.set(item.dealer_id, []);
      }
      groups.get(item.dealer_id)!.push(item);
    });
    return groups;
  }

  private groupByVertical(data: HierarchicalData[]): Map<string, HierarchicalData[]> {
    const groups = new Map<string, HierarchicalData[]>();
    data.forEach(item => {
      if (!groups.has(item.vertical)) {
        groups.set(item.vertical, []);
      }
      groups.get(item.vertical)!.push(item);
    });
    return groups;
  }

  private groupByRegion(data: HierarchicalData[]): Map<string, HierarchicalData[]> {
    const groups = new Map<string, HierarchicalData[]>();
    data.forEach(item => {
      if (!groups.has(item.region)) {
        groups.set(item.region, []);
      }
      groups.get(item.region)!.push(item);
    });
    return groups;
  }

  private calculateGlobalParameters(data: HierarchicalData[]): {
    global_mean: number;
    global_std: number;
    between_dealer_std: number;
    between_vertical_std: number;
    between_region_std: number;
  } {
    const allValues = data.map(d => d.metrics.dtri);
    const global_mean = allValues.reduce((sum, val) => sum + val, 0) / allValues.length;
    const global_variance = allValues.reduce((sum, val) => sum + Math.pow(val - global_mean, 2), 0) / allValues.length;
    const global_std = Math.sqrt(global_variance);

    // Calculate between-group variances
    const dealerMeans = Array.from(this.groupByDealer(data).values()).map(group => 
      group.reduce((sum, item) => sum + item.metrics.dtri, 0) / group.length
    );
    const between_dealer_std = Math.sqrt(
      dealerMeans.reduce((sum, mean) => sum + Math.pow(mean - global_mean, 2), 0) / dealerMeans.length
    );

    const verticalMeans = Array.from(this.groupByVertical(data).values()).map(group => 
      group.reduce((sum, item) => sum + item.metrics.dtri, 0) / group.length
    );
    const between_vertical_std = Math.sqrt(
      verticalMeans.reduce((sum, mean) => sum + Math.pow(mean - global_mean, 2), 0) / verticalMeans.length
    );

    const regionMeans = Array.from(this.groupByRegion(data).values()).map(group => 
      group.reduce((sum, item) => sum + item.metrics.dtri, 0) / group.length
    );
    const between_region_std = Math.sqrt(
      regionMeans.reduce((sum, mean) => sum + Math.pow(mean - global_mean, 2), 0) / regionMeans.length
    );

    return {
      global_mean,
      global_std,
      between_dealer_std,
      between_vertical_std,
      between_region_std
    };
  }

  private async fitDealerModel(
    dealerId: string,
    dealerData: HierarchicalData[],
    verticalGroups: Map<string, HierarchicalData[]>,
    regionGroups: Map<string, HierarchicalData[]>,
    globalParams: any
  ): Promise<BayesianResult> {
    // Get dealer's vertical and region
    const dealer = dealerData[0];
    const vertical = dealer.vertical;
    const region = dealer.region;

    // Calculate sample statistics
    const sampleMean = dealerData.reduce((sum, d) => sum + d.metrics.dtri, 0) / dealerData.length;
    const sampleSize = dealerData.reduce((sum, d) => sum + d.metrics.sample_size, 0);
    const sampleVariance = dealerData.reduce((sum, d) => sum + Math.pow(d.metrics.dtri - sampleMean, 2), 0) / dealerData.length;
    const sampleStd = Math.sqrt(sampleVariance);

    // Get group-level information
    const verticalData = verticalGroups.get(vertical) || [];
    const regionData = regionGroups.get(region) || [];

    const verticalMean = verticalData.reduce((sum, d) => sum + d.metrics.dtri, 0) / verticalData.length;
    const regionMean = regionData.reduce((sum, d) => sum + d.metrics.dtri, 0) / regionData.length;

    // Calculate shrinkage factors
    const dealerShrinkage = this.calculateShrinkage(
      sampleSize,
      sampleVariance,
      globalParams.between_dealer_std
    );

    const verticalShrinkage = this.calculateShrinkage(
      verticalData.length,
      this.calculateGroupVariance(verticalData, verticalMean),
      globalParams.between_vertical_std
    );

    const regionShrinkage = this.calculateShrinkage(
      regionData.length,
      this.calculateGroupVariance(regionData, regionMean),
      globalParams.between_region_std
    );

    // Calculate posterior parameters using partial pooling
    const posteriorMean = this.calculatePosteriorMean(
      sampleMean,
      verticalMean,
      regionMean,
      globalParams.global_mean,
      dealerShrinkage,
      verticalShrinkage,
      regionShrinkage
    );

    const posteriorStd = this.calculatePosteriorStd(
      sampleStd,
      globalParams.global_std,
      dealerShrinkage
    );

    // Calculate credible interval (95%)
    const credibleInterval: [number, number] = [
      posteriorMean - 1.96 * posteriorStd,
      posteriorMean + 1.96 * posteriorStd
    ];

    // Calculate effective sample size
    const effectiveSampleSize = this.calculateEffectiveSampleSize(
      sampleSize,
      dealerShrinkage,
      verticalShrinkage,
      regionShrinkage
    );

    return {
      dealer_id: dealerId,
      vertical,
      region,
      posterior_mean: posteriorMean,
      posterior_std: posteriorStd,
      credible_interval: credibleInterval,
      shrinkage_factor: (dealerShrinkage + verticalShrinkage + regionShrinkage) / 3,
      effective_sample_size: effectiveSampleSize
    };
  }

  private calculateShrinkage(sampleSize: number, sampleVariance: number, betweenGroupStd: number): number {
    const betweenGroupVariance = Math.pow(betweenGroupStd, 2);
    const withinGroupVariance = sampleVariance;
    
    if (betweenGroupVariance === 0) return 0;
    
    const shrinkage = withinGroupVariance / (withinGroupVariance + betweenGroupVariance / sampleSize);
    return Math.max(0, Math.min(1, shrinkage));
  }

  private calculateGroupVariance(groupData: HierarchicalData[], groupMean: number): number {
    if (groupData.length === 0) return 0;
    
    const variance = groupData.reduce((sum, d) => sum + Math.pow(d.metrics.dtri - groupMean, 2), 0) / groupData.length;
    return variance;
  }

  private calculatePosteriorMean(
    sampleMean: number,
    verticalMean: number,
    regionMean: number,
    globalMean: number,
    dealerShrinkage: number,
    verticalShrinkage: number,
    regionShrinkage: number
  ): number {
    // Weighted average with shrinkage
    const weights = [
      { value: sampleMean, weight: 1 - dealerShrinkage },
      { value: verticalMean, weight: verticalShrinkage * 0.3 },
      { value: regionMean, weight: regionShrinkage * 0.2 },
      { value: globalMean, weight: (dealerShrinkage + verticalShrinkage + regionShrinkage) * 0.1 }
    ];

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    const weightedSum = weights.reduce((sum, w) => sum + w.value * w.weight, 0);

    return weightedSum / totalWeight;
  }

  private calculatePosteriorStd(sampleStd: number, globalStd: number, shrinkage: number): number {
    // Posterior standard deviation with shrinkage
    return Math.sqrt(
      Math.pow(sampleStd, 2) * (1 - shrinkage) + 
      Math.pow(globalStd, 2) * shrinkage
    );
  }

  private calculateEffectiveSampleSize(
    sampleSize: number,
    dealerShrinkage: number,
    verticalShrinkage: number,
    regionShrinkage: number
  ): number {
    // Effective sample size accounting for shrinkage
    const averageShrinkage = (dealerShrinkage + verticalShrinkage + regionShrinkage) / 3;
    return sampleSize * (1 - averageShrinkage) + (sampleSize * averageShrinkage * 0.1);
  }

  public async predict(
    dealerId: string,
    vertical: string,
    region: string,
    sampleSize: number,
    historicalData: HierarchicalData[]
  ): Promise<{
    prediction: number;
    uncertainty: number;
    credible_interval: [number, number];
  }> {
    // Fit model with historical data
    const results = await this.fitModel(historicalData);
    
    // Find the result for this dealer
    const dealerResult = results.find(r => r.dealer_id === dealerId);
    
    if (!dealerResult) {
      throw new Error(`No model found for dealer ${dealerId}`);
    }

    // Adjust prediction based on sample size
    const sampleSizeAdjustment = Math.sqrt(sampleSize / 100); // Normalize to sample size of 100
    const adjustedPrediction = dealerResult.posterior_mean * sampleSizeAdjustment;
    const adjustedUncertainty = dealerResult.posterior_std / Math.sqrt(sampleSize / 100);

    return {
      prediction: adjustedPrediction,
      uncertainty: adjustedUncertainty,
      credible_interval: [
        adjustedPrediction - 1.96 * adjustedUncertainty,
        adjustedPrediction + 1.96 * adjustedUncertainty
      ]
    };
  }

  public getModelDiagnostics(results: BayesianResult[]): {
    average_shrinkage: number;
    convergence_issues: number;
    effective_sample_sizes: { min: number; max: number; mean: number };
    credible_interval_coverage: number;
  } {
    const averageShrinkage = results.reduce((sum, r) => sum + r.shrinkage_factor, 0) / results.length;
    
    const effectiveSampleSizes = results.map(r => r.effective_sample_size);
    const minESS = Math.min(...effectiveSampleSizes);
    const maxESS = Math.max(...effectiveSampleSizes);
    const meanESS = effectiveSampleSizes.reduce((sum, ess) => sum + ess, 0) / effectiveSampleSizes.length;
    
    // Check for convergence issues (low effective sample size)
    const convergenceIssues = results.filter(r => r.effective_sample_size < 100).length;
    
    // Estimate credible interval coverage (simplified)
    const credibleIntervalCoverage = 0.95; // Assuming 95% CI

    return {
      average_shrinkage: averageShrinkage,
      convergence_issues: convergenceIssues,
      effective_sample_sizes: {
        min: minESS,
        max: maxESS,
        mean: meanESS
      },
      credible_interval_coverage: credibleIntervalCoverage
    };
  }
}

// Singleton instance
export const hierarchicalBayesian = new HierarchicalBayesianModel();

// API helper function
export async function fitHierarchicalModel(data: HierarchicalData[]): Promise<BayesianResult[]> {
  return await hierarchicalBayesian.fitModel(data);
}
