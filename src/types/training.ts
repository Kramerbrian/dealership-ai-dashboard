// AIV Model Training and Optimization Types

export interface AIVTrainingData {
  id?: string;
  dealer_id: string;
  date: string;
  seo?: number;
  aeo?: number;
  geo?: number;
  ugc?: number;
  geolocal?: number;
  observed_aiv?: number;
  observed_rar?: number; // Revenue Attribution Rate
  created_at?: string;
}

export interface ModelWeights {
  id: string;
  asof_date: string;
  model_version: string;
  seo_w: number;
  aeo_w: number;
  geo_w: number;
  ugc_w: number;
  geolocal_w: number;
  intercept: number;
  r2: number;
  rmse: number;
  mape: number;
  training_samples: number;
  updated_at: string;
}

export interface ModelAudit {
  run_id: string;
  run_date: string;
  model_version: string;
  rmse: number;
  mape: number;
  r2: number;
  delta_accuracy: number;
  delta_roi: number;
  training_time_seconds: number;
  validation_samples: number;
  notes?: string;
}

export interface PromptRun {
  id: string;
  prompt_id: string;
  run_date: string;
  variant?: string;
  model_used: string;
  hallucination_rate: number;
  factual_precision: number;
  response_variance: number;
  tokens_used: number;
  cost_usd: number;
  response_time_ms: number;
}

export interface ModelPrediction {
  id: string;
  dealer_id: string;
  prediction_date: string;
  model_version: string;
  predicted_aiv: number;
  predicted_rar: number;
  confidence_interval_lower: number;
  confidence_interval_upper: number;
  actual_aiv?: number;
  actual_rar?: number;
  prediction_error?: number;
  created_at: string;
}

export interface FeatureImportance {
  id: string;
  model_version: string;
  feature_name: string;
  importance_score: number;
  shap_value: number;
  permutation_importance: number;
  calculated_at: string;
}

// View types for analytics
export interface ModelPerformanceSummary {
  month: string;
  model_version: string;
  mean_r2: number;
  mean_rmse: number;
  mean_mape: number;
  mean_accuracy_gain: number;
  mean_roi_gain: number;
  audit_runs: number;
}

export interface TrainingDataQuality {
  week: string;
  signal_count: number;
  unique_dealers: number;
  mean_aiv: number;
  aiv_stddev: number;
  mean_rar: number;
  missing_aiv: number;
  missing_rar: number;
}

export interface FeatureImportanceTrends {
  feature_name: string;
  model_version: string;
  importance_score: number;
  shap_value: number;
  calculated_at: string;
  prev_importance?: number;
  importance_delta?: number;
}

export interface PromptPerformanceAnalysis {
  prompt_id: string;
  variant?: string;
  model_used: string;
  day: string;
  avg_hallucination_rate: number;
  avg_factual_precision: number;
  avg_response_variance: number;
  avg_cost: number;
  avg_response_time: number;
  run_count: number;
}

export interface ModelValidationAccuracy {
  model_version: string;
  mean_absolute_error: number;
  error_stddev: number;
  validation_samples: number;
  accuracy_within_5_points: number;
  accuracy_within_10_points: number;
}

// Training configuration
export interface TrainingConfig {
  learning_rate: number;
  max_iterations: number;
  validation_split: number;
  early_stopping_patience: number;
  min_improvement: number;
}

// Training results
export interface TrainingResults {
  model_weights: ModelWeights;
  feature_importance: FeatureImportance[];
  validation_metrics: ModelAudit;
  training_time_seconds: number;
  convergence_achieved: boolean;
}

// Model comparison
export interface ModelComparison {
  model_version: string;
  r2: number;
  rmse: number;
  mape: number;
  training_samples: number;
  validation_samples: number;
  feature_importance: Record<string, number>;
  created_at: string;
}

// Hyperparameter optimization
export interface HyperparameterTrial {
  id: string;
  trial_number: number;
  learning_rate: number;
  max_iterations: number;
  validation_split: number;
  final_r2: number;
  final_rmse: number;
  training_time_seconds: number;
  status: 'completed' | 'failed' | 'running';
  created_at: string;
}

// Model deployment
export interface ModelDeployment {
  id: string;
  model_version: string;
  deployment_date: string;
  status: 'active' | 'inactive' | 'rollback';
  performance_monitoring: boolean;
  auto_rollback_threshold: number;
  notes?: string;
}
