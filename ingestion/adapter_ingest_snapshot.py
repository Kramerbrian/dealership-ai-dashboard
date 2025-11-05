"""
Generic DealershipAI Snapshot Ingestion Adapter

Reads a DealershipAI JSON snapshot and inserts data into a local database.
"""

import os
import json
import datetime
import psycopg2

# === Environment ===
SNAPSHOT_PATH = os.getenv("SNAPSHOT_PATH", "/tmp/dealershipai_snapshot.json")
DB_URL = os.getenv(
    "POSTGRES_URL",
    "postgres://dtri_user:dtri_pass@localhost:5432/dtri_metrics"
)

# === SQL Schema Example ===
# CREATE TABLE orchestrator_metrics (
#     id SERIAL PRIMARY KEY,
#     generation_timestamp TIMESTAMP,
#     uptime_percent FLOAT,
#     aiv_score FLOAT,
#     ati_score FLOAT,
#     gnn_precision FLOAT,
#     arr_forecast_error FLOAT,
#     arr_gain_usd_quarter FLOAT,
#     self_heal_rate FLOAT,
#     automation_coverage FLOAT,
#     cost_per_compute_hour_usd FLOAT,
#     model_id TEXT,
#     last_trained TIMESTAMP,
#     inserted_at TIMESTAMP DEFAULT NOW()
# );

# === Function ===
def insert_snapshot(data):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    m = data.get("metrics", {})
    model = data.get("models", {}).get("gnn_engine", {})

    sql = """
        INSERT INTO orchestrator_metrics (
            generation_timestamp, uptime_percent, aiv_score, ati_score,
            gnn_precision, arr_forecast_error, arr_gain_usd_quarter,
            self_heal_rate, automation_coverage, cost_per_compute_hour_usd,
            model_id, last_trained
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    cur.execute(
        sql,
        (
            data.get("generation_timestamp"),
            m.get("uptime_percent"),
            m.get("aiv_score"),
            m.get("ati_score"),
            m.get("gnn_precision"),
            m.get("arr_forecast_error"),
            m.get("arr_gain_usd_quarter"),
            m.get("self_heal_rate"),
            m.get("automation_coverage"),
            m.get("cost_per_compute_hour_usd"),
            model.get("model_id"),
            model.get("last_trained"),
        ),
    )
    conn.commit()
    cur.close()
    conn.close()


# === Main ===
def main():
    if not os.path.exists(SNAPSHOT_PATH):
        print(f"[Adapter] Snapshot not found: {SNAPSHOT_PATH}")
        return

    with open(SNAPSHOT_PATH) as f:
        data = json.load(f)

    insert_snapshot(data)
    print(f"[Adapter] Snapshot ingested successfully at {datetime.datetime.utcnow().isoformat()}Z")


if __name__ == "__main__":
    main()

