"""
Chart Generation Module for Board Reports
Generates PNG charts from Prometheus metrics
"""

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
from prometheus_api_client import PrometheusConnect
import numpy as np
import os

class ChartGenerator:
    def __init__(self, prometheus_url: str, output_dir: str = "/tmp"):
        self.prom = PrometheusConnect(url=prometheus_url, disable_ssl=True)
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        
        # Set style
        plt.style.use('seaborn-v0_8-darkgrid')
        matplotlib.rcParams['figure.figsize'] = (12, 6)
        matplotlib.rcParams['font.size'] = 10

    def generate_uptime_trend(self, start_time: datetime, end_time: datetime) -> str:
        """Generate uptime trend chart"""
        query = 'avg_over_time(up{job="orchestrator"}[1h])'
        
        try:
            result = self.prom.custom_query_range(
                query=query,
                start_time=start_time,
                end_time=end_time,
                step='1h'
            )
            
            if not result or len(result) == 0:
                return self._create_empty_chart("uptime_trend.png", "Uptime Trend")
            
            # Extract data
            timestamps = [datetime.fromtimestamp(float(point[0])) for point in result[0]['values']]
            values = [float(point[1]) * 100 for point in result[0]['values']]  # Convert to percentage
            
            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(timestamps, values, linewidth=2, color='#3b82f6', label='Uptime')
            ax.axhline(y=99.9, color='#059669', linestyle='--', linewidth=1.5, label='Target (99.9%)')
            ax.fill_between(timestamps, 99.9, values, where=(np.array(values) >= 99.9), 
                           alpha=0.2, color='#059669', label='Above Target')
            ax.fill_between(timestamps, 99.9, values, where=(np.array(values) < 99.9), 
                           alpha=0.2, color='#dc2626', label='Below Target')
            
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('Uptime (%)', fontsize=12)
            ax.set_title('System Uptime Trend', fontsize=14, fontweight='bold')
            ax.legend(loc='best')
            ax.grid(True, alpha=0.3)
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            ax.xaxis.set_major_locator(mdates.DayLocator(interval=7))
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            output_path = os.path.join(self.output_dir, "uptime_trend.png")
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return output_path
        except Exception as e:
            print(f"Error generating uptime trend: {e}")
            return self._create_empty_chart("uptime_trend.png", "Uptime Trend")

    def generate_gnn_precision(self, start_time: datetime, end_time: datetime) -> str:
        """Generate GNN precision chart"""
        query = 'gnn_precision_by_dealer'
        
        try:
            result = self.prom.custom_query_range(
                query=query,
                start_time=start_time,
                end_time=end_time,
                step='1d'
            )
            
            if not result or len(result) == 0:
                return self._create_empty_chart("gnn_precision.png", "GNN Precision")
            
            # Average across all dealers
            timestamps = []
            precision_values = []
            
            if len(result) > 0:
                timestamps = [datetime.fromtimestamp(float(point[0])) for point in result[0]['values']]
                values = [float(point[1]) * 100 for point in result[0]['values']]
                precision_values = values
            
            fig, ax = plt.subplots(figsize=(12, 6))
            if precision_values:
                ax.plot(timestamps, precision_values, linewidth=2, color='#8b5cf6', marker='o', markersize=4, label='GNN Precision')
                ax.axhline(y=90, color='#059669', linestyle='--', linewidth=1.5, label='Target (90%)')
            
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('Precision (%)', fontsize=12)
            ax.set_title('GNN Model Precision Trend', fontsize=14, fontweight='bold')
            ax.legend(loc='best')
            ax.grid(True, alpha=0.3)
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            output_path = os.path.join(self.output_dir, "gnn_precision.png")
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return output_path
        except Exception as e:
            print(f"Error generating GNN precision: {e}")
            return self._create_empty_chart("gnn_precision.png", "GNN Precision")

    def generate_auto_fixes(self, auto_count: int, manual_count: int) -> str:
        """Generate automation breakdown pie chart"""
        fig, ax = plt.subplots(figsize=(10, 8))
        
        sizes = [auto_count, manual_count]
        labels = ['Auto-Resolved', 'Manual Intervention']
        colors = ['#059669', '#dc2626']
        explode = (0.05, 0)  # Explode auto-resolved slice
        
        wedges, texts, autotexts = ax.pie(
            sizes, 
            labels=labels, 
            colors=colors,
            autopct='%1.1f%%',
            explode=explode,
            shadow=True,
            startangle=90
        )
        
        # Style the text
        for autotext in autotexts:
            autotext.set_color('white')
            autotext.set_fontweight('bold')
            autotext.set_fontsize(12)
        
        ax.set_title('Incident Resolution Breakdown', fontsize=14, fontweight='bold')
        
        output_path = os.path.join(self.output_dir, "auto_fixes.png")
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return output_path

    def generate_arr_gain(self, start_time: datetime, end_time: datetime) -> str:
        """Generate ARR gain trend chart"""
        query = 'sum(gnn_arr_gain_by_dealer)'
        
        try:
            result = self.prom.custom_query_range(
                query=query,
                start_time=start_time,
                end_time=end_time,
                step='1d'
            )
            
            if not result or len(result) == 0:
                return self._create_empty_chart("arr_gain.png", "ARR Gain")
            
            timestamps = [datetime.fromtimestamp(float(point[0])) for point in result[0]['values']]
            values = [float(point[1]) for point in result[0]['values']]
            
            fig, ax = plt.subplots(figsize=(12, 6))
            ax.plot(timestamps, values, linewidth=2, color='#059669', marker='o', markersize=4, label='ARR Gain')
            ax.fill_between(timestamps, 0, values, alpha=0.3, color='#059669')
            ax.axhline(y=0, color='#1e293b', linestyle='-', linewidth=1)
            
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('ARR Gain ($)', fontsize=12)
            ax.set_title('Cumulative ARR Gain Trend', fontsize=14, fontweight='bold')
            ax.legend(loc='best')
            ax.grid(True, alpha=0.3)
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            plt.xticks(rotation=45)
            
            # Format y-axis as currency
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
            
            plt.tight_layout()
            
            output_path = os.path.join(self.output_dir, "arr_gain.png")
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return output_path
        except Exception as e:
            print(f"Error generating ARR gain: {e}")
            return self._create_empty_chart("arr_gain.png", "ARR Gain")

    def generate_arr_forecast(self, start_time: datetime, end_time: datetime) -> str:
        """Generate ARR forecast with confidence bands"""
        query_actual = 'sum(gnn_arr_gain_by_dealer)'
        query_forecast = 'arr_forecast_value'
        
        try:
            # Get actual and forecast data
            actual_result = self.prom.custom_query_range(
                query=query_actual,
                start_time=start_time,
                end_time=end_time,
                step='1d'
            )
            
            forecast_result = self.prom.custom_query_range(
                query=query_forecast,
                start_time=start_time,
                end_time=end_time,
                step='1d'
            )
            
            fig, ax = plt.subplots(figsize=(12, 6))
            
            if actual_result and len(actual_result) > 0:
                timestamps = [datetime.fromtimestamp(float(point[0])) for point in actual_result[0]['values']]
                actual_values = [float(point[1]) for point in actual_result[0]['values']]
                ax.plot(timestamps, actual_values, linewidth=2, color='#3b82f6', marker='o', markersize=4, label='Actual ARR')
            
            if forecast_result and len(forecast_result) > 0:
                timestamps = [datetime.fromtimestamp(float(point[0])) for point in forecast_result[0]['values']]
                forecast_values = [float(point[1]) for point in forecast_result[0]['values']]
                ax.plot(timestamps, forecast_values, linewidth=2, color='#8b5cf6', linestyle='--', label='Forecast')
            
            ax.set_xlabel('Date', fontsize=12)
            ax.set_ylabel('ARR ($)', fontsize=12)
            ax.set_title('ARR Forecast vs Actual', fontsize=14, fontweight='bold')
            ax.legend(loc='best')
            ax.grid(True, alpha=0.3)
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x:,.0f}'))
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            output_path = os.path.join(self.output_dir, "arr_forecast.png")
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            return output_path
        except Exception as e:
            print(f"Error generating ARR forecast: {e}")
            return self._create_empty_chart("arr_forecast.png", "ARR Forecast")

    def _create_empty_chart(self, filename: str, title: str) -> str:
        """Create a placeholder chart when data is unavailable"""
        fig, ax = plt.subplots(figsize=(12, 6))
        ax.text(0.5, 0.5, f'No data available for {title}', 
                ha='center', va='center', fontsize=14, color='#64748b')
        ax.set_title(title, fontsize=14, fontweight='bold')
        ax.axis('off')
        
        output_path = os.path.join(self.output_dir, filename)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        return output_path

