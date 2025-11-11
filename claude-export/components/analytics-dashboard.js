/**
 * Advanced Analytics Dashboard Component
 * Provides comprehensive analytics visualization and insights
 */

class AnalyticsDashboard {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: options.theme || 'light',
            realTime: options.realTime || true,
            refreshInterval: options.refreshInterval || 30000,
            ...options
        };
        
        this.data = {};
        this.charts = {};
        this.refreshTimer = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.createDashboard();
        this.loadData();
        this.startRealTimeUpdates();
        this.bindEvents();
    }

    createDashboard() {
        this.container.innerHTML = `
            <div class="analytics-dashboard ${this.options.theme}">
                <!-- Header -->
                <div class="dashboard-header">
                    <div class="header-content">
                        <h2>Analytics Dashboard</h2>
                        <div class="header-controls">
                            <div class="time-range-selector">
                                <select id="time-range">
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d" selected>Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                    <option value="1y">Last year</option>
                                </select>
                            </div>
                            <button class="refresh-btn" id="refresh-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12a8 8 0 018-8V2.5L15.5 6 12 9.5V7a6 6 0 106 6h2a8 8 0 01-16 0z" fill="currentColor"/>
                                </svg>
                                Refresh
                            </button>
                            <div class="real-time-indicator" id="real-time-indicator">
                                <div class="indicator-dot"></div>
                                <span>Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M16 6L8 14L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="metric-content">
                            <h3>AI Visibility Score</h3>
                            <div class="metric-value" id="ai-score">--</div>
                            <div class="metric-change" id="ai-score-change">--</div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="metric-content">
                            <h3>Website Traffic</h3>
                            <div class="metric-value" id="traffic">--</div>
                            <div class="metric-change" id="traffic-change">--</div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L19.7071 9.70711C19.8946 9.89464 20 10.149 20 10.4142V19C20 20.1046 19.1046 21 18 21H17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="metric-content">
                            <h3>Page Views</h3>
                            <div class="metric-value" id="page-views">--</div>
                            <div class="metric-change" id="page-views-change">--</div>
                        </div>
                    </div>

                    <div class="metric-card">
                        <div class="metric-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="metric-content">
                            <h3>Conversions</h3>
                            <div class="metric-value" id="conversions">--</div>
                            <div class="metric-change" id="conversions-change">--</div>
                        </div>
                    </div>
                </div>

                <!-- Charts Section -->
                <div class="charts-section">
                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Traffic Trends</h3>
                            <div class="chart-controls">
                                <button class="chart-btn active" data-chart="traffic">Traffic</button>
                                <button class="chart-btn" data-chart="conversions">Conversions</button>
                                <button class="chart-btn" data-chart="seo">SEO Score</button>
                            </div>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="trends-chart"></canvas>
                        </div>
                    </div>

                    <div class="chart-container">
                        <div class="chart-header">
                            <h3>Traffic Sources</h3>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="sources-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Insights Section -->
                <div class="insights-section">
                    <div class="insights-header">
                        <h3>AI Insights</h3>
                        <button class="insights-refresh" id="insights-refresh">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 12a8 8 0 018-8V2.5L15.5 6 12 9.5V7a6 6 0 106 6h2a8 8 0 01-16 0z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                    <div class="insights-grid" id="insights-grid">
                        <!-- Insights will be loaded here -->
                    </div>
                </div>

                <!-- Loading Overlay -->
                <div class="loading-overlay" id="loading-overlay" style="display: none;">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading analytics data...</p>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .analytics-dashboard {
                padding: 24px;
                background: #f8fafc;
                min-height: 100vh;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .analytics-dashboard.dark {
                background: #1a1a1a;
                color: #fff;
            }

            .dashboard-header {
                background: white;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .dashboard-header.dark {
                background: #2d2d2d;
            }

            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .header-content h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: #1f2937;
            }

            .header-controls {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .time-range-selector select {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }

            .refresh-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #667eea;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.2s ease;
            }

            .refresh-btn:hover {
                background: #5a6fd8;
            }

            .real-time-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                color: #10b981;
                font-size: 12px;
                font-weight: 500;
            }

            .indicator-dot {
                width: 8px;
                height: 8px;
                background: #10b981;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 32px;
            }

            .metric-card {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .metric-card.dark {
                background: #2d2d2d;
            }

            .metric-icon {
                width: 48px;
                height: 48px;
                background: #f3f4f6;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #667eea;
            }

            .metric-content h3 {
                margin: 0 0 8px 0;
                font-size: 14px;
                font-weight: 500;
                color: #6b7280;
            }

            .metric-value {
                font-size: 32px;
                font-weight: 700;
                color: #1f2937;
                margin: 0 0 4px 0;
            }

            .metric-change {
                font-size: 14px;
                font-weight: 500;
            }

            .metric-change.positive {
                color: #10b981;
            }

            .metric-change.negative {
                color: #ef4444;
            }

            .charts-section {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 24px;
                margin-bottom: 32px;
            }

            .chart-container {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .chart-container.dark {
                background: #2d2d2d;
            }

            .chart-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .chart-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }

            .chart-controls {
                display: flex;
                gap: 8px;
            }

            .chart-btn {
                padding: 6px 12px;
                border: 1px solid #d1d5db;
                background: white;
                color: #6b7280;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }

            .chart-btn.active {
                background: #667eea;
                color: white;
                border-color: #667eea;
            }

            .chart-wrapper {
                height: 300px;
                position: relative;
            }

            .insights-section {
                background: white;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            .insights-section.dark {
                background: #2d2d2d;
            }

            .insights-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }

            .insights-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1f2937;
            }

            .insights-refresh {
                padding: 8px;
                background: #f3f4f6;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.2s ease;
            }

            .insights-refresh:hover {
                background: #e5e7eb;
            }

            .insights-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 16px;
            }

            .insight-card {
                background: #f8fafc;
                border-radius: 8px;
                padding: 16px;
                border-left: 4px solid #667eea;
            }

            .insight-card.warning {
                border-left-color: #f59e0b;
            }

            .insight-card.error {
                border-left-color: #ef4444;
            }

            .insight-card.success {
                border-left-color: #10b981;
            }

            .insight-title {
                font-weight: 600;
                color: #1f2937;
                margin: 0 0 8px 0;
                font-size: 14px;
            }

            .insight-description {
                color: #6b7280;
                margin: 0 0 12px 0;
                font-size: 13px;
                line-height: 1.4;
            }

            .insight-actions {
                display: flex;
                gap: 8px;
            }

            .insight-action {
                padding: 4px 8px;
                background: white;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .insight-action:hover {
                background: #f3f4f6;
            }

            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }

            .loading-spinner {
                background: white;
                padding: 32px;
                border-radius: 12px;
                text-align: center;
            }

            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .charts-section {
                    grid-template-columns: 1fr;
                }

                .header-content {
                    flex-direction: column;
                    gap: 16px;
                    align-items: flex-start;
                }

                .metrics-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async loadData() {
        this.showLoading();
        
        try {
            // Load analytics data
            const response = await fetch('/api/analytics');
            const data = await response.json();
            
            this.data = data;
            this.updateMetrics();
            this.updateCharts();
            this.updateInsights();
            
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showError('Failed to load analytics data');
        } finally {
            this.hideLoading();
        }
    }

    updateMetrics() {
        const metrics = this.data.metrics || {};
        
        // Update AI Visibility Score
        document.getElementById('ai-score').textContent = metrics.aiScore || '--';
        this.updateMetricChange('ai-score-change', metrics.aiScoreChange);
        
        // Update Traffic
        document.getElementById('traffic').textContent = this.formatNumber(metrics.traffic || 0);
        this.updateMetricChange('traffic-change', metrics.trafficChange);
        
        // Update Page Views
        document.getElementById('page-views').textContent = this.formatNumber(metrics.pageViews || 0);
        this.updateMetricChange('page-views-change', metrics.pageViewsChange);
        
        // Update Conversions
        document.getElementById('conversions').textContent = this.formatNumber(metrics.conversions || 0);
        this.updateMetricChange('conversions-change', metrics.conversionsChange);
    }

    updateMetricChange(elementId, change) {
        const element = document.getElementById(elementId);
        if (!element || change === undefined) return;
        
        const isPositive = change > 0;
        element.textContent = `${isPositive ? '+' : ''}${change}%`;
        element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
    }

    updateCharts() {
        // Update trends chart
        this.updateTrendsChart();
        
        // Update sources chart
        this.updateSourcesChart();
    }

    updateTrendsChart() {
        const canvas = document.getElementById('trends-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.data.trends || this.generateMockTrendsData();
        
        // Simple line chart implementation
        this.drawLineChart(ctx, data, canvas.width, canvas.height);
    }

    updateSourcesChart() {
        const canvas = document.getElementById('sources-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const data = this.data.sources || this.generateMockSourcesData();
        
        // Simple pie chart implementation
        this.drawPieChart(ctx, data, canvas.width, canvas.height);
    }

    updateInsights() {
        const container = document.getElementById('insights-grid');
        if (!container) return;
        
        const insights = this.data.insights || this.generateMockInsights();
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <h4 class="insight-title">${insight.title}</h4>
                <p class="insight-description">${insight.description}</p>
                <div class="insight-actions">
                    ${insight.actions.map(action => 
                        `<button class="insight-action" data-action="${action.action}">${action.text}</button>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    startRealTimeUpdates() {
        if (!this.options.realTime) return;
        
        this.refreshTimer = setInterval(() => {
            this.loadData();
        }, this.options.refreshInterval);
    }

    stopRealTimeUpdates() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    bindEvents() {
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadData();
        });

        // Time range selector
        document.getElementById('time-range').addEventListener('change', (e) => {
            this.loadData(e.target.value);
        });

        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCharts();
            });
        });

        // Insights refresh
        document.getElementById('insights-refresh').addEventListener('click', () => {
            this.updateInsights();
        });
    }

    showLoading() {
        document.getElementById('loading-overlay').style.display = 'flex';
        this.isLoading = true;
    }

    hideLoading() {
        document.getElementById('loading-overlay').style.display = 'none';
        this.isLoading = false;
    }

    showError(message) {
        // Show error notification
        if (window.NotificationSystem) {
            window.notifications.error('Analytics Error', message);
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Mock data generators for development
    generateMockTrendsData() {
        return {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Traffic',
                data: [1200, 1900, 3000, 5000, 2000, 3000, 4500],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)'
            }]
        };
    }

    generateMockSourcesData() {
        return {
            labels: ['Organic', 'Direct', 'Social', 'Referral', 'Email'],
            datasets: [{
                data: [40, 25, 15, 12, 8],
                backgroundColor: ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            }]
        };
    }

    generateMockInsights() {
        return [
            {
                type: 'warning',
                title: 'Page Load Speed',
                description: 'Your homepage is loading 2.3s slower than recommended. This could be impacting your search rankings.',
                actions: [
                    { text: 'Optimize', action: 'optimize-speed' },
                    { text: 'Learn More', action: 'learn-more' }
                ]
            },
            {
                type: 'success',
                title: 'SEO Improvement',
                description: 'Your meta descriptions have improved by 15% this week. Keep up the great work!',
                actions: [
                    { text: 'View Details', action: 'view-details' }
                ]
            },
            {
                type: 'info',
                title: 'New Opportunity',
                description: 'We found 3 new keywords your competitors are ranking for that you could target.',
                actions: [
                    { text: 'View Keywords', action: 'view-keywords' },
                    { text: 'Create Plan', action: 'create-plan' }
                ]
            }
        ];
    }

    // Simple chart drawing methods
    drawLineChart(ctx, data, width, height) {
        // Implementation for line chart
        ctx.clearRect(0, 0, width, height);
        // Add chart drawing logic here
    }

    drawPieChart(ctx, data, width, height) {
        // Implementation for pie chart
        ctx.clearRect(0, 0, width, height);
        // Add chart drawing logic here
    }

    // Public API
    refresh() {
        this.loadData();
    }

    destroy() {
        this.stopRealTimeUpdates();
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
} else {
    window.AnalyticsDashboard = AnalyticsDashboard;
}
