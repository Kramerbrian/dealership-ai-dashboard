# QAI* Master Algorithmic Formulas Reference

This document contains all the key algorithmic formulas from the QAI* (Quantum Authority Index) ecosystem, presented in a text-friendly format for AI prompt integration.

## 1. Top-Level Index (The QAI Score)

The final score is a dynamically weighted average of penalized, segment-specific performance scores.

```
QAI_Final = (∑(QAI_i * ω_DS_i * (1 + ω_Def_i))) / (∑(ω_DS_i))

Where:
- QAI_i: Segment-specific core score
- ω_DS_i: Dynamic Segment Weight (High Inventory Risk/High Demand = High Priority)
- ω_Def_i: Defensive Weight (Multiplier based on competitive prediction/game theory)
```

## 2. Core Segment Score (QAI Composition)

The core score is the risk-adjusted sum of SEO and AI visibility, multiplied by E-E-A-T momentum, and penalized by Brand Risk.

```
QAI_i = [(SEO_Score * 0.30) + (V_AI_Penalized * 0.70)] * (1 + λ_A_dot) - (HRP * W_HRP)

Where:
- V_AI_Penalized: Unified AI Visibility Score
- λ_A_dot: Authority Velocity Multiplier (Measures momentum of trust/citation growth)
- HRP: Hallucination Risk Penalty
- W_HRP: Hallucination Penalty Weight (e.g., 0.20)
```

## 3. Core Scoring Algorithms

### A. Unified AI Visibility Score (V_AI_Penalized) - AEO/GEO

Measures total AI presence, penalized by VDP quality issues (PIQR).

```
V_AI_Penalized = (∑(Visibility_Platform_j * W_j)) / PIQR

Where:
- W_j: Platform Reach Weight (e.g., W_Google = 0.50, W_ChatGPT = 0.30)
- PIQR: Proactive Inventory Quality Radar
```

### B. Answer Engine Market Dominance (AEMD)

A focused metric quantifying ownership of high-impact AEO SERP features.

```
AEMD_Final = (∑(AEO_Metric_i * Ω_Fin_i)) / ω_Def

Where:
- AEO_Metric_i: (FS Capture Share, AIO Citation Share, PAA Box Ownership)
- Ω_Fin_i: Dynamic Financial Weight (Weight based on estimated revenue-per-action/CTR lift)
- ω_Def: Defensive Weight
```

### C. Hallucination and Brand Risk Penalty (HRP)

Measures the probability of AI providing false, high-severity information about the dealer.

```
HRP = ((Total_Mentions - Verifiable_Mentions) / Total_Mentions) * (1 + Severity_Multiplier)

Where:
- Verifiable Mentions: AI output that matches VIN, Price, and Offer (from VDP-TOP protocol)
- Severity Multiplier: 2.0 for High Risk (e.g., False APR/Warranty claims)
```

### D. Proactive Inventory Quality Radar (PIQR)

The multiplier that punishes VDP merchandising non-compliance and poor experience. PIQR=1.0 is the target.

```
PIQR = (1 + ∑(Compliance_Fails * W_C)) * ∏(M_Warning)

Where:
- Compliance Fails: Missing VIN, Price mismatch (W_C = 0.25 per fail)
- Warning Multipliers (M_Warning): Deceptive Pricing (×1.5 to 2.0), Inventory Dilution, Schema Latency Score
```

## 4. AIV/ATI/CRS Scoring Formulas

### AIV (AI Visibility Index)

```
AIV_sel = (0.35 * SCS + 0.35 * SIS + 0.30 * SCR)
AIV_final = (AIV_core * AIV_mods) * (1 + 0.25 * AIV_sel)
```

### ATI (AI Trust Index)

```
ATI_sel = 0.5 * ADI + 0.5 * SCR
ATI_final = (ATI_core * ATI_mods) * (1 + 0.20 * ATI_sel)
```

### CRS (Conversion Rate Score)

```
CRS = (w1 * AIV_final + w2 * ATI_final) / (w1 + w2)

Where:
- w1 = 0.6 (AIV weight)
- w2 = 0.4 (ATI weight)
```

## 5. Prescriptive & Learning Algorithms

### A. VDP Conversion Oracle (VCO) Output

The XGBoost/SHAP model's primary output and the logic for the Autonomous Strategy Recommendation (ASR).

```
Predicted Probability: P_VDP = XGBoost(X_VDP_Features)

ASR Logic (Estimated Net Profit Gain):
ASR_Action = argmax_Action_k (VCO_Predicted_Lift_k * VDP_Gross_Profit - Cost_Action_k)

Where:
- VCO_Predicted_Lift: Calculated using the SHAP Value Gain (φ_j_optimal - φ_j_current)
```

### B. Opportunity Cost of Inaction (OCI)

The executive-level dollar value that drives priority.

```
OCI = Δ_Conversion * Gross_Profit_Avg * (CSGV_Competitor_Leader / Gap_in_CSGV)

Result: A dollar amount representing lost revenue due to underperforming AI visibility
```

## 6. E-E-A-T Impact Algorithm

The core authority multiplier that feeds directly into the QAI* system.

```
λ_E-E-A-T = Normalized(Exp * α_E + Exp² * α_Ex + Auth * α_A + Trust * α_T)

Where:
- α Factors: Dynamically calculated based on correlation between signal and observed Zero-Click Conversion Rate (ZCCR)
- UGC Driver Example: α_T (Trustworthiness) is heavily weighted by UGC Recency Index and GBP Star Rating & Velocity
```

## 7. Dynamic Financial Weighting (Ω_Fin)

Real-time financial weighting based on actual performance data.

```
FS Weight: Ω_Fin_FS = (CTR_P3 / CTR_FS) * 0.30
AIO Weight: Ω_Fin_AIO = (Total_VDP_Views / AIO_VDP_Views) * 0.50
PAA Weight: Ω_Fin_PAA = (Total_Conversions / PAA_Conversions) * 0.20
```

## 8. Revenue-Per-Actionable-Signal (RPAS)

Attaches a dollar value to a successful optimization.

```
RPAS = (VDP_Gross_Profit * VCO_Predicted_Lift * Success_Rate) - Cost_Action

Where:
- Success_Rate: Historical success rate of similar actions (default: 0.7)
- Cost_Action: From cost catalog
```

## 9. Schema Performance Decay (SPD)

Continuously checks the health of structured data.

```
Schema_Latency_Score = Time_Schema_Update / Time_DMS_Update

Impact: High latency (SPD > 1.0) applies severe PIQR penalty
```

## 10. AIO Output-as-Input (OAI)

When AIO citation detected, runs NLP analysis on generated snippet.

```
OSS = |Sentiment_VDP_Target - Sentiment_AIO_Snippet|

Impact: If OSS > threshold, triggers PIQR penalty and VDP-TOP template adjustment
```

## Implementation Notes

- All formulas use normalized scores (0-100 scale) unless otherwise specified
- Financial calculations use USD currency
- Time-based calculations use days unless specified
- Confidence scores range from 0.0 to 1.0
- Risk scores are multiplicative (1.0 = no penalty, >1.0 = penalty)
- All AI platform weights must sum to 1.0
- E-E-A-T factors are dynamically calculated based on historical performance correlation
