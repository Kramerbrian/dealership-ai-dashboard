# Dealership Lost Opportunity Cost (D-LOC) - Canonized Formulas

## Overview

The D-LOC calculator quantifies unrealized profit from three primary sources of marketing waste and inefficiency. These formulas are canonized and used consistently across the DealershipAI platform.

## Core Formula

```
Total Lost Opportunity Cost = Pillar 1 + Pillar 2 + Pillar 3 + LTV Loss
```

---

## Pillar 1: Ad Spend Spillage (Website Failure)

**Description**: Profit lost because high-cost traffic is driven to a poorly performing website.

### Formulas

1. **Ad Spend Wasted**
   ```
   Ad Spend Wasted = Total Monthly Ad Spend × Website Load Speed Loss Rate
   ```

2. **Lost Leads**
   ```
   Lost Leads = Total Leads Generated × Website Load Speed Loss Rate
   ```

3. **Lost Sales**
   ```
   Lost Sales = Lost Leads × Weighted Conversion Rate
   
   Where:
   - Lost High Intent = Lost Leads × High Intent Lead Rate × High Intent Conversion Rate
   - Lost Low Intent = Lost Leads × (1 - High Intent Lead Rate) × Low Intent Conversion Rate
   - Lost Sales = Lost High Intent + Lost Low Intent
   ```

4. **Unrealized Profit**
   ```
   Unrealized Profit = Lost Sales × Total Transaction Profit
   
   Where:
   - Total Transaction Profit = Weighted Gross Profit + F&I PVR
   - Weighted Gross Profit = (New Vehicle Gross Profit × New/Used Ratio) + 
                            (Used Vehicle Gross Profit × (1 - New/Used Ratio))
   ```

---

## Pillar 2: Lead Handling Failure (Process Failure)

**Description**: Profit lost after a quality lead is generated due to slow follow-up and process inconsistencies.

### Formulas

1. **Response Time Multiplier** (Dynamic Loss Factor)
   ```
   Multiplier = f(Response Time)
   
   Where:
   - 0-5 minutes:   1.0x (0% loss)
   - 6-15 minutes:  0.8x (20% loss)
   - 16-30 minutes: 0.5x (50% loss)
   - 31-60 minutes: 0.15x (85% loss)
   - >60 minutes:   0.05x (95% loss)
   ```

2. **Lost Leads**
   ```
   Lost Leads = Total Leads Generated × (1 - Response Time Multiplier)
   ```

3. **Lost Sales**
   ```
   Lost Sales = Lost High Intent Leads × High Intent Conversion Rate +
                Lost Low Intent Leads × Low Intent Conversion Rate
   ```

4. **Unrealized Profit**
   ```
   Unrealized Profit = Lost Sales × Total Transaction Profit
   ```

5. **LTV Loss** (Customer Lifetime Value)
   ```
   LTV Loss = Lost High Intent Sales × (Total Transaction Profit + 
              (Service Profit Per Customer × Service Retention Rate))
   
   Where:
   - Service Profit Per Customer = Average service profit over 3 years
   - Service Retention Rate = Percentage of customers who return for service
   ```

---

## Pillar 3: Market Saturation Failure (Budget/Rank Constraints)

**Description**: Profit lost due to insufficient budget or poor Quality Score/Rank preventing capture of all available demand.

### Formulas

1. **Total Lost Impression Share**
   ```
   Total Lost IS = Search Lost IS (Budget) + Search Lost IS (Rank)
   ```

2. **Potential Leads**
   ```
   Potential Leads = Total Leads Generated / (1 - Total Lost IS)
   ```

3. **Missed Leads** (with Attribution Adjustment)
   ```
   Missed Leads = (Potential Leads - Total Leads Generated) × Time Decay Attribution Factor
   
   Where:
   - Time Decay Attribution Factor = 0.9 (90% credit to primary channel)
   ```

4. **Lost Sales**
   ```
   Lost Sales = (Missed High Intent Leads × High Intent Conversion Rate) +
                (Missed Low Intent Leads × Low Intent Conversion Rate)
   ```

5. **Unrealized Profit**
   ```
   Unrealized Profit = Lost Sales × Total Transaction Profit
   ```

---

## Pillar 4: Customer Lifetime Value (LTV) Loss

**Description**: Long-term profit lost from high-value customers who were lost due to poor experience.

### Formula

```
Total LTV Loss = Lost High Intent Sales × (Total Transaction Profit + 
                 Service Profit Per Customer × Service Retention Rate)
```

*Note: This is integrated into Pillar 2 calculations but shown separately for clarity.*

---

## Summary Calculations

### Total D-LOC

```
Total Lost Opportunity Cost = 
  Pillar 1 Unrealized Profit +
  Pillar 2 Unrealized Profit +
  Pillar 3 Unrealized Profit +
  Pillar 4 LTV Loss
```

### Percentage Breakdown

```
Category Percentage = (Category Amount / Total D-LOC) × 100
```

### ROI Calculation

```
ROI = (Unrealized Profit / Investment Required) × 100
```

---

## Dynamic Adjustments

### Quality Score CPC Savings

```
CPC Reduction = Current CPC × min(0.20, (Target QS - Current QS) × 0.03)

Where:
- Maximum CPC reduction: 20%
- Per point improvement: 3%
```

### Multi-Touch Attribution

```
Attributed Loss = Raw Loss × Time Decay Attribution Factor

Where:
- Time Decay Factor = 0.9 (default)
- Accounts for other channels (Display, Social) contributing to final conversion
```

---

## Industry Benchmarks

| Metric | Industry Standard | Target |
|--------|------------------|--------|
| Lead Response Time | 47 minutes | < 5 minutes |
| Website Load Speed Loss | 30% (poor CWV) | < 5% (optimized) |
| Search Lost IS (Budget) | 20% | < 5% |
| Search Lost IS (Rank) | 10% | < 5% |
| High Intent Conversion Rate | 2.5% | 3-5% |
| Service Retention Rate | 65% | 75%+ |

---

## Key Input Variables

### Financial
- `avgGrossProfitNew`: Average gross profit per new vehicle sale
- `avgGrossProfitUsed`: Average gross profit per used vehicle sale
- `avgFIPVR`: Average F&I gross profit per retail unit
- `newUsedRatio`: Percentage of new vs used sales (0.4 = 40% new)

### Lead Metrics
- `totalLeadsGenerated`: Total leads from all sources per month
- `highIntentLeadRate`: Percentage of high-intent leads (VDP forms, finance apps)
- `highIntentConversionRate`: Lead-to-sale rate for high-intent leads
- `lowIntentConversionRate`: Lead-to-sale rate for low-intent leads

### Advertising
- `searchLostISBudget`: Percentage of impressions lost due to budget (0-1)
- `searchLostISRank`: Percentage of impressions lost due to rank (0-1)

### Website Performance
- `websiteLoadSpeedLossRate`: Core Web Vitals failure rate (0-1)

### Sales Process
- `avgLeadResponseTimeMinutes`: Average time to first contact
- `serviceRetentionRate`: Percentage of customers returning for service
- `avgServiceProfitPerCustomer3Years`: Average service profit over 3 years

### Attribution
- `timeDecayAttributionFactor`: Multi-touch attribution factor (default: 0.9)
- `geoInfluenceRadiusMiles`: Physical market area radius

---

## Usage Example

```typescript
import { calculateDLOC, DLOCInputs } from '@/lib/analytics/d-loc-calculator';

const inputs: DLOCInputs = {
  avgGrossProfitNew: 3284,
  avgGrossProfitUsed: 2337,
  avgFIPVR: 2000,
  newUsedRatio: 0.4,
  totalMonthlyAdSpend: 25000,
  totalLeadsGenerated: 1000,
  highIntentLeadRate: 0.35,
  highIntentConversionRate: 0.025,
  lowIntentConversionRate: 0.01,
  searchLostISBudget: 0.20,
  searchLostISRank: 0.10,
  websiteLoadSpeedLossRate: 0.30,
  avgLeadResponseTimeMinutes: 20,
  serviceRetentionRate: 0.65,
  avgServiceProfitPerCustomer3Years: 1350,
  timeDecayAttributionFactor: 0.9,
  geoInfluenceRadiusMiles: 10,
};

const results = calculateDLOC(inputs);
console.log(`Total Lost Opportunity: $${results.summary.totalDLOC.toLocaleString()}`);
```

---

## References

- Google Ads Lost Impression Share metrics
- Core Web Vitals performance thresholds
- Industry lead response time studies
- Automotive service retention benchmarks
- Multi-touch attribution models

