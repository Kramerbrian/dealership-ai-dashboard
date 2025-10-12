import pandas as pd
import numpy as np
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

from .metrics_calculations import RiskVisibilityScoring
from .vco_model import VCOModel
from .asr_engine import ASREngine

class QAIEngine:
    """
    Quantum Authority Index (QAI*) Engine
    Core calculation engine integrating all scoring components
    """
    
    def __init__(self):
        self.risk_scoring = RiskVisibilityScoring()
        self.vco_model = VCOModel()
        self.asr_engine = ASREngine()
        
        # AIV/ATI/CRS scoring weights
        self.aiv_weights = {
            'scs': 0.35,  # Search Clarity Score
            'sis': 0.35,  # Search Intent Score  
            'scr': 0.30   # Search Conversion Rate
        }
        
        self.ati_weights = {
            'adi': 0.5,   # AI Discovery Index
            'scr': 0.5    # Search Conversion Rate
        }
        
        self.crs_weights = {
            'aiv': 0.6,   # AI Visibility Index
            'ati': 0.4    # AI Trust Index
        }
        
        # Extensions configuration
        self.extensions = {
            "fastsearch_rankembed_integration": True,
            "financial_weighting_enabled": True,
            "accuracy_metadata_reporting": True,
            "ui_modules": ["Heatmap", "AEMD_Tile", "Clarity_Tile", "Trust_Overlay"]
        }
    
    def calculate_qai_final(self, segment_scores: Dict, weights: Dict = None) -> Dict:
        """
        Calculate final QAI* score from segment scores
        """
        if weights is None:
            weights = {
                'seo_visibility': 0.3,
                'aeo_visibility': 0.35,
                'geo_visibility': 0.35
            }
        
        # Calculate weighted average
        qai_score = sum(segment_scores.get(segment, 0) * weight 
                       for segment, weight in weights.items())
        
        return {
            'qai_score': qai_score,
            'segment_breakdown': segment_scores,
            'weights_applied': weights,
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_aiv_metrics(self, clarity_data: Dict) -> Dict:
        """
        Calculate AIV (AI Visibility Index) metrics using provided formulas
        AIV_sel = (0.35*SCS + 0.35*SIS + 0.30*SCR)
        AIV_final = (AIV_core * AIV_mods) * (1 + 0.25*AIV_sel)
        """
        # Extract clarity scores
        scs = clarity_data.get('scs', 0)
        sis = clarity_data.get('sis', 0)
        scr = clarity_data.get('scr', 0)
        
        # Calculate AIV selection score
        aiv_sel = (self.aiv_weights['scs'] * scs + 
                  self.aiv_weights['sis'] * sis + 
                  self.aiv_weights['scr'] * scr)
        
        # Get core AIV and modifiers (mock data for now)
        aiv_core = clarity_data.get('aiv_core', 75.0)
        aiv_mods = clarity_data.get('aiv_mods', 1.0)
        
        # Calculate final AIV
        aiv_final = (aiv_core * aiv_mods) * (1 + 0.25 * aiv_sel)
        
        return {
            'aiv_sel': aiv_sel,
            'aiv_core': aiv_core,
            'aiv_mods': aiv_mods,
            'aiv_final': min(aiv_final, 100.0)  # Cap at 100
        }
    
    def calculate_ati_metrics(self, clarity_data: Dict) -> Dict:
        """
        Calculate ATI (AI Trust Index) metrics using provided formulas
        ATI_sel = 0.5*ADI + 0.5*SCR
        ATI_final = (ATI_core * ATI_mods) * (1 + 0.20*ATI_sel)
        """
        # Extract clarity scores
        adi = clarity_data.get('adi', 0)
        scr = clarity_data.get('scr', 0)
        
        # Calculate ATI selection score
        ati_sel = (self.ati_weights['adi'] * adi + 
                  self.ati_weights['scr'] * scr)
        
        # Get core ATI and modifiers (mock data for now)
        ati_core = clarity_data.get('ati_core', 70.0)
        ati_mods = clarity_data.get('ati_mods', 1.0)
        
        # Calculate final ATI
        ati_final = (ati_core * ati_mods) * (1 + 0.20 * ati_sel)
        
        return {
            'ati_sel': ati_sel,
            'ati_core': ati_core,
            'ati_mods': ati_mods,
            'ati_final': min(ati_final, 100.0)  # Cap at 100
        }
    
    def calculate_crs_metrics(self, aiv_data: Dict, ati_data: Dict) -> Dict:
        """
        Calculate CRS (Conversion Rate Score) using provided formula
        CRS = (w1*AIV_final + w2*ATI_final)/(w1+w2)
        """
        aiv_final = aiv_data.get('aiv_final', 0)
        ati_final = ati_data.get('ati_final', 0)
        
        w1 = self.crs_weights['aiv']
        w2 = self.crs_weights['ati']
        
        crs = (w1 * aiv_final + w2 * ati_final) / (w1 + w2)
        
        return {
            'crs': min(crs, 100.0),  # Cap at 100
            'aiv_contribution': w1 * aiv_final,
            'ati_contribution': w2 * ati_final,
            'weights': {'w1': w1, 'w2': w2}
        }
    
    def generate_complete_analysis(self, dealer_data: Dict) -> Dict:
        """
        Generate complete QAI* analysis for a dealer
        """
        # Extract data components
        vdp_data = dealer_data.get('vdp_data', {})
        mention_data = dealer_data.get('mention_data', {})
        visibility_scores = dealer_data.get('visibility_scores', {})
        clarity_data = dealer_data.get('clarity_data', {})
        competitor_data = dealer_data.get('competitor_data', {})
        crm_profit = dealer_data.get('crm_profit', {'gross_profit': 1000})
        
        # Calculate risk and visibility metrics
        piqr = self.risk_scoring.calculate_piqr(vdp_data)
        hrp = self.risk_scoring.calculate_hrp(mention_data)
        vai_penalized = self.risk_scoring.calculate_vai_penalized(visibility_scores, piqr)
        
        # Check for HRP breach
        hrp_breach = self.risk_scoring.check_hrp_breach(hrp)
        
        # Calculate AIV/ATI/CRS metrics
        aiv_metrics = self.calculate_aiv_metrics(clarity_data)
        ati_metrics = self.calculate_ati_metrics(clarity_data)
        crs_metrics = self.calculate_crs_metrics(aiv_metrics, ati_metrics)
        
        # Calculate segment scores
        segment_scores = {
            'seo_visibility': vai_penalized * 0.4,  # Weighted by VAI
            'aeo_visibility': aiv_metrics['aiv_final'] * 0.6,
            'geo_visibility': ati_metrics['ati_final'] * 0.5
        }
        
        # Calculate final QAI score
        qai_result = self.calculate_qai_final(segment_scores)
        
        # Generate ASR recommendations
        vdp_df = pd.DataFrame([vdp_data])
        asr_result = self.asr_engine.generate_asr(
            vdp_df, self.vco_model, None, crm_profit
        )
        
        # Calculate OCI (Overall Conversion Index)
        oci = (qai_result['qai_score'] * 0.4 + 
               crs_metrics['crs'] * 0.3 + 
               (100 - piqr * 50) * 0.3)  # PIQR penalty
        
        # Generate KPI Scoreboard
        kpi_scoreboard = self._generate_kpi_scoreboard({
            'qai_score': qai_result['qai_score'],
            'vai_penalized': vai_penalized,
            'piqr': piqr,
            'hrp': hrp,
            'oci': oci,
            'aiv_final': aiv_metrics['aiv_final'],
            'ati_final': ati_metrics['ati_final'],
            'crs': crs_metrics['crs']
        })
        
        return {
            'kpi_scoreboard': kpi_scoreboard,
            'qai_analysis': qai_result,
            'risk_metrics': {
                'piqr': piqr,
                'hrp': hrp,
                'hrp_breach': hrp_breach,
                'vai_penalized': vai_penalized
            },
            'clarity_metrics': {
                'aiv': aiv_metrics,
                'ati': ati_metrics,
                'crs': crs_metrics
            },
            'asr_recommendations': asr_result,
            'extensions': self.extensions,
            'output_metadata': {
                'model_version': 'v2.0.1',
                'timestamp': datetime.now().isoformat(),
                'dealer_id': dealer_data.get('dealer_id', 'unknown')
            }
        }
    
    def _generate_kpi_scoreboard(self, metrics: Dict) -> str:
        """Generate KPI Scoreboard as Markdown table"""
        scoreboard = f"""
# QAI* KPI Scoreboard

| Metric | Score | Status |
|--------|-------|--------|
| QAI* Score | {metrics['qai_score']:.1f} | {'🟢 Excellent' if metrics['qai_score'] >= 80 else '🟡 Good' if metrics['qai_score'] >= 60 else '🔴 Needs Improvement'} |
| VAI Penalized | {metrics['vai_penalized']:.1f} | {'🟢 High' if metrics['vai_penalized'] >= 70 else '🟡 Medium' if metrics['vai_penalized'] >= 50 else '🔴 Low'} |
| PIQR | {metrics['piqr']:.2f} | {'🟢 Low Risk' if metrics['piqr'] <= 1.2 else '🟡 Medium Risk' if metrics['piqr'] <= 1.5 else '🔴 High Risk'} |
| HRP | {metrics['hrp']:.2f} | {'🟢 Low' if metrics['hrp'] <= 0.2 else '🟡 Medium' if metrics['hrp'] <= 0.4 else '🔴 High'} |
| OCI | {metrics['oci']:.1f} | {'🟢 Excellent' if metrics['oci'] >= 80 else '🟡 Good' if metrics['oci'] >= 60 else '🔴 Needs Improvement'} |
| AIV Final | {metrics['aiv_final']:.1f} | {'🟢 High' if metrics['aiv_final'] >= 75 else '🟡 Medium' if metrics['aiv_final'] >= 60 else '🔴 Low'} |
| ATI Final | {metrics['ati_final']:.1f} | {'🟢 High' if metrics['ati_final'] >= 75 else '🟡 Medium' if metrics['ati_final'] >= 60 else '🔴 Low'} |
| CRS | {metrics['crs']:.1f} | {'🟢 High' if metrics['crs'] >= 75 else '🟡 Medium' if metrics['crs'] >= 60 else '🔴 Low'} |

## Risk Alerts
"""
        
        if metrics['hrp'] > 0.5:
            scoreboard += "🚨 **CRITICAL HRP BREACH ALERT** - HRP > 0.50\n"
        
        if metrics['piqr'] > 1.5:
            scoreboard += "⚠️ **High PIQR Risk** - Platform integrity concerns\n"
        
        return scoreboard
