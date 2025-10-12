# QAI* (Quantum Authority Index) Engine

A comprehensive AI visibility analytics system for automotive dealerships, implementing advanced scoring algorithms, machine learning models, and prescriptive recommendations.

## 🚀 Quick Start

```python
from src.qai import QAIEngine, AEMDCalculator, QAIDashboardComponents

# Initialize the QAI Engine
qai_engine = QAIEngine()

# Run complete analysis
dealer_data = generate_mock_dealer_data("dealer_456")
analysis = qai_engine.generate_complete_analysis(dealer_data)

# Calculate AEMD Score
aemd_calculator = AEMDCalculator()
aemd_result = aemd_calculator.calculate_aemd_score(
    dealer_data['aeo_metrics'],
    dealer_data['competitive_data'],
    dealer_data['performance_data']
)

# Generate dashboard data
dashboard = QAIDashboardComponents()
dashboard_data = dashboard.generate_complete_dashboard_data(
    analysis, segment_data, asr_data, risk_data, historical_data
)
```

## 📊 Core Components

### 1. Risk & Visibility Scoring (`metrics_calculations.py`)
- **PIQR (Proactive Inventory Quality Radar)**: Multiplicative risk penalty
- **HRP (High-Risk Penalty)**: Hallucination risk assessment
- **VAI (Visibility Authority Index)**: AI platform visibility scoring

### 2. VDP Conversion Oracle (`vco_model.py`)
- **XGBoost Classifier**: ML model for conversion prediction
- **SHAP Integration**: Feature importance and prescriptive analysis
- **Continuous Learning**: Automated retraining based on performance decay

### 3. Autonomous Strategy Recommendations (`asr_engine.py`)
- **ROI Calculation**: Revenue-per-actionable-signal (RPAS)
- **Cost-Benefit Analysis**: Dynamic cost catalog integration
- **VDP-TOP Protocol**: Structured content recommendations

### 4. Answer Engine Market Dominance (`aemd_calculator.py`)
- **Featured Snippets**: FS capture share optimization
- **AI Overviews**: AIO citation share tracking
- **People Also Ask**: PAA box ownership metrics
- **Dynamic Financial Weighting**: Real-time performance-based weights

### 5. Dashboard Components (`dashboard_components.py`)
- **Executive Scoreboard**: High-level KPI visualization
- **Segment Heatmap**: Performance matrix by vehicle category
- **Prescriptive Action Queue**: Prioritized recommendations
- **Critical Warning System**: Real-time risk alerts

## 🎯 Key Metrics

### QAI* Score (0-100)
The ultimate performance metric combining:
- SEO Visibility (30%)
- AI Visibility (70%)
- E-E-A-T Authority Multiplier
- Risk Penalties (PIQR, HRP)

### AEMD Score (0-100)
Answer Engine Market Dominance:
- Featured Snippet Capture (40%)
- AI Overview Citation Share (40%)
- PAA Box Ownership (20%)
- Dynamic Financial Weighting

### AIV/ATI/CRS Scoring
- **AIV**: `(0.35*SCS + 0.35*SIS + 0.30*SCR)`
- **ATI**: `0.5*ADI + 0.5*SCR`
- **CRS**: `(w1*AIV_final + w2*ATI_final)/(w1+w2)`

## 🔧 Installation

```bash
# Install Python dependencies
pip install pandas numpy scikit-learn xgboost shap

# Install Node.js dependencies
npm install @radix-ui/react-progress @radix-ui/react-alert
```

## 📈 Usage Examples

### Basic QAI Analysis
```python
# Generate mock data
dealer_data = generate_mock_dealer_data("dealer_123")

# Run complete analysis
qai_engine = QAIEngine()
results = qai_engine.generate_complete_analysis(dealer_data)

print(f"QAI Score: {results['qai_analysis']['qai_score']}")
print(f"Risk Level: {results['risk_metrics']['piqr']}")
```

### AEMD Optimization
```python
# Calculate AEMD with financial weighting
aemd_calculator = AEMDCalculator()
aemd_result = aemd_calculator.calculate_aemd_score(
    aeo_metrics={
        'fs_capture_share': 0.35,
        'aio_citation_share': 0.45,
        'paa_box_ownership': 1.8
    },
    competitive_data={
        'defensive_weight': 1.25,
        'competitor_aemd_avg': 65.0
    }
)

print(f"AEMD Score: {aemd_result['aemd_score']:.1f}")
print(f"Action: {aemd_result['prescriptive_action']['action']}")
```

### Dashboard Integration
```python
# Generate dashboard data
dashboard = QAIDashboardComponents()
dashboard_data = dashboard.generate_complete_dashboard_data(
    qai_analysis, segment_data, asr_data, risk_data, historical_data
)

# Export for Next.js frontend
import json
with open('dashboard_data.json', 'w') as f:
    json.dump(dashboard_data, f, indent=2)
```

## 🎨 Dashboard Features

### Executive Scoreboard
- QAI* Score with color-coded status
- Authority Velocity trend indicator
- Opportunity Cost of Inaction (OCI)
- Top 3 Risk Factors

### Segment Heatmap
- Color-coded performance matrix
- Competitive threat indicators
- Dynamic weight visualization
- AEMD score breakdown

### Prescriptive Action Queue
- Ranked by estimated net profit gain
- ROI multiple calculations
- Priority-based execution timeline
- Cost-benefit analysis

### Critical Warning System
- HRP breach alerts (HRP > 0.50)
- PIQR risk warnings (PIQR > 1.5)
- Schema latency detection
- Real-time threat monitoring

## 🔄 Continuous Learning

### Model Retraining
- **Frequency**: Weekly
- **Trigger**: 10,000+ new labeled VDPs OR 3%+ AUC drop
- **Data Source**: CRM conversion labels

### Feature Transparency
- Global SHAP feature importance
- Model versioning and timestamps
- Performance decay monitoring

### Competitive Intelligence
- Defensive weight calculation (ω_Def)
- Competitor inventory risk prediction
- Market share analysis

## 📊 API Endpoints

### QAI Dashboard
```
GET /api/qai/dashboard?dealerId=dealer_123
```

### AEMD Calculator
```
POST /api/qai/aemd
{
  "aeo_metrics": {...},
  "competitive_data": {...},
  "performance_data": {...}
}
```

### VCO Predictions
```
POST /api/qai/vco/predict
{
  "vdp_data": {...},
  "features": [...]
}
```

## 🚨 Critical Alerts

### HRP Breach Alert
- **Condition**: HRP > 0.50
- **Action**: Immediate pause on VDP text generation
- **Resolution**: Manual fact-checking required

### PIQR Risk Warning
- **Condition**: PIQR > 1.5
- **Action**: Review VDP quality and compliance
- **Resolution**: Address content duplication, missing specs

### Schema Latency
- **Condition**: Update delay > 1.0x normal
- **Action**: Fix data feed pipeline
- **Resolution**: Ensure real-time DMS integration

## 📈 Performance Targets

- **QAI* Score**: 80+ (Excellent), 60-79 (Good), <60 (Needs Improvement)
- **AEMD Score**: 70+ (High), 50-69 (Medium), <50 (Low)
- **PIQR**: 1.0 (Target), 1.2+ (Warning), 1.5+ (Critical)
- **HRP**: <0.2 (Low), 0.2-0.4 (Medium), >0.5 (Critical)

## 🔧 Configuration

### Environment Variables
```bash
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key

# AI APIs
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

### Model Parameters
```python
# XGBoost parameters
XGB_PARAMS = {
    'max_depth': 6,
    'learning_rate': 0.1,
    'n_estimators': 100,
    'scale_pos_weight': 2.0  # For imbalanced data
}

# Financial weights
FINANCIAL_WEIGHTS = {
    'fs_capture_share': 0.40,
    'aio_citation_share': 0.40,
    'paa_box_ownership': 0.20
}
```

## 📚 Documentation

- [Formulas Reference](formulas_reference.md) - Complete algorithmic formulas
- [API Documentation](api_docs.md) - Endpoint specifications
- [Dashboard Guide](dashboard_guide.md) - UI component usage
- [Deployment Guide](deployment.md) - Production setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

- **Documentation**: [docs.dealershipai.com](https://docs.dealershipai.com)
- **Issues**: GitHub Issues
- **Email**: support@dealershipai.com
- **Slack**: #qai-engine-support
