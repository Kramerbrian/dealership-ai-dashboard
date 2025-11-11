import pandas as pd
import numpy as np
from typing import Dict, List, Any

def elasticity_trend(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Input: DataFrame with columns ['date','dtri','revenue']
    Output: JSON-ready dict with trend, slope, correlation
    """
    df = df.sort_values("date")
    
    # Calculate correlation
    corr = df["dtri"].corr(df["revenue"])
    
    # Calculate elasticity (percentage change in revenue / percentage change in DTRI)
    df["dtri_pct_change"] = df["dtri"].pct_change()
    df["revenue_pct_change"] = df["revenue"].pct_change()
    
    # Avoid division by zero
    df["elasticity"] = np.where(
        df["dtri_pct_change"] != 0,
        df["revenue_pct_change"] / df["dtri_pct_change"],
        np.nan
    )
    
    avg_elasticity = df["elasticity"].dropna().mean()
    
    # Calculate trend slope using linear regression
    if len(df) > 1:
        x = np.arange(len(df))
        dtri_slope = np.polyfit(x, df["dtri"], 1)[0]
        revenue_slope = np.polyfit(x, df["revenue"], 1)[0]
    else:
        dtri_slope = 0
        revenue_slope = 0
    
    return {
        "correlation": round(corr, 3) if not pd.isna(corr) else 0,
        "avg_elasticity": round(avg_elasticity, 3) if not pd.isna(avg_elasticity) else 0,
        "dtri_slope": round(dtri_slope, 3),
        "revenue_slope": round(revenue_slope, 3),
        "trend": df[["date", "dtri", "revenue", "elasticity"]].to_dict(orient="records")
    }

def calculate_elasticity_confidence(df: pd.DataFrame) -> Dict[str, float]:
    """
    Calculate confidence intervals for elasticity metrics
    """
    if len(df) < 3:
        return {"confidence": 0.0, "volatility": 0.0}
    
    # Calculate rolling elasticity
    df["dtri_pct_change"] = df["dtri"].pct_change()
    df["revenue_pct_change"] = df["revenue"].pct_change()
    df["elasticity"] = np.where(
        df["dtri_pct_change"] != 0,
        df["revenue_pct_change"] / df["dtri_pct_change"],
        np.nan
    )
    
    elasticity_values = df["elasticity"].dropna()
    
    if len(elasticity_values) < 2:
        return {"confidence": 0.0, "volatility": 0.0}
    
    # Calculate volatility (coefficient of variation)
    volatility = elasticity_values.std() / abs(elasticity_values.mean()) if elasticity_values.mean() != 0 else 0
    
    # Confidence based on sample size and volatility
    confidence = max(0, min(1, 1 - volatility))
    
    return {
        "confidence": round(confidence, 3),
        "volatility": round(volatility, 3)
    }
