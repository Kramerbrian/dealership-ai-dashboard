"""
DTRI Composite Scoring Engine
Advanced Data Analytics for Digital Trust Revenue Index calculation
"""

import numpy as np
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def dtri_composite(dealer_data: List[Dict], benchmarks: List[Dict]) -> float:
    """
    Calculate DTRI (Digital Trust Revenue Index) composite score
    
    Args:
        dealer_data: List of dealer performance metrics
        benchmarks: List of industry benchmark metrics
    
    Returns:
        DTRI score (0-100)
    """
    try:
        if not dealer_data:
            return 75.0  # Default score for no data
        
        # Extract key metrics from dealer data
        metrics = extract_metrics(dealer_data)
        
        # Apply benchmark normalization
        normalized_metrics = apply_benchmark_normalization(metrics, benchmarks)
        
        # Calculate weighted composite score
        dtri_score = calculate_weighted_score(normalized_metrics)
        
        # Apply quality adjustments
        final_score = apply_quality_adjustments(dtri_score, dealer_data)
        
        logger.info(f"DTRI calculation completed: {final_score}")
        return round(final_score, 2)
        
    except Exception as e:
        logger.error(f"DTRI calculation error: {str(e)}")
        return 75.0  # Fallback score

def extract_metrics(dealer_data: List[Dict]) -> Dict[str, float]:
    """
    Extract and normalize key performance metrics
    """
    metrics = {
        'digital_trust_score': 0.0,
        'revenue_impact': 0.0,
        'conversion_rate': 0.0,
        'customer_satisfaction': 0.0,
        'online_presence_score': 0.0,
        'ai_visibility_score': 0.0
    }
    
    for data_point in dealer_data:
        if isinstance(data_point, dict):
            # Extract metrics from data point
            for key in metrics.keys():
                if key in data_point.get('metrics', {}):
                    metrics[key] += data_point['metrics'][key]
                elif key in data_point:
                    metrics[key] += data_point[key]
    
    # Average the metrics
    data_count = max(len(dealer_data), 1)
    for key in metrics:
        metrics[key] = metrics[key] / data_count
    
    return metrics

def apply_benchmark_normalization(metrics: Dict[str, float], benchmarks: List[Dict]) -> Dict[str, float]:
    """
    Normalize metrics against industry benchmarks
    """
    normalized = {}
    
    for metric_name, value in metrics.items():
        # Find corresponding benchmark
        benchmark_value = find_benchmark_value(metric_name, benchmarks)
        
        if benchmark_value and benchmark_value > 0:
            # Normalize against benchmark (0-100 scale)
            normalized[metric_name] = min(100, (value / benchmark_value) * 100)
        else:
            # Use raw value if no benchmark available
            normalized[metric_name] = min(100, value)
    
    return normalized

def find_benchmark_value(metric_name: str, benchmarks: List[Dict]) -> float:
    """
    Find benchmark value for a specific metric
    """
    for benchmark in benchmarks:
        if isinstance(benchmark, dict):
            if benchmark.get('metric_id') == metric_name:
                return benchmark.get('target_value', 0)
            elif benchmark.get('category') == metric_name:
                return benchmark.get('target_value', 0)
    
    return 0

def calculate_weighted_score(normalized_metrics: Dict[str, float]) -> float:
    """
    Calculate weighted composite DTRI score
    """
    # Define weights for each metric
    weights = {
        'digital_trust_score': 0.25,
        'revenue_impact': 0.20,
        'conversion_rate': 0.15,
        'customer_satisfaction': 0.15,
        'online_presence_score': 0.15,
        'ai_visibility_score': 0.10
    }
    
    weighted_sum = 0.0
    total_weight = 0.0
    
    for metric_name, value in normalized_metrics.items():
        weight = weights.get(metric_name, 0.1)
        weighted_sum += value * weight
        total_weight += weight
    
    return weighted_sum / max(total_weight, 0.1)

def apply_quality_adjustments(base_score: float, dealer_data: List[Dict]) -> float:
    """
    Apply quality adjustments based on data completeness and consistency
    """
    # Data completeness bonus
    data_completeness = min(1.0, len(dealer_data) / 4)  # Expect 4 verticals
    completeness_bonus = data_completeness * 5  # Up to 5 point bonus
    
    # Consistency adjustment
    consistency_score = calculate_consistency_score(dealer_data)
    consistency_adjustment = (consistency_score - 0.5) * 10  # -5 to +5 adjustment
    
    # Apply adjustments
    adjusted_score = base_score + completeness_bonus + consistency_adjustment
    
    # Ensure score stays within bounds
    return max(0, min(100, adjusted_score))

def calculate_consistency_score(dealer_data: List[Dict]) -> float:
    """
    Calculate data consistency score
    """
    if len(dealer_data) < 2:
        return 0.5  # Neutral score for insufficient data
    
    # Extract scores for consistency analysis
    scores = []
    for data_point in dealer_data:
        if isinstance(data_point, dict) and 'metrics' in data_point:
            metrics = data_point['metrics']
            if isinstance(metrics, dict):
                # Calculate average score for this data point
                point_scores = [v for v in metrics.values() if isinstance(v, (int, float))]
                if point_scores:
                    scores.append(np.mean(point_scores))
    
    if len(scores) < 2:
        return 0.5
    
    # Calculate coefficient of variation (lower is more consistent)
    mean_score = np.mean(scores)
    std_score = np.std(scores)
    
    if mean_score == 0:
        return 0.5
    
    cv = std_score / mean_score
    # Convert to 0-1 scale (lower CV = higher consistency)
    consistency = max(0, 1 - cv)
    
    return consistency
