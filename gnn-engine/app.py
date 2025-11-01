"""
DealershipAI GNN Engine - FastAPI Service
Predicts optimal fixes for dealer intents using Graph Neural Networks
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from prometheus_client import Gauge, Counter, Histogram, generate_latest
from prometheus_client.openmetrics.exposition import CONTENT_TYPE_LATEST
import logging
import time

from gnn_model import VisibilityGNN, load_graph_data, predict_edges, train_model
from explainability import explain_prediction

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DealershipAI GNN Engine",
    description="Graph Neural Network service for predicting optimal fixes",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
metrics_pred_total = Counter(
    "gnn_predictions_total",
    "Total number of predictions made",
    ["dealer_id"]
)

metrics_precision = Gauge(
    "gnn_precision",
    "Prediction precision score"
)

metrics_recall = Gauge(
    "gnn_recall",
    "Prediction recall score"
)

metrics_training_loss = Gauge(
    "gnn_training_loss",
    "Current GNN training loss"
)

metrics_predictions_verified = Counter(
    "gnn_predictions_verified",
    "Number of verified predictions",
    ["dealer_id"]
)

metrics_prediction_latency = Histogram(
    "gnn_prediction_latency_seconds",
    "Prediction latency in seconds"
)

metrics_arr_gain = Gauge(
    "gnn_arr_gain_usd",
    "Predicted ARR gain from verified fixes in USD",
    ["dealer_id"]
)

metrics_training_cost = Counter(
    "gnn_training_cost_usd",
    "Total cost of GNN training in USD"
)

metrics_ground_truth_edges = Gauge(
    "gnn_ground_truth_edges",
    "Total number of ground truth Intent->Fix edges",
    ["dealer_id"]
)

# Global model instance
gnn_model: Optional[VisibilityGNN] = None
model_loaded = False


class PredictionRequest(BaseModel):
    dealer_id: Optional[str] = None
    threshold: float = 0.85
    max_predictions: int = 50


class PredictionResponse(BaseModel):
    predictions: List[Dict[str, Any]]
    total: int
    confidence_threshold: float


class TrainingRequest(BaseModel):
    epochs: int = 10
    learning_rate: float = 0.001
    batch_size: int = 32


class VerificationRequest(BaseModel):
    dealer_id: str
    intent: str
    fix: str
    verified: bool
    confidence: float


def load_model():
    """Load the GNN model"""
    global gnn_model, model_loaded
    try:
        gnn_model = VisibilityGNN()
        gnn_model.load_from_checkpoint()
        model_loaded = True
        logger.info("GNN model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model_loaded = False


@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_model()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "service": "gnn-engine"
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Generate predictions for optimal fixes based on dealer intents
    """
    if not model_loaded or gnn_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    start_time = time.time()

    try:
        # Load graph data
        graph_data = load_graph_data(dealer_id=request.dealer_id)

        # Generate predictions
        predictions = predict_edges(
            gnn_model,
            graph_data,
            threshold=request.threshold,
            max_predictions=request.max_predictions
        )

        # Record metrics
        latency = time.time() - start_time
        metrics_prediction_latency.observe(latency)
        dealer_label = request.dealer_id or "all"
        metrics_pred_total.labels(dealer_id=dealer_label).inc(len(predictions))

        # Estimate ARR gain (placeholder - replace with actual calculation)
        # ARR gain = predictions * avg_fix_value * confidence_weighted
        estimated_arr_gain = sum(p.get('confidence', 0) * 500 for p in predictions)  # $500 avg per verified fix
        metrics_arr_gain.labels(dealer_id=dealer_label).set(estimated_arr_gain)

        logger.info(f"Generated {len(predictions)} predictions in {latency:.2f}s")

        return PredictionResponse(
            predictions=predictions,
            total=len(predictions),
            confidence_threshold=request.threshold
        )

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train")
async def train(request: TrainingRequest, background_tasks: BackgroundTasks):
    """
    Trigger model training (runs in background)
    """
    if not model_loaded or gnn_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    async def train_task():
        try:
            graph_data = load_graph_data()
            loss, precision, recall = train_model(
                gnn_model,
                graph_data,
                epochs=request.epochs,
                learning_rate=request.learning_rate,
                batch_size=request.batch_size
            )

            metrics_training_loss.set(loss)
            metrics_precision.set(precision)
            metrics_recall.set(recall)

            # Estimate training cost (GPU hours * hourly rate)
            # Placeholder: $5 per hour * epochs/100 (normalized)
            training_cost = (request.epochs / 100) * 5.0
            metrics_training_cost.inc(training_cost)

            logger.info(f"Training completed: loss={loss:.4f}, precision={precision:.4f}, recall={recall:.4f}, cost=${training_cost:.2f}")
        except Exception as e:
            logger.error(f"Training error: {e}", exc_info=True)

    background_tasks.add_task(train_task)

    return {
        "status": "training_started",
        "epochs": request.epochs,
        "message": "Training will run in background"
    }


@app.post("/verify")
async def verify_prediction(request: VerificationRequest):
    """
    Record verification feedback for a prediction
    """
    try:
        metrics_predictions_verified.labels(dealer_id=request.dealer_id).inc()

        # Store verification in RedisGraph for retraining
        # TODO: Implement RedisGraph update
        # update_verification_edge(request.dealer_id, request.intent, request.fix, request.verified)

        logger.info(f"Verification recorded: {request.dealer_id}/{request.intent} -> {request.fix}: {request.verified}")

        return {
            "status": "recorded",
            "dealer_id": request.dealer_id
        }

    except Exception as e:
        logger.error(f"Verification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/explain")
async def explain(prediction_id: str, dealer_id: str):
    """
    Get explainability for a specific prediction
    """
    if not model_loaded or gnn_model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        graph_data = load_graph_data(dealer_id=dealer_id)
        explanation = explain_prediction(gnn_model, graph_data, prediction_id)

        return {
            "prediction_id": prediction_id,
            "explanation": explanation,
            "top_features": explanation.get("top_features", [])
        }

    except Exception as e:
        logger.error(f"Explanation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics")
async def metrics():
    """
    Prometheus metrics endpoint
    """
    return generate_latest()


@app.post("/reload-model")
async def reload_model():
    """
    Reload the model from checkpoint
    """
    load_model()
    return {
        "status": "reloaded",
        "model_loaded": model_loaded
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

