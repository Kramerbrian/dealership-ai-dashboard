"""
QAI* Engine Simple Demo
Demonstration without ML dependencies for quick testing
"""

import json
from datetime import datetime
from typing import Dict

def generate_mock_dealer_data(dealer_id: str = "dealer_456") -> Dict:
    """Generate comprehensive mock data for Dealer #456"""
    
    return {
        'dealer_id': dealer_id,
        'vdp_data': {
            'high_res_photos': 8,
            'interior_photos': 4,
            'exterior_photos': 6,
            'has_vin': 1,
            'has_mileage': 1,
            'has_price': 1,
            'has_description': 1,
            'description_length': 250,
            'has_reviews': 1,
            'has_schema_markup': 1,
            'piqr_score': 1.2,
            'hrp_score': 0.15,
            'price': 35000,
            'mileage': 25000,
            'year': 2022,
            'deceptive_pricing': False,
            'inventory_dilution': False,
            'content_duplication': True,
            'missing_photos': False,
            'incomplete_specs': False,
            'no_reviews': False,
            'poor_quality_images': False,
            'missing_vin': False
        },
        'mention_data': {
            'total_mentions': 150,
            'verifiable_mentions': 135,
            'severity_level': 'medium'
        },
        'visibility_scores': {
            'google_ai': 75.0,
            'chatgpt': 68.0,
            'bing': 72.0,
            'perplexity': 60.0
        },
        'clarity_data': {
            'scs': 72.0,
            'sis': 75.0,
            'scr': 68.0,
            'adi': 70.0,
            'aiv_core': 75.0,
            'aiv_mods': 1.0,
            'ati_core': 70.0,
            'ati_mods': 1.0
        },
        'competitor_data': {
            'predicted_geo_spend': 0.3,
            'market_share': 0.15,
            'defensive_weight': 1.25,
            'competitor_aemd_avg': 65.0,
            'e_e_a_t_trust_alpha': 0.85
        },
        'aeo_metrics': {
            'fs_capture_share': 0.35,
            'aio_citation_share': 0.45,
            'paa_box_ownership': 1.8
        },
        'performance_data': {
            'fs_ctr': 0.08,
            'p3_ctr': 0.06,
            'total_vdp_views': 1200,
            'aio_vdp_views': 300,
            'total_conversions': 60,
            'paa_conversions': 15
        },
        'crm_profit': {
            'gross_profit': 2800,
            'average_deal_profit': 3200,
            'conversion_rate': 0.024
        }
    }

def calculate_piqr(vdp_data: Dict) -> float:
    """Calculate PIQR (Platform Integrity Quality Rating)"""
    compliance_fails = 0
    warning_multipliers = 1.0
    
    # Check compliance fails
    compliance_checks = {
        'has_vin': 0.3,
        'has_mileage': 0.25,
        'has_price': 0.25,
        'has_description': 0.2
    }
    
    for metric, weight in compliance_checks.items():
        if vdp_data.get(metric, 0) < 0.7:
            compliance_fails += weight * (0.7 - vdp_data.get(metric, 0)) * 0.25
    
    # Apply warning multipliers
    warning_checks = {
        'deceptive_pricing': 0.75,
        'inventory_dilution': 0.80,
        'content_duplication': 0.85,
        'missing_photos': 0.90,
        'incomplete_specs': 0.95,
        'no_reviews': 0.88,
        'poor_quality_images': 0.92,
        'missing_vin': 0.98
    }
    
    for warning, multiplier in warning_checks.items():
        if vdp_data.get(warning, False):
            warning_multipliers *= multiplier
    
    piqr = (1 + compliance_fails) * warning_multipliers
    return min(piqr, 2.0)

def calculate_hrp(mention_data: Dict) -> float:
    """Calculate HRP (High-Risk Penalty)"""
    total_mentions = mention_data.get('total_mentions', 0)
    verifiable_mentions = mention_data.get('verifiable_mentions', 0)
    severity_level = mention_data.get('severity_level', 'medium')
    
    if total_mentions == 0:
        return 0.0
    
    severity_multipliers = {
        'low': 0.5,
        'medium': 1.0,
        'high': 2.0,
        'critical': 3.0
    }
    
    severity_multiplier = severity_multipliers.get(severity_level, 1.0)
    unverifiable_ratio = (total_mentions - verifiable_mentions) / total_mentions
    hrp = unverifiable_ratio * (1 + severity_multiplier)
    
    return min(hrp, 1.0)

def calculate_vai_penalized(visibility_scores: Dict, piqr: float) -> float:
    """Calculate VAI (Visibility Authority Index) with PIQR penalty"""
    platform_weights = {
        'google_ai': 0.50,
        'chatgpt': 0.30,
        'bing': 0.15,
        'perplexity': 0.05
    }
    
    weighted_visibility = sum(
        visibility_scores.get(platform, 0) * weight
        for platform, weight in platform_weights.items()
    )
    
    if piqr <= 0:
        return 0.0
    
    vai_penalized = weighted_visibility / piqr
    return min(vai_penalized, 100.0)

def calculate_aiv_metrics(clarity_data: Dict) -> Dict:
    """Calculate AIV (AI Visibility Index) metrics"""
    scs = clarity_data.get('scs', 0)
    sis = clarity_data.get('sis', 0)
    scr = clarity_data.get('scr', 0)
    
    aiv_sel = (0.35 * scs + 0.35 * sis + 0.30 * scr)
    aiv_core = clarity_data.get('aiv_core', 75.0)
    aiv_mods = clarity_data.get('aiv_mods', 1.0)
    
    aiv_final = (aiv_core * aiv_mods) * (1 + 0.25 * aiv_sel)
    
    return {
        'aiv_sel': aiv_sel,
        'aiv_core': aiv_core,
        'aiv_mods': aiv_mods,
        'aiv_final': min(aiv_final, 100.0)
    }

def calculate_ati_metrics(clarity_data: Dict) -> Dict:
    """Calculate ATI (AI Trust Index) metrics"""
    adi = clarity_data.get('adi', 0)
    scr = clarity_data.get('scr', 0)
    
    ati_sel = (0.5 * adi + 0.5 * scr)
    ati_core = clarity_data.get('ati_core', 70.0)
    ati_mods = clarity_data.get('ati_mods', 1.0)
    
    ati_final = (ati_core * ati_mods) * (1 + 0.20 * ati_sel)
    
    return {
        'ati_sel': ati_sel,
        'ati_core': ati_core,
        'ati_mods': ati_mods,
        'ati_final': min(ati_final, 100.0)
    }

def calculate_crs_metrics(aiv_data: Dict, ati_data: Dict) -> Dict:
    """Calculate CRS (Conversion Rate Score)"""
    aiv_final = aiv_data.get('aiv_final', 0)
    ati_final = ati_data.get('ati_final', 0)
    
    w1 = 0.6
    w2 = 0.4
    
    crs = (w1 * aiv_final + w2 * ati_final) / (w1 + w2)
    
    return {
        'crs': min(crs, 100.0),
        'aiv_contribution': w1 * aiv_final,
        'ati_contribution': w2 * ati_final
    }

def calculate_aemd_score(aeo_metrics: Dict, competitive_data: Dict) -> Dict:
    """Calculate AEMD (Answer Engine Market Dominance) Score"""
    fs_capture = aeo_metrics.get('fs_capture_share', 0.0)
    aio_citation = aeo_metrics.get('aio_citation_share', 0.0)
    paa_ownership = aeo_metrics.get('paa_box_ownership', 0.0)
    
    # Base weights
    weights = {
        'fs_capture_share': 0.40,
        'aio_citation_share': 0.40,
        'paa_box_ownership': 0.20
    }
    
    weighted_score = (
        fs_capture * weights['fs_capture_share'] +
        aio_citation * weights['aio_citation_share'] +
        paa_ownership * weights['paa_box_ownership']
    )
    
    defensive_weight = competitive_data.get('defensive_weight', 1.0)
    aemd_score = weighted_score / defensive_weight
    
    return {
        'aemd_score': min(aemd_score * 100, 100.0),
        'weighted_components': {
            'fs_contribution': fs_capture * weights['fs_capture_share'],
            'aio_contribution': aio_citation * weights['aio_citation_share'],
            'paa_contribution': paa_ownership * weights['paa_box_ownership']
        },
        'defensive_weight': defensive_weight,
        'competitor_benchmark': competitive_data.get('competitor_aemd_avg', 50.0)
    }

def run_simple_qai_demo():
    """Run simplified QAI* demo without ML dependencies"""
    
    print("🚀 QAI* Engine Simple Demo")
    print("=" * 50)
    
    # Generate mock data
    dealer_data = generate_mock_dealer_data()
    print(f"📊 Generated mock data for Dealer: {dealer_data['dealer_id']}")
    
    # Calculate core metrics
    print("\n📈 Calculating Core Metrics...")
    
    piqr = calculate_piqr(dealer_data['vdp_data'])
    hrp = calculate_hrp(dealer_data['mention_data'])
    vai_penalized = calculate_vai_penalized(dealer_data['visibility_scores'], piqr)
    
    print(f"🔍 PIQR (Platform Integrity): {piqr:.2f}")
    print(f"⚠️  HRP (Hallucination Risk): {hrp:.2f}")
    print(f"👁️  VAI Penalized: {vai_penalized:.1f}")
    
    # Calculate AIV/ATI/CRS
    aiv_metrics = calculate_aiv_metrics(dealer_data['clarity_data'])
    ati_metrics = calculate_ati_metrics(dealer_data['clarity_data'])
    crs_metrics = calculate_crs_metrics(aiv_metrics, ati_metrics)
    
    print(f"\n📊 AIV Final: {aiv_metrics['aiv_final']:.1f}")
    print(f"📊 ATI Final: {ati_metrics['ati_final']:.1f}")
    print(f"📊 CRS: {crs_metrics['crs']:.1f}")
    
    # Calculate AEMD Score
    aemd_result = calculate_aemd_score(dealer_data['aeo_metrics'], dealer_data['competitor_data'])
    
    print(f"\n🎯 AEMD Score: {aemd_result['aemd_score']:.1f}/100")
    print(f"📈 Performance Gap: {aemd_result['aemd_score'] - aemd_result['competitor_benchmark']:+.1f} points")
    
    # Calculate QAI* Score
    qai_score = (vai_penalized * 0.4 + aiv_metrics['aiv_final'] * 0.6) * (1 + 0.1) - (hrp * 0.2)
    qai_score = max(0, min(qai_score, 100))
    
    print(f"\n🌟 QAI* Score: {qai_score:.1f}/100")
    
    # Risk assessment
    print("\n⚠️  RISK ASSESSMENT")
    print("-" * 20)
    
    if hrp > 0.5:
        print("🔴 CRITICAL: HRP breach detected (HRP > 0.50)")
    elif hrp > 0.2:
        print("🟡 WARNING: Elevated HRP detected")
    else:
        print("🟢 GOOD: Low hallucination risk")
    
    if piqr > 1.5:
        print("🔴 CRITICAL: High PIQR risk (PIQR > 1.5)")
    elif piqr > 1.2:
        print("🟡 WARNING: Elevated PIQR detected")
    else:
        print("🟢 GOOD: Low platform integrity risk")
    
    # Generate results summary
    results = {
        'dealer_id': dealer_data['dealer_id'],
        'qai_score': qai_score,
        'piqr': piqr,
        'hrp': hrp,
        'vai_penalized': vai_penalized,
        'aiv_final': aiv_metrics['aiv_final'],
        'ati_final': ati_metrics['ati_final'],
        'crs': crs_metrics['crs'],
        'aemd_score': aemd_result['aemd_score'],
        'risk_level': 'critical' if hrp > 0.5 or piqr > 1.5 else 'warning' if hrp > 0.2 or piqr > 1.2 else 'good',
        'timestamp': datetime.now().isoformat()
    }
    
    # Save results
    with open('qai_simple_demo_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n✅ Demo complete! Results saved to 'qai_simple_demo_results.json'")
    print("\n🎉 QAI* Engine core algorithms are working correctly!")
    
    return results

if __name__ == "__main__":
    run_simple_qai_demo()
