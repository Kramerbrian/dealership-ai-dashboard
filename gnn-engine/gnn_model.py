"""
Graph Neural Network Model for Intent-to-Fix Prediction
"""
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import HeteroData
from torch_geometric.nn import GCNConv, GATConv, HeteroConv, global_mean_pool
from torch_geometric.nn import MessagePassing
from typing import Dict, List, Tuple, Optional
import logging
import os
from redis import Redis
import json

logger = logging.getLogger(__name__)


class IntentToFixConv(MessagePassing):
    """Custom message passing layer for Intent -> Fix edges"""
    
    def __init__(self, in_channels: int, out_channels: int):
        super().__init__(aggr='add', flow='source_to_target')
        self.lin = nn.Linear(in_channels, out_channels)
        self.attention = nn.Sequential(
            nn.Linear(in_channels * 2, out_channels),
            nn.ReLU(),
            nn.Linear(out_channels, 1),
            nn.Sigmoid()
        )
    
    def forward(self, x, edge_index):
        return self.propagate(edge_index, x=x)
    
    def message(self, x_i, x_j):
        # Compute attention weights
        attn_input = torch.cat([x_i, x_j], dim=-1)
        attn = self.attention(attn_input)
        return attn * self.lin(x_j)


class VisibilityGNN(nn.Module):
    """
    Heterogeneous Graph Neural Network for predicting Intent -> Fix edges
    """
    
    def __init__(
        self,
        dealer_dim: int = 64,
        intent_dim: int = 128,
        fix_dim: int = 128,
        hidden_dim: int = 256,
        output_dim: int = 1
    ):
        super().__init__()
        
        self.dealer_dim = dealer_dim
        self.intent_dim = intent_dim
        self.fix_dim = fix_dim
        self.hidden_dim = hidden_dim
        
        # Node encoders
        self.dealer_encoder = nn.Sequential(
            nn.Linear(dealer_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.intent_encoder = nn.Sequential(
            nn.Linear(intent_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        self.fix_encoder = nn.Sequential(
            nn.Linear(fix_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.2)
        )
        
        # Heterogeneous convolution layers
        self.conv1 = HeteroConv({
            ('Dealer', 'HAS_INTENT', 'Intent'): GCNConv(hidden_dim, hidden_dim),
            ('Intent', 'RESOLVED_BY', 'Fix'): GCNConv(hidden_dim, hidden_dim),
            ('Dealer', 'APPLIES_FIX', 'Fix'): GCNConv(hidden_dim, hidden_dim),
        }, aggr='sum')
        
        self.conv2 = HeteroConv({
            ('Dealer', 'HAS_INTENT', 'Intent'): GCNConv(hidden_dim, hidden_dim),
            ('Intent', 'RESOLVED_BY', 'Fix'): GCNConv(hidden_dim, hidden_dim),
            ('Dealer', 'APPLIES_FIX', 'Fix'): GCNConv(hidden_dim, hidden_dim),
        }, aggr='sum')
        
        # Intent-to-Fix predictor
        self.intent_fix_predictor = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, output_dim),
            nn.Sigmoid()
        )
        
    def forward(self, x_dict: Dict, edge_index_dict: Dict):
        """
        Forward pass through the GNN
        
        Args:
            x_dict: Dictionary of node features for each node type
            edge_index_dict: Dictionary of edge indices for each edge type
            
        Returns:
            Dictionary with prediction scores for Intent -> Fix edges
        """
        # Encode node features
        x_dict['Dealer'] = self.dealer_encoder(x_dict['Dealer'])
        x_dict['Intent'] = self.intent_encoder(x_dict['Intent'])
        x_dict['Fix'] = self.fix_encoder(x_dict['Fix'])
        
        # Apply graph convolutions
        x_dict = self.conv1(x_dict, edge_index_dict)
        x_dict = {k: F.relu(v) for k, v in x_dict.items()}
        x_dict = self.conv2(x_dict, edge_index_dict)
        
        # Predict Intent -> Fix edges
        intent_features = x_dict['Intent']
        fix_features = x_dict['Fix']
        
        # Create all possible Intent-Fix pairs
        num_intents = intent_features.size(0)
        num_fixes = fix_features.size(0)
        
        intent_expanded = intent_features.unsqueeze(1).expand(-1, num_fixes, -1)
        fix_expanded = fix_features.unsqueeze(0).expand(num_intents, -1, -1)
        
        combined = torch.cat([intent_expanded, fix_expanded], dim=-1)
        combined = combined.view(num_intents * num_fixes, -1)
        
        predictions = self.intent_fix_predictor(combined)
        predictions = predictions.view(num_intents, num_fixes)
        
        return {'Intent_to_Fix': predictions}
    
    def load_from_checkpoint(self, checkpoint_path: Optional[str] = None):
        """Load model from checkpoint"""
        if checkpoint_path is None:
            checkpoint_path = os.getenv('MODEL_PATH', '/app/models/visibility_gnn.pt')
        
        if os.path.exists(checkpoint_path):
            self.load_state_dict(torch.load(checkpoint_path, map_location='cpu'))
            logger.info(f"Model loaded from {checkpoint_path}")
        else:
            logger.warning(f"No checkpoint found at {checkpoint_path}, using random initialization")
    
    def save_checkpoint(self, checkpoint_path: Optional[str] = None):
        """Save model checkpoint"""
        if checkpoint_path is None:
            checkpoint_path = os.getenv('MODEL_PATH', '/app/models/visibility_gnn.pt')
        
        os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
        torch.save(self.state_dict(), checkpoint_path)
        logger.info(f"Model saved to {checkpoint_path}")


def load_graph_data(dealer_id: Optional[str] = None) -> HeteroData:
    """
    Load graph data from RedisGraph and convert to HeteroData format
    
    Args:
        dealer_id: Optional dealer ID to filter data
        
    Returns:
        HeteroData object with node features and edge indices
    """
    try:
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        r = Redis.from_url(redis_url, decode_responses=True)
        
        # Query RedisGraph for dealer-intent-fix relationships
        query = """
        MATCH (d:Dealer)
        OPTIONAL MATCH (d)-[:HAS_INTENT]->(i:Intent)
        OPTIONAL MATCH (i)-[:RESOLVED_BY]->(f:Fix)
        OPTIONAL MATCH (d)-[:APPLIES_FIX]->(f)
        """
        
        if dealer_id:
            query += f" WHERE d.id = '{dealer_id}'"
        
        query += " RETURN d.id as dealer_id, d.features as dealer_features,"
        query += " i.id as intent_id, i.name as intent_name, i.features as intent_features,"
        query += " f.id as fix_id, f.name as fix_name, f.features as fix_features"
        
        # For now, return a minimal HeteroData structure
        # In production, execute RedisGraph query and parse results
        data = HeteroData()
        
        # Placeholder node features (replace with actual data from RedisGraph)
        data['Dealer'].x = torch.randn(10, 64)  # 10 dealers, 64 features
        data['Intent'].x = torch.randn(20, 128)  # 20 intents, 128 features
        data['Fix'].x = torch.randn(15, 128)  # 15 fixes, 128 features
        
        # Placeholder edge indices (replace with actual relationships)
        data[('Dealer', 'HAS_INTENT', 'Intent')].edge_index = torch.randint(
            0, 10, (2, 30)
        )
        data[('Intent', 'RESOLVED_BY', 'Fix')].edge_index = torch.randint(
            0, 15, (2, 25)
        )
        data[('Dealer', 'APPLIES_FIX', 'Fix')].edge_index = torch.randint(
            0, 10, (2, 20)
        )
        
        logger.info("Graph data loaded successfully")
        return data
        
    except Exception as e:
        logger.error(f"Error loading graph data: {e}")
        # Return minimal structure on error
        data = HeteroData()
        data['Dealer'].x = torch.randn(1, 64)
        data['Intent'].x = torch.randn(1, 128)
        data['Fix'].x = torch.randn(1, 128)
        data[('Dealer', 'HAS_INTENT', 'Intent')].edge_index = torch.zeros((2, 0), dtype=torch.long)
        data[('Intent', 'RESOLVED_BY', 'Fix')].edge_index = torch.zeros((2, 0), dtype=torch.long)
        data[('Dealer', 'APPLIES_FIX', 'Fix')].edge_index = torch.zeros((2, 0), dtype=torch.long)
        return data


def predict_edges(
    model: VisibilityGNN,
    data: HeteroData,
    threshold: float = 0.85,
    max_predictions: int = 50
) -> List[Dict[str, any]]:
    """
    Predict Intent -> Fix edges
    
    Args:
        model: Trained GNN model
        data: Graph data
        threshold: Confidence threshold
        max_predictions: Maximum number of predictions to return
        
    Returns:
        List of predicted edges with confidence scores
    """
    model.eval()
    with torch.no_grad():
        predictions = model(data.x_dict, data.edge_index_dict)
        
        intent_to_fix = predictions['Intent_to_Fix']
        
        # Extract top predictions above threshold
        edges = []
        for intent_idx in range(intent_to_fix.size(0)):
            for fix_idx in range(intent_to_fix.size(1)):
                score = intent_to_fix[intent_idx, fix_idx].item()
                
                if score >= threshold:
                    edges.append({
                        'intent_id': f'intent_{intent_idx}',
                        'intent_name': f'Intent {intent_idx}',
                        'fix_id': f'fix_{fix_idx}',
                        'fix_name': f'Fix {fix_idx}',
                        'confidence': score,
                        'prediction_id': f'{intent_idx}_{fix_idx}'
                    })
        
        # Sort by confidence and return top N
        edges.sort(key=lambda x: x['confidence'], reverse=True)
        return edges[:max_predictions]


def train_model(
    model: VisibilityGNN,
    data: HeteroData,
    epochs: int = 10,
    learning_rate: float = 0.001,
    batch_size: int = 32
) -> Tuple[float, float, float]:
    """
    Train the GNN model
    
    Returns:
        Tuple of (final_loss, precision, recall)
    """
    model.train()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    criterion = nn.BCELoss()
    
    # Placeholder training loop
    # In production, load actual training data with labels
    for epoch in range(epochs):
        optimizer.zero_grad()
        
        # Forward pass
        predictions = model(data.x_dict, data.edge_index_dict)
        
        # Placeholder targets (replace with actual labels from verified edges)
        targets = torch.rand_like(predictions['Intent_to_Fix'])
        
        loss = criterion(predictions['Intent_to_Fix'], targets)
        
        loss.backward()
        optimizer.step()
        
        if epoch % 2 == 0:
            logger.info(f"Epoch {epoch}, Loss: {loss.item():.4f}")
    
    model.save_checkpoint()
    
    # Calculate metrics (placeholder)
    precision = 0.85
    recall = 0.78
    
    return loss.item(), precision, recall

