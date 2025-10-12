import pandas as pd
import numpy as np
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import shap

class ASREngine:
    """
    Autonomous Strategy Recommendation (ASR) Engine
    Uses SHAP values and cost-benefit analysis to generate prescriptive recommendations
    """
    
    def __init__(self):
        self.cost_catalog = {
            "add_odometer_photo": 5.00,
            "rewrite_vdp_text": 150.00,
            "update_schema_markup": 0.00,
            "add_interior_photos": 25.00,
            "improve_description": 75.00,
            "add_customer_reviews": 0.00,
            "optimize_image_quality": 15.00,
            "add_vin_verification": 10.00,
            "enhance_specifications": 30.00,
            "add_video_content": 200.00
        }
        
        # VDP-TOP (Structured Content Protocol) template
        self.vdp_top_template = {
            "vehicle_overview": {
                "key_features": [],
                "selling_points": [],
                "condition_highlights": []
            },
            "technical_specifications": {
                "engine_details": "",
                "transmission": "",
                "fuel_economy": "",
                "safety_features": []
            },
            "ownership_experience": {
                "warranty_info": "",
                "maintenance_history": "",
                "previous_owners": "",
                "accident_history": ""
            },
            "pricing_transparency": {
                "base_price": 0,
                "additional_fees": [],
                "financing_options": [],
                "trade_in_value": 0
            }
        }
    
    def generate_asr(self, vdp_data: pd.DataFrame, vco_model, shap_explainer, 
                    crm_profit: Dict, cost_catalog: Dict = None) -> Dict:
        """
        Generate Autonomous Strategy Recommendations using SHAP and ROI calculation
        Formula: Maximize (SHAP_Value_Gain) * (VDP_Gross_Profit) - (Cost_of_Action)
        """
        if cost_catalog is None:
            cost_catalog = self.cost_catalog
        
        # Get current conversion probability
        current_prob = vco_model.predict_probability(vdp_data)[0]
        
        # Get SHAP values for feature importance
        shap_values = vco_model.get_shap_values(vdp_data)
        feature_names = vco_model.feature_names
        
        # Calculate potential improvements for each actionable feature
        recommendations = []
        
        for i, feature in enumerate(feature_names):
            if feature in self._get_actionable_features():
                # Calculate potential SHAP value gain
                current_shap = shap_values[0][i]
                potential_gain = self._calculate_potential_gain(feature, vdp_data.iloc[0])
                
                # Calculate ROI
                vdp_profit = crm_profit.get('gross_profit', 1000)  # Default $1000
                cost = self._get_action_cost(feature, cost_catalog)
                
                # ROI = (Probability_Gain * Profit) - Cost
                roi = (potential_gain * vdp_profit) - cost
                
                if roi > 0:  # Only recommend profitable actions
                    recommendations.append({
                        'action': self._get_action_name(feature),
                        'feature': feature,
                        'current_value': vdp_data.iloc[0].get(feature, 0),
                        'potential_gain': potential_gain,
                        'shap_importance': abs(current_shap),
                        'cost': cost,
                        'roi': roi,
                        'priority': self._calculate_priority(roi, abs(current_shap))
                    })
        
        # Sort by priority and limit to top 5
        recommendations.sort(key=lambda x: x['priority'], reverse=True)
        top_recommendations = recommendations[:5]
        
        # Generate VDP-TOP recommendations
        vdp_top_recommendations = self._generate_vdp_top_recommendations(vdp_data.iloc[0])
        
        return {
            'asr_recommendations': top_recommendations,
            'vdp_top_recommendations': vdp_top_recommendations,
            'current_conversion_probability': current_prob,
            'total_potential_roi': sum(rec['roi'] for rec in top_recommendations),
            'model_version': vco_model.model_version,
            'timestamp': datetime.now().isoformat()
        }
    
    def _get_actionable_features(self) -> List[str]:
        """Get list of features that can be improved through actions"""
        return [
            'photo_quality_score', 'spec_completeness', 'content_quality',
            'has_vin', 'has_reviews', 'has_schema_markup'
        ]
    
    def _calculate_potential_gain(self, feature: str, vdp_row: pd.Series) -> float:
        """Calculate potential improvement in conversion probability"""
        current_value = vdp_row.get(feature, 0)
        
        # Define improvement targets for each feature
        improvement_targets = {
            'photo_quality_score': min(1.0, 1.0 - current_value),
            'spec_completeness': min(1.0, 1.0 - current_value),
            'content_quality': min(1.0, 1.0 - current_value),
            'has_vin': 1.0 if current_value == 0 else 0.0,
            'has_reviews': 1.0 if current_value == 0 else 0.0,
            'has_schema_markup': 1.0 if current_value == 0 else 0.0
        }
        
        return improvement_targets.get(feature, 0.0)
    
    def _get_action_cost(self, feature: str, cost_catalog: Dict) -> float:
        """Get cost for improving a specific feature"""
        cost_mapping = {
            'photo_quality_score': 'optimize_image_quality',
            'spec_completeness': 'enhance_specifications',
            'content_quality': 'improve_description',
            'has_vin': 'add_vin_verification',
            'has_reviews': 'add_customer_reviews',
            'has_schema_markup': 'update_schema_markup'
        }
        
        action = cost_mapping.get(feature, 'rewrite_vdp_text')
        return cost_catalog.get(action, 100.0)
    
    def _get_action_name(self, feature: str) -> str:
        """Get human-readable action name"""
        action_names = {
            'photo_quality_score': 'Optimize Image Quality',
            'spec_completeness': 'Enhance Specifications',
            'content_quality': 'Improve Description',
            'has_vin': 'Add VIN Verification',
            'has_reviews': 'Add Customer Reviews',
            'has_schema_markup': 'Update Schema Markup'
        }
        
        return action_names.get(feature, 'Improve VDP Content')
    
    def _calculate_priority(self, roi: float, shap_importance: float) -> float:
        """Calculate priority score combining ROI and SHAP importance"""
        # Weighted combination: 70% ROI, 30% SHAP importance
        return (roi * 0.7) + (shap_importance * 100 * 0.3)
    
    def _generate_vdp_top_recommendations(self, vdp_row: pd.Series) -> Dict:
        """Generate VDP-TOP structured content recommendations"""
        recommendations = {
            "vehicle_overview": {
                "missing_elements": [],
                "recommendations": []
            },
            "technical_specifications": {
                "missing_elements": [],
                "recommendations": []
            },
            "ownership_experience": {
                "missing_elements": [],
                "recommendations": []
            },
            "pricing_transparency": {
                "missing_elements": [],
                "recommendations": []
            }
        }
        
        # Analyze current VDP content and suggest improvements
        if vdp_row.get('description_length', 0) < 100:
            recommendations["vehicle_overview"]["recommendations"].append(
                "Expand vehicle description to include key selling points"
            )
        
        if not vdp_row.get('has_vin', False):
            recommendations["technical_specifications"]["recommendations"].append(
                "Add VIN for complete vehicle identification"
            )
        
        if not vdp_row.get('has_reviews', False):
            recommendations["ownership_experience"]["recommendations"].append(
                "Include customer reviews and testimonials"
            )
        
        if vdp_row.get('price', 0) == 0:
            recommendations["pricing_transparency"]["recommendations"].append(
                "Display clear pricing information"
            )
        
        return recommendations
