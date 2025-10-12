import pandas as pd
import numpy as np
import xgboost as xgb
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, f1_score
import joblib
import json
from typing import Dict, List, Tuple, Optional
from datetime import datetime

class VCOModel:
    """
    VDP Conversion Oracle (VCO) - XGBoost-based ML model for VDP conversion prediction
    Uses SHAP for prescriptive interpretability and ASR generation
    """
    
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_names = []
        self.model_version = "1.0.0"
        self.training_date = None
        self.performance_metrics = {}
        
        # Feature importance tracking
        self.global_feature_importance = {}
        
    def prepare_features(self, vdp_data: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare VDP features for model training/prediction
        """
        features = vdp_data.copy()
        
        # Feature engineering
        features['photo_quality_score'] = (
            features.get('high_res_photos', 0) * 0.4 +
            features.get('interior_photos', 0) * 0.3 +
            features.get('exterior_photos', 0) * 0.3
        )
        
        features['spec_completeness'] = (
            features.get('has_vin', 0) * 0.3 +
            features.get('has_mileage', 0) * 0.25 +
            features.get('has_price', 0) * 0.25 +
            features.get('has_description', 0) * 0.2
        )
        
        features['content_quality'] = (
            features.get('description_length', 0) * 0.4 +
            features.get('has_reviews', 0) * 0.3 +
            features.get('has_schema_markup', 0) * 0.3
        )
        
        # Risk features
        features['piqr_risk'] = features.get('piqr_score', 1.0)
        features['hrp_risk'] = features.get('hrp_score', 0.0)
        
        # Select final features for training
        feature_columns = [
            'photo_quality_score', 'spec_completeness', 'content_quality',
            'piqr_risk', 'hrp_risk', 'price', 'mileage', 'year',
            'has_vin', 'has_reviews', 'has_schema_markup'
        ]
        
        return features[feature_columns].fillna(0)
    
    def train_vco_model(self, X_train: pd.DataFrame, y_train: pd.Series) -> Dict:
        """
        Train XGBoost model for VDP conversion prediction
        Optimized for F1-score/AUC on imbalanced conversion data
        """
        try:
            # Prepare features
            X_processed = self.prepare_features(X_train)
            self.feature_names = X_processed.columns.tolist()
            
            # Split for validation
            X_train_split, X_val_split, y_train_split, y_val_split = train_test_split(
                X_processed, y_train, test_size=0.2, random_state=42, stratify=y_train
            )
            
            # XGBoost parameters optimized for imbalanced data
            params = {
                'objective': 'binary:logistic',
                'eval_metric': 'auc',
                'max_depth': 6,
                'learning_rate': 0.1,
                'n_estimators': 100,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'scale_pos_weight': len(y_train[y_train == 0]) / len(y_train[y_train == 1]),
                'random_state': 42
            }
            
            # Train model
            self.model = xgb.XGBClassifier(**params)
            self.model.fit(
                X_train_split, y_train_split,
                eval_set=[(X_val_split, y_val_split)],
                early_stopping_rounds=10,
                verbose=False
            )
            
            # Generate SHAP explainer
            self.explainer = shap.TreeExplainer(self.model)
            
            # Calculate performance metrics
            y_pred = self.model.predict(X_val_split)
            y_pred_proba = self.model.predict_proba(X_val_split)[:, 1]
            
            self.performance_metrics = {
                'auc': roc_auc_score(y_val_split, y_pred_proba),
                'f1_score': f1_score(y_val_split, y_pred),
                'accuracy': (y_pred == y_val_split).mean()
            }
            
            # Calculate global feature importance
            self.global_feature_importance = self._calculate_global_importance()
            
            self.training_date = datetime.now().isoformat()
            
            return {
                'status': 'success',
                'model_version': self.model_version,
                'training_date': self.training_date,
                'performance_metrics': self.performance_metrics,
                'global_feature_importance': self.global_feature_importance
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'error': str(e),
                'model_version': self.model_version
            }
    
    def predict_probability(self, vdp_data: pd.DataFrame) -> np.ndarray:
        """
        Generate VDP Prediction Probability Score
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train_vco_model first.")
        
        X_processed = self.prepare_features(vdp_data)
        probabilities = self.model.predict_proba(X_processed)[:, 1]
        return probabilities
    
    def get_shap_values(self, vdp_data: pd.DataFrame) -> np.ndarray:
        """
        Get SHAP values for prescriptive analysis
        """
        if self.explainer is None:
            raise ValueError("SHAP explainer not available. Train model first.")
        
        X_processed = self.prepare_features(vdp_data)
        shap_values = self.explainer.shap_values(X_processed)
        return shap_values
    
    def _calculate_global_importance(self) -> Dict:
        """
        Calculate global feature importance using SHAP values
        """
        if self.explainer is None:
            return {}
        
        # Use a sample of training data for global importance
        sample_data = self.prepare_features(pd.DataFrame({
            'high_res_photos': [5, 3, 8],
            'interior_photos': [3, 2, 4],
            'exterior_photos': [4, 3, 6],
            'has_vin': [1, 1, 1],
            'has_mileage': [1, 0, 1],
            'has_price': [1, 1, 1],
            'has_description': [1, 0, 1],
            'description_length': [200, 50, 300],
            'has_reviews': [1, 0, 1],
            'has_schema_markup': [1, 0, 1],
            'piqr_score': [1.0, 1.5, 0.8],
            'hrp_score': [0.1, 0.3, 0.05],
            'price': [25000, 18000, 35000],
            'mileage': [50000, 80000, 30000],
            'year': [2020, 2018, 2022]
        }))
        
        shap_values = self.explainer.shap_values(sample_data)
        mean_abs_shap = np.abs(shap_values).mean(0)
        
        importance_dict = dict(zip(self.feature_names, mean_abs_shap))
        return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
    
    def save_model(self, filepath: str) -> bool:
        """
        Save trained model and explainer
        """
        try:
            model_data = {
                'model': self.model,
                'explainer': self.explainer,
                'feature_names': self.feature_names,
                'model_version': self.model_version,
                'training_date': self.training_date,
                'performance_metrics': self.performance_metrics,
                'global_feature_importance': self.global_feature_importance
            }
            joblib.dump(model_data, filepath)
            return True
        except Exception as e:
            print(f"Error saving model: {e}")
            return False
    
    def load_model(self, filepath: str) -> bool:
        """
        Load trained model and explainer
        """
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.explainer = model_data['explainer']
            self.feature_names = model_data['feature_names']
            self.model_version = model_data['model_version']
            self.training_date = model_data['training_date']
            self.performance_metrics = model_data['performance_metrics']
            self.global_feature_importance = model_data['global_feature_importance']
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
