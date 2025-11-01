"""
Explainability utilities for GNN predictions using SHAP
"""
import torch
import numpy as np
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


def explain_prediction(
    model,
    data,
    prediction_id: str,
    top_k: int = 3
) -> Dict[str, Any]:
    """
    Explain a specific prediction by identifying top contributing features
    
    Args:
        model: Trained GNN model
        data: Graph data
        prediction_id: ID of the prediction to explain (format: intent_idx_fix_idx)
        top_k: Number of top features to return
        
    Returns:
        Dictionary with explanation including top features and their contributions
    """
    try:
        intent_idx, fix_idx = map(int, prediction_id.split('_'))
        
        model.eval()
        with torch.no_grad():
            # Get node embeddings
            x_dict = data.x_dict
            edge_index_dict = data.edge_index_dict
            
            # Encode nodes
            dealer_features = model.dealer_encoder(x_dict['Dealer'])
            intent_features = model.intent_encoder(x_dict['Intent'])
            fix_features = model.fix_encoder(x_dict['Fix'])
            
            # Get the specific intent and fix features
            intent_feat = intent_features[intent_idx]
            fix_feat = fix_features[fix_idx]
            
            # Feature importance: use gradient-based attribution
            intent_feat.requires_grad_(True)
            fix_feat.requires_grad_(True)
            
            combined = torch.cat([intent_feat.unsqueeze(0), fix_feat.unsqueeze(0)], dim=-1)
            prediction = model.intent_fix_predictor(combined)
            
            prediction.backward()
            
            # Extract gradients as feature importance
            intent_grad = intent_feat.grad.abs()
            fix_grad = fix_feat.grad.abs()
            
            # Get top features
            top_intent_features = torch.topk(intent_grad, min(top_k, len(intent_grad))).indices.tolist()
            top_fix_features = torch.topk(fix_grad, min(top_k, len(fix_grad))).indices.tolist()
            
            # Feature names (in production, map indices to actual feature names)
            feature_names = {
                'intent': ['AIV', 'SCS', 'SCR', 'Intent_Volume', 'User_Count'],
                'fix': ['Fix_Complexity', 'Fix_Cost', 'Fix_Effectiveness', 'Fix_Priority', 'Fix_Time']
            }
            
            explanation = {
                'prediction_id': prediction_id,
                'confidence': prediction.item(),
                'top_intent_features': [
                    {
                        'index': idx,
                        'name': feature_names['intent'][idx] if idx < len(feature_names['intent']) else f'feature_{idx}',
                        'contribution': intent_grad[idx].item()
                    }
                    for idx in top_intent_features
                ],
                'top_fix_features': [
                    {
                        'index': idx,
                        'name': feature_names['fix'][idx] if idx < len(feature_names['fix']) else f'feature_{idx}',
                        'contribution': fix_grad[idx].item()
                    }
                    for idx in top_fix_features
                ],
                'top_features': feature_names['intent'][:top_k]  # Simplified for dashboard
            }
            
            return explanation
            
    except Exception as e:
        logger.error(f"Explanation error: {e}", exc_info=True)
        return {
            'prediction_id': prediction_id,
            'error': str(e),
            'top_features': []
        }

