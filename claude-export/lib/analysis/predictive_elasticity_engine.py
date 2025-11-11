#!/usr/bin/env python3
"""
Predictive Elasticity Engine (PEE) - Self-healing feedback system
Analyzes DTRI data and persists forecasts, elasticity coefficients, and feature importance
"""

import pandas as pd
import numpy as np
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import json
import os
from pathlib import Path

# ML Libraries
try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logging.warning("XGBoost not available, using fallback models")

try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    logging.warning("Prophet not available, using fallback forecasting")

# Supabase
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logging.warning("Supabase not available, using local storage")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Supabase client
def supabase_client() -> Optional[Client]:
    """Initialize Supabase client with service role key"""
    if not SUPABASE_AVAILABLE:
        return None
    
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        logger.warning("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return None
    
    try:
        return create_client(url, key)
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None

# ---------------- Data Loading ----------------
def load_dtri_history(events: List[Dict[str, Any]]) -> pd.DataFrame:
    """Load and prepare DTRI historical data"""
    if not events:
        logger.warning("No events provided")
        return pd.DataFrame()
    
    df = pd.DataFrame(events)
    
    # Ensure required columns exist
    required_cols = ['timestamp', 'metric', 'score']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        logger.error(f"Missing required columns: {missing_cols}")
        return pd.DataFrame()
    
    # Convert timestamp and sort
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df.sort_values('timestamp', inplace=True)
    
    # Add vertical if not present
    if 'vertical' not in df.columns:
        df['vertical'] = 'global'
    
    logger.info(f"Loaded {len(df)} events for analysis")
    return df

# ---------------- Elasticity Calculation ----------------
def calc_elasticity(df: pd.DataFrame, vertical: str) -> float:
    """Calculate elasticity between DTRI and Revenue for a vertical"""
    try:
        # Filter for the specific vertical
        df_vertical = df[df['vertical'] == vertical] if vertical != 'global' else df
        
        # Get DTRI and Revenue data
        dtri_data = df_vertical[df_vertical['metric'] == 'DTRI'].copy()
        revenue_data = df_vertical[df_vertical['metric'] == 'Revenue'].copy()
        
        if len(dtri_data) < 2 or len(revenue_data) < 2:
            logger.warning(f"Insufficient data for elasticity calculation: {vertical}")
            return 0.0
        
        # Merge data by timestamp
        merged = pd.merge_asof(
            dtri_data.sort_values('timestamp'),
            revenue_data.sort_values('timestamp'),
            on='timestamp',
            suffixes=('_dtri', '_rev')
        )
        
        merged.dropna(inplace=True)
        if len(merged) < 2:
            logger.warning(f"No overlapping DTRI/Revenue data for {vertical}")
            return 0.0
        
        # Calculate percentage changes
        dtri_pct_change = merged['score_dtri'].pct_change().dropna()
        revenue_pct_change = merged['score_rev'].pct_change().dropna()
        
        # Calculate elasticity (avoid division by zero)
        valid_mask = (dtri_pct_change != 0) & np.isfinite(dtri_pct_change) & np.isfinite(revenue_pct_change)
        if not valid_mask.any():
            logger.warning(f"No valid elasticity data for {vertical}")
            return 0.0
        
        elasticity = (revenue_pct_change[valid_mask] / dtri_pct_change[valid_mask]).mean()
        
        # Handle infinite values
        if np.isinf(elasticity) or np.isnan(elasticity):
            elasticity = 0.0
        
        logger.info(f"Calculated elasticity for {vertical}: {elasticity:.3f}")
        return round(float(elasticity), 3)
        
    except Exception as e:
        logger.error(f"Error calculating elasticity for {vertical}: {e}")
        return 0.0

# ---------------- Prophet Forecast ----------------
def prophet_forecast(df: pd.DataFrame, metric: str = 'DTRI', horizon_days: int = 90) -> pd.DataFrame:
    """Generate Prophet forecast for specified metric"""
    if not PROPHET_AVAILABLE:
        logger.warning("Prophet not available, using linear trend forecast")
        return linear_trend_forecast(df, metric, horizon_days)
    
    try:
        # Prepare data for Prophet
        df_metric = df[df['metric'] == metric].copy()
        if len(df_metric) < 5:
            logger.warning(f"Insufficient data for Prophet forecast: {len(df_metric)} points")
            return pd.DataFrame()
        
        # Prepare Prophet format
        dfp = df_metric[['timestamp', 'score']].rename(columns={'timestamp': 'ds', 'score': 'y'})
        dfp = dfp.dropna()
        
        if len(dfp) < 5:
            logger.warning("Insufficient clean data for Prophet forecast")
            return pd.DataFrame()
        
        # Initialize and fit Prophet model
        model = Prophet(
            growth='linear',
            changepoint_prior_scale=0.15,
            seasonality_mode='multiplicative',
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=False
        )
        
        model.fit(dfp)
        
        # Generate forecast
        future = model.make_future_dataframe(periods=horizon_days)
        forecast = model.predict(future)
        
        # Extract forecast data
        forecast_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(horizon_days)
        forecast_data['vertical'] = df['vertical'].iloc[0] if 'vertical' in df.columns else 'global'
        
        logger.info(f"Generated Prophet forecast for {metric}: {len(forecast_data)} points")
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error in Prophet forecast: {e}")
        return linear_trend_forecast(df, metric, horizon_days)

def linear_trend_forecast(df: pd.DataFrame, metric: str = 'DTRI', horizon_days: int = 90) -> pd.DataFrame:
    """Fallback linear trend forecast when Prophet is not available"""
    try:
        df_metric = df[df['metric'] == metric].copy()
        if len(df_metric) < 2:
            return pd.DataFrame()
        
        # Simple linear regression
        df_metric['days'] = (df_metric['timestamp'] - df_metric['timestamp'].min()).dt.days
        x = df_metric['days'].values.reshape(-1, 1)
        y = df_metric['score'].values
        
        # Calculate trend
        slope = np.polyfit(x.flatten(), y, 1)[0]
        intercept = np.polyfit(x.flatten(), y, 1)[1]
        
        # Generate forecast
        last_day = df_metric['days'].max()
        forecast_days = np.arange(last_day + 1, last_day + horizon_days + 1)
        forecast_values = slope * forecast_days + intercept
        
        # Create forecast DataFrame
        forecast_dates = [df_metric['timestamp'].max() + timedelta(days=int(d - last_day)) for d in forecast_days]
        
        forecast_data = pd.DataFrame({
            'ds': forecast_dates,
            'yhat': forecast_values,
            'yhat_lower': forecast_values * 0.95,  # Simple confidence bounds
            'yhat_upper': forecast_values * 1.05,
            'vertical': df['vertical'].iloc[0] if 'vertical' in df.columns else 'global'
        })
        
        logger.info(f"Generated linear trend forecast for {metric}: {len(forecast_data)} points")
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error in linear trend forecast: {e}")
        return pd.DataFrame()

# ---------------- XGBoost Model ----------------
def xgboost_predict(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """Train XGBoost model and predict revenue"""
    if not XGBOOST_AVAILABLE:
        logger.warning("XGBoost not available, using simple regression")
        return simple_revenue_prediction(df)
    
    try:
        # Pivot data to wide format
        pivot = df.pivot_table(
            index='timestamp',
            columns='metric',
            values='score',
            aggfunc='mean'
        ).fillna(method='ffill')
        
        # Define features and target
        features = ['DTRI', 'QAI', 'EEAT', 'PIQR']
        target = 'Revenue'
        
        # Check if required columns exist
        missing_features = [f for f in features if f not in pivot.columns]
        if missing_features:
            logger.warning(f"Missing features for XGBoost: {missing_features}")
            return simple_revenue_prediction(df)
        
        if target not in pivot.columns:
            logger.warning(f"Target variable '{target}' not found")
            return None
        
        if len(pivot) < 10:
            logger.warning(f"Insufficient data for XGBoost: {len(pivot)} rows")
            return simple_revenue_prediction(df)
        
        # Prepare data
        X = pivot[features].fillna(pivot[features].mean())
        y = pivot[target].fillna(pivot[target].mean())
        
        # Train model
        model = XGBRegressor(
            n_estimators=300,
            learning_rate=0.08,
            max_depth=4,
            random_state=42
        )
        
        model.fit(X, y)
        
        # Get predictions and feature importance
        predicted_revenue = float(model.predict(X.tail(1))[0])
        importance = dict(zip(features, model.feature_importances_))
        
        logger.info(f"XGBoost prediction complete. Revenue: {predicted_revenue:.2f}")
        return {
            "importance": importance,
            "predicted_revenue": predicted_revenue,
            "model_score": float(model.score(X, y))
        }
        
    except Exception as e:
        logger.error(f"Error in XGBoost prediction: {e}")
        return simple_revenue_prediction(df)

def simple_revenue_prediction(df: pd.DataFrame) -> Optional[Dict[str, Any]]:
    """Simple revenue prediction fallback"""
    try:
        revenue_data = df[df['metric'] == 'Revenue']['score']
        if len(revenue_data) < 2:
            return None
        
        # Simple trend-based prediction
        recent_avg = revenue_data.tail(5).mean()
        trend = revenue_data.tail(3).mean() - revenue_data.head(3).mean()
        predicted_revenue = recent_avg + (trend * 0.1)  # Conservative trend projection
        
        return {
            "importance": {"DTRI": 0.4, "QAI": 0.3, "EEAT": 0.2, "PIQR": 0.1},
            "predicted_revenue": float(predicted_revenue),
            "model_score": 0.5  # Placeholder score
        }
        
    except Exception as e:
        logger.error(f"Error in simple revenue prediction: {e}")
        return None

# ---------------- Persistence ----------------
def persist_results(vertical: str, elasticity: float, forecast_df: pd.DataFrame, xgboost_out: Optional[Dict[str, Any]]):
    """Persist results to Supabase"""
    sb = supabase_client()
    if not sb:
        logger.warning("Supabase not available, saving to local file")
        save_results_locally(vertical, elasticity, forecast_df, xgboost_out)
        return
    
    try:
        now = datetime.utcnow().isoformat()
        
        # 1. Save elasticity coefficient
        elasticity_result = sb.table("elasticity_coefficients").insert({
            "vertical": vertical,
            "elasticity": elasticity,
            "timestamp": now
        }).execute()
        
        logger.info(f"Saved elasticity coefficient for {vertical}: {elasticity}")
        
        # 2. Save forecast (batch insert)
        if not forecast_df.empty:
            forecast_records = [
                {
                    "vertical": row.vertical,
                    "forecast_date": row.ds.isoformat(),
                    "yhat": float(row.yhat),
                    "yhat_lower": float(row.yhat_lower),
                    "yhat_upper": float(row.yhat_upper),
                    "created_at": now
                }
                for row in forecast_df.itertuples()
            ]
            
            forecast_result = sb.table("dtri_forecast").insert(forecast_records).execute()
            logger.info(f"Saved {len(forecast_records)} forecast points for {vertical}")
        
        # 3. Save revenue prediction
        if xgboost_out:
            revenue_result = sb.table("revenue_predictions").insert({
                "vertical": vertical,
                "predicted_revenue": xgboost_out["predicted_revenue"],
                "feature_weights": json.dumps(xgboost_out["importance"]),
                "model_score": xgboost_out.get("model_score", 0.0),
                "timestamp": now
            }).execute()
            
            logger.info(f"Saved revenue prediction for {vertical}: {xgboost_out['predicted_revenue']:.2f}")
        
    except Exception as e:
        logger.error(f"Error persisting results to Supabase: {e}")
        save_results_locally(vertical, elasticity, forecast_df, xgboost_out)

def save_results_locally(vertical: str, elasticity: float, forecast_df: pd.DataFrame, xgboost_out: Optional[Dict[str, Any]]):
    """Save results to local JSON file as fallback"""
    try:
        results = {
            "vertical": vertical,
            "elasticity": elasticity,
            "timestamp": datetime.utcnow().isoformat(),
            "forecast": forecast_df.to_dict('records') if not forecast_df.empty else [],
            "revenue_prediction": xgboost_out
        }
        
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        output_file = output_dir / f"pee_results_{vertical}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"Saved results locally to {output_file}")
        
    except Exception as e:
        logger.error(f"Error saving results locally: {e}")

# ---------------- Main Orchestrator ----------------
def run_predictive_elasticity(events: List[Dict[str, Any]], vertical: str = "sales") -> Dict[str, Any]:
    """Main orchestrator function"""
    logger.info(f"Starting Predictive Elasticity Engine for vertical: {vertical}")
    
    try:
        # Load and prepare data
        df = load_dtri_history(events)
        if df.empty:
            logger.warning("No data available for analysis")
            return {
                "vertical": vertical,
                "error": "No data available",
                "elasticity": 0.0,
                "forecast_points": 0,
                "predicted_revenue": None
            }
        
        # Calculate elasticity
        elasticity = calc_elasticity(df, vertical)
        
        # Generate forecast
        forecast_df = prophet_forecast(df, metric='DTRI', horizon_days=90)
        
        # Train XGBoost model
        xgboost_out = xgboost_predict(df)
        
        # Persist results
        persist_results(vertical, elasticity, forecast_df, xgboost_out)
        
        # Prepare return data
        result = {
            "vertical": vertical,
            "elasticity": elasticity,
            "forecast_points": len(forecast_df),
            "predicted_revenue": xgboost_out["predicted_revenue"] if xgboost_out else None,
            "importance": xgboost_out["importance"] if xgboost_out else None,
            "model_score": xgboost_out.get("model_score", 0.0) if xgboost_out else 0.0,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.info(f"Predictive Elasticity Engine completed for {vertical}")
        return result
        
    except Exception as e:
        logger.error(f"Error in Predictive Elasticity Engine: {e}")
        return {
            "vertical": vertical,
            "error": str(e),
            "elasticity": 0.0,
            "forecast_points": 0,
            "predicted_revenue": None
        }

# ---------------- CLI Interface ----------------
if __name__ == "__main__":
    import sys
    
    try:
        # Read input from stdin
        payload = json.loads(sys.stdin.read())
        events = payload.get("events", [])
        vertical = payload.get("vertical", "sales")
        
        # Run analysis
        result = run_predictive_elasticity(events, vertical)
        
        # Output result
        print(json.dumps(result, indent=2))
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON input: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)