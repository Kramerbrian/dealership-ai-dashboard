"""
Visual SHAP-style chart generator for DealershipAI Orchestrator
"""

import os
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from prometheus_client import Counter, push_to_gateway

model_path = os.getenv("RL_MODEL_PATH", "/models/multiobj_policy.pt")
out_dir = os.getenv("EXPLAIN_OUT", "/tmp/explain")
pushgateway = os.getenv("PROM_PUSHGATEWAY", "http://prometheus-pushgateway:9091")

# Prometheus metric
explanations_created = Counter(
    "decision_explanations_generated_total",
    "Total SHAP charts generated"
)

os.makedirs(out_dir, exist_ok=True)


def generate_shap_plot(features: dict, feature_names: list, decision_id: str, schema_type: str):
    """Create and save a SHAP bar chart for one decision."""
    # Simple gradient-based importance approximation
    vals = np.array([features.get(name, 0) for name in feature_names])
    names = feature_names

    fig, ax = plt.subplots(figsize=(6, 3))
    order = np.argsort(np.abs(vals))[::-1]
    bars = ax.barh(
        [names[i] for i in order],
        vals[order],
        color=["#22c55e" if v > 0 else "#ef4444" for v in vals[order]]
    )
    ax.axvline(0, color="gray", lw=0.8)
    ax.set_title(f"Feature Contributions: {schema_type}")
    ax.set_xlabel("Contribution")
    plt.tight_layout()
    path = f"{out_dir}/{decision_id}_shap.png"
    plt.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)
    
    explanations_created.inc()
    push_to_gateway(pushgateway, job="shap_generator", registry=None)
    
    return path, dict(zip(names, vals.tolist()))


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        data_file = sys.argv[1]
    else:
        data_file = "/tmp/decision_context.json"
    
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        # Extract features
        features = data.get("features", {})
        names = list(features.keys())
        decision_id = data.get("id", f"decision_{int(os.getpid())}")
        schema_type = data.get("schema_type", "Unknown")
        
        path, vals = generate_shap_plot(features, names, decision_id, schema_type)
        print(json.dumps({"image_path": path, "values": vals}, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2), file=sys.stderr)
        sys.exit(1)

