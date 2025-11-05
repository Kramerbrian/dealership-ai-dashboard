"""
Chart Generation Module for DealershipAI Executive Reports
Generates publication-grade charts from Prometheus metrics
"""

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for server use

import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
from prometheus_api_client import PrometheusConnect, MetricRangeDataFrame
from datetime import datetime, timedelta
import os

# Initialize Prometheus client
prom_url = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
prom = PrometheusConnect(url=prom_url, disable_ssl=True)

# Create output directory if missing
os.makedirs("/tmp/charts", exist_ok=True)


def save_chart(fig, name):
    """Save chart to disk and return path"""
    path = f"/tmp/charts/{name}.png"
    fig.tight_layout()
    fig.savefig(path, dpi=160, bbox_inches='tight')
    plt.close(fig)
    return path


def uptime_trend(days=30):
    """Generate uptime trend chart"""
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    
    try:
        data = prom.custom_query_range(
            query="avg_over_time(up[1h])",
            start_time=start,
            end_time=end,
            step="1h",
        )
        df = MetricRangeDataFrame(data)
        fig, ax = plt.subplots(figsize=(7, 3))
        df.plot(ax=ax, legend=False, color="#2563eb")
        ax.set_title("Uptime Trend (Last 30 Days)", fontsize=12, fontweight='bold')
        ax.set_ylabel("Availability", fontsize=10)
        ax.yaxis.set_major_formatter(mtick.PercentFormatter(1.0))
        ax.grid(True, linestyle="--", alpha=0.4)
        return save_chart(fig, "uptime_trend")
    except Exception as e:
        print(f"Error generating uptime trend: {e}")
        return None


def gnn_precision(days=30):
    """Generate GNN precision trend chart"""
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    
    try:
        data = prom.custom_query_range(
            query="avg_over_time(gnn_precision_ratio[1h])",
            start_time=start,
            end_time=end,
            step="1h",
        )
        df = MetricRangeDataFrame(data)
        fig, ax = plt.subplots(figsize=(7, 3))
        df.plot(ax=ax, legend=False, color="#059669")
        ax.set_title("GNN Precision Trend", fontsize=12, fontweight='bold')
        ax.set_ylabel("Precision (%)", fontsize=10)
        ax.yaxis.set_major_formatter(mtick.PercentFormatter(1.0))
        ax.grid(True, linestyle="--", alpha=0.4)
        return save_chart(fig, "gnn_precision")
    except Exception as e:
        print(f"Error generating GNN precision: {e}")
        return None


def auto_fixes(days=30):
    """Generate auto-fix count by type chart"""
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    
    try:
        data = prom.custom_query_range(
            query="sum(increase(auto_fixes_total[1d])) by (type)",
            start_time=start,
            end_time=end,
            step="1d",
        )
        fig, ax = plt.subplots(figsize=(6, 3))
        
        for series in data:
            x = [datetime.fromtimestamp(v[0]) for v in series["values"]]
            y = [float(v[1]) for v in series["values"]]
            ax.plot(x, y, label=series["metric"].get("type", "unknown"), linewidth=2)
        
        ax.set_title("Auto-Fix Count by Type", fontsize=12, fontweight='bold')
        ax.set_ylabel("Fixes per Day", fontsize=10)
        ax.legend(frameon=False, fontsize=8)
        ax.grid(True, linestyle="--", alpha=0.4)
        return save_chart(fig, "auto_fixes")
    except Exception as e:
        print(f"Error generating auto fixes: {e}")
        return None


def arr_gain(days=90):
    """Generate ARR gain trend chart"""
    end = datetime.utcnow()
    start = end - timedelta(days=days)
    
    try:
        data = prom.custom_query_range(
            query="increase(gnn_arr_gain_usd[1d])",
            start_time=start,
            end_time=end,
            step="1d",
        )
        df = MetricRangeDataFrame(data)
        fig, ax = plt.subplots(figsize=(7, 3))
        df.plot(ax=ax, legend=False, color="#7c3aed", linewidth=2)
        ax.set_title("ARR Gain (USD) Over Time", fontsize=12, fontweight='bold')
        ax.set_ylabel("Daily ARR Gain ($)", fontsize=10)
        ax.yaxis.set_major_formatter(mtick.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        ax.grid(True, linestyle="--", alpha=0.4)
        return save_chart(fig, "arr_gain")
    except Exception as e:
        print(f"Error generating ARR gain: {e}")
        return None


def generate_all_charts():
    """Generate all charts and return paths"""
    charts = {}
    
    uptime = uptime_trend()
    if uptime:
        charts["uptime_trend"] = uptime
    
    precision = gnn_precision()
    if precision:
        charts["gnn_precision"] = precision
    
    fixes = auto_fixes()
    if fixes:
        charts["auto_fixes"] = fixes
    
    arr = arr_gain()
    if arr:
        charts["arr_gain"] = arr
    
    return charts


if __name__ == "__main__":
    paths = generate_all_charts()
    print("Charts saved:", paths)

