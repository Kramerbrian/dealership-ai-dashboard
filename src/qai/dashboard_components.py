import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import json

class QAIDashboardComponents:
    """
    Dashboard components for the QAI* Strategic Intelligence Terminal
    Bloomberg Terminal-style interface for automotive dealership analytics
    """
    
    def __init__(self):
        self.color_schemes = {
            'critical': '#FF4444',      # Red for critical issues
            'warning': '#FFA500',       # Orange for warnings
            'success': '#00AA00',       # Green for success
            'info': '#0088FF',          # Blue for information
            'neutral': '#666666'        # Gray for neutral
        }
        
        # Segment categories for heatmap
        self.segment_categories = [
            'Used Trucks', 'New EVs', 'Used Luxury Sedans', 'Compact SUVs',
            'Full-Size Pickups', 'Luxury SUVs', 'Sports Cars', 'Hybrids',
            'Certified Pre-Owned', 'Commercial Vehicles'
        ]
    
    def generate_executive_scoreboard(self, qai_data: Dict) -> Dict:
        """
        Generate Executive Scoreboard data for top-level KPIs
        Target: Dealer Principals, GMs
        """
        qai_score = qai_data.get('qai_score', 0)
        authority_velocity = qai_data.get('authority_velocity', 0)
        oci_value = qai_data.get('oci_value', 0)
        risk_factors = qai_data.get('risk_factors', {})
        
        # Determine QAI score status
        if qai_score >= 86:
            qai_status = 'excellent'
            qai_color = self.color_schemes['success']
        elif qai_score >= 66:
            qai_status = 'good'
            qai_color = self.color_schemes['warning']
        else:
            qai_status = 'critical'
            qai_color = self.color_schemes['critical']
        
        # Determine authority velocity trend
        velocity_trend = 'up' if authority_velocity > 0 else 'down' if authority_velocity < 0 else 'stable'
        
        # Get top 3 risk factors
        top_risks = sorted(risk_factors.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            'qai_score': {
                'value': qai_score,
                'status': qai_status,
                'color': qai_color,
                'label': 'QAI* Score'
            },
            'authority_velocity': {
                'value': f"{authority_velocity:+.1f}%",
                'trend': velocity_trend,
                'label': 'Authority Velocity (7-Day)',
                'color': self.color_schemes['success'] if velocity_trend == 'up' else self.color_schemes['critical']
            },
            'oci_value': {
                'value': f"${oci_value:,.0f}",
                'label': 'Opportunity Cost of Inaction',
                'color': self.color_schemes['critical'] if oci_value > 5000 else self.color_schemes['warning']
            },
            'top_risks': [
                {
                    'factor': risk[0].replace('_', ' ').title(),
                    'value': risk[1],
                    'severity': 'high' if risk[1] > 1.5 else 'medium' if risk[1] > 1.2 else 'low'
                }
                for risk in top_risks
            ],
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_segment_heatmap(self, segment_data: Dict) -> Dict:
        """
        Generate Segment Health Heatmap data
        Target: Marketing Directors, Inventory Managers
        """
        heatmap_data = []
        
        for segment in self.segment_categories:
            segment_info = segment_data.get(segment, {})
            qai_score = segment_info.get('qai_score', 0)
            dynamic_weight = segment_info.get('dynamic_weight', 1.0)
            defensive_weight = segment_info.get('defensive_weight', 1.0)
            
            # Determine color based on QAI score
            if qai_score >= 80:
                color = self.color_schemes['success']
                intensity = 1.0
            elif qai_score >= 60:
                color = self.color_schemes['warning']
                intensity = 0.7
            else:
                color = self.color_schemes['critical']
                intensity = 0.4
            
            # Adjust intensity based on dynamic weight
            intensity *= min(dynamic_weight, 2.0) / 2.0
            
            # Check for competitive threat (high defensive weight)
            competitive_threat = defensive_weight > 1.5
            
            heatmap_data.append({
                'segment': segment,
                'qai_score': qai_score,
                'color': color,
                'intensity': intensity,
                'dynamic_weight': dynamic_weight,
                'defensive_weight': defensive_weight,
                'competitive_threat': competitive_threat,
                'aemd_score': segment_info.get('aemd_score', 0),
                'vdp_conversion': segment_info.get('vdp_conversion', 0)
            })
        
        return {
            'heatmap_data': heatmap_data,
            'total_segments': len(heatmap_data),
            'high_risk_segments': len([s for s in heatmap_data if s['qai_score'] < 60]),
            'competitive_threats': len([s for s in heatmap_data if s['competitive_threat']]),
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_prescriptive_action_queue(self, asr_data: Dict) -> Dict:
        """
        Generate Prescriptive Action Queue data
        Target: VDP Merchandisers, Content Team
        """
        recommendations = asr_data.get('recommendations', [])
        
        # Sort by estimated net profit gain (RPAS)
        sorted_recommendations = sorted(
            recommendations, 
            key=lambda x: x.get('estimated_net_profit_gain', 0), 
            reverse=True
        )
        
        action_queue = []
        for i, rec in enumerate(sorted_recommendations[:10]):  # Top 10 actions
            action_queue.append({
                'rank': i + 1,
                'action': rec.get('action', ''),
                'vdp_context': rec.get('vdp_context', ''),
                'trigger': rec.get('trigger', ''),
                'cause': rec.get('cause', ''),
                'estimated_net_profit_gain': rec.get('estimated_net_profit_gain', 0),
                'priority': rec.get('priority', 'medium'),
                'timeline': rec.get('timeline', '14 days'),
                'cost': rec.get('cost', 0),
                'roi_multiple': rec.get('roi_multiple', 0)
            })
        
        return {
            'action_queue': action_queue,
            'total_actions': len(action_queue),
            'high_priority_actions': len([a for a in action_queue if a['priority'] == 'high']),
            'total_estimated_gain': sum(a['estimated_net_profit_gain'] for a in action_queue),
            'average_roi': np.mean([a['roi_multiple'] for a in action_queue]) if action_queue else 0,
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_critical_warning_system(self, risk_data: Dict) -> Dict:
        """
        Generate Critical Warning System alerts
        """
        warnings = []
        
        # Check for HRP breach
        hrp = risk_data.get('hrp', 0)
        if hrp > 0.5:
            warnings.append({
                'type': 'critical_hrp_breach',
                'severity': 'critical',
                'title': 'CRITICAL HRP BREACH ALERT',
                'message': f'HRP > 0.50 (Current: {hrp:.2f}). AI is hallucinating price/warranty information.',
                'action': 'IMMEDIATE PAUSE on all VDP text generation. Manual fact-checking required.',
                'color': self.color_schemes['critical']
            })
        
        # Check for high PIQR
        piqr = risk_data.get('piqr', 1.0)
        if piqr > 1.5:
            warnings.append({
                'type': 'high_piqr_risk',
                'severity': 'high',
                'title': 'HIGH PIQR RISK',
                'message': f'PIQR = {piqr:.2f}. Platform integrity concerns detected.',
                'action': 'Review VDP quality and compliance immediately.',
                'color': self.color_schemes['warning']
            })
        
        # Check for schema latency
        schema_latency = risk_data.get('schema_latency', 1.0)
        if schema_latency > 1.0:
            warnings.append({
                'type': 'schema_latency',
                'severity': 'medium',
                'title': 'SCHEMA LATENCY DETECTED',
                'message': f'Schema update delay: {schema_latency:.1f}x normal.',
                'action': 'Fix data feed pipeline to ensure real-time updates.',
                'color': self.color_schemes['warning']
            })
        
        return {
            'warnings': warnings,
            'critical_count': len([w for w in warnings if w['severity'] == 'critical']),
            'high_count': len([w for w in warnings if w['severity'] == 'high']),
            'medium_count': len([w for w in warnings if w['severity'] == 'medium']),
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_30_day_forecast(self, historical_data: Dict) -> Dict:
        """
        Generate 30-day AEMD forecast using VCO prediction
        """
        current_aemd = historical_data.get('current_aemd', 50.0)
        trend_data = historical_data.get('trend_data', [])
        
        # Simple trend analysis (in production, use VCO model)
        if len(trend_data) >= 7:
            recent_trend = np.mean(trend_data[-7:]) - np.mean(trend_data[-14:-7]) if len(trend_data) >= 14 else 0
        else:
            recent_trend = 0
        
        # Project 30-day forecast
        forecast_aemd = current_aemd + (recent_trend * 30)
        forecast_aemd = max(0, min(100, forecast_aemd))  # Clamp to 0-100
        
        # Calculate confidence based on data quality
        confidence = min(0.95, len(trend_data) / 30)  # More data = higher confidence
        
        return {
            'current_aemd': current_aemd,
            'forecast_aemd': forecast_aemd,
            'projected_change': forecast_aemd - current_aemd,
            'confidence': confidence,
            'trend_direction': 'up' if recent_trend > 0 else 'down' if recent_trend < 0 else 'stable',
            'forecast_date': (datetime.now() + timedelta(days=30)).isoformat(),
            'timestamp': datetime.now().isoformat()
        }
    
    def generate_complete_dashboard_data(self, qai_data: Dict, segment_data: Dict, 
                                       asr_data: Dict, risk_data: Dict, 
                                       historical_data: Dict) -> Dict:
        """
        Generate complete dashboard data structure
        """
        return {
            'executive_scoreboard': self.generate_executive_scoreboard(qai_data),
            'segment_heatmap': self.generate_segment_heatmap(segment_data),
            'prescriptive_action_queue': self.generate_prescriptive_action_queue(asr_data),
            'critical_warnings': self.generate_critical_warning_system(risk_data),
            'forecast': self.generate_30_day_forecast(historical_data),
            'dashboard_metadata': {
                'generated_at': datetime.now().isoformat(),
                'version': '2.0',
                'dealer_id': qai_data.get('dealer_id', 'unknown'),
                'refresh_interval': '5 minutes'
            }
        }
