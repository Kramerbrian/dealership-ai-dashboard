/**
 * Monthly Scan Dashboard Component
 * Displays AI platform visibility tracking results
 */

class MonthlyScanDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scanHistory = [];
        this.currentLeaderboard = [];
        this.trends = {};
        this.apiKeysStatus = {};
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            // Load scan history
            const historyResponse = await fetch('/api/monthly-scan/history?limit=5');
            const historyData = await historyResponse.json();
            this.scanHistory = historyData.scans || [];

            // Load current leaderboard
            const leaderboardResponse = await fetch('/api/monthly-scan/leaderboard');
            if (leaderboardResponse.ok) {
                const leaderboardData = await leaderboardResponse.json();
                this.currentLeaderboard = leaderboardData.leaderboard || [];
            }

            // Load trends
            const trendsResponse = await fetch('/api/monthly-scan/trends');
            if (trendsResponse.ok) {
                const trendsData = await trendsResponse.json();
                this.trends = trendsData.trends || {};
            }

            // Load API keys status
            const apiKeysResponse = await fetch('/api/monthly-scan/api-keys/status');
            if (apiKeysResponse.ok) {
                const apiKeysData = await apiKeysResponse.json();
                this.apiKeysStatus = apiKeysData.keyStatus || {};
            }
        } catch (error) {
            console.error('Error loading monthly scan data:', error);
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="monthly-scan-dashboard">
                <div class="dashboard-header">
                    <h2>🤖 AI Platform Visibility Tracking</h2>
                    <p>Monthly scan results across ChatGPT, Perplexity, Claude, Gemini, SGE, and Grok</p>
                </div>

                <div class="dashboard-controls">
                    <button id="start-scan-btn" class="btn-primary">
                        🚀 Start New Scan
                    </button>
                    <button id="refresh-data-btn" class="btn-secondary">
                        🔄 Refresh Data
                    </button>
                </div>

                <div class="dashboard-grid">
                    <!-- API Keys Status -->
                    <div class="card api-keys-status">
                        <h3>🔑 API Keys Status</h3>
                        <div class="api-keys-content">
                            ${this.renderAPIKeysStatus()}
                        </div>
                    </div>

                    <!-- Scan Status -->
                    <div class="card scan-status">
                        <h3>📊 Scan Status</h3>
                        <div class="status-content">
                            ${this.renderScanStatus()}
                        </div>
                    </div>

                    <!-- Leaderboard -->
                    <div class="card leaderboard">
                        <h3>🏆 Top Performers</h3>
                        <div class="leaderboard-content">
                            ${this.renderLeaderboard()}
                        </div>
                    </div>

                    <!-- Platform Performance -->
                    <div class="card platform-performance">
                        <h3>🎯 Platform Performance</h3>
                        <div class="platform-content">
                            ${this.renderPlatformPerformance()}
                        </div>
                    </div>

                    <!-- Query Trends -->
                    <div class="card query-trends">
                        <h3>📈 Top Queries</h3>
                        <div class="query-content">
                            ${this.renderQueryTrends()}
                        </div>
                    </div>

                    <!-- Scan History -->
                    <div class="card scan-history">
                        <h3>📅 Recent Scans</h3>
                        <div class="history-content">
                            ${this.renderScanHistory()}
                        </div>
                    </div>

                    <!-- Recommendations -->
                    <div class="card recommendations">
                        <h3>💡 Recommendations</h3>
                        <div class="recommendations-content">
                            ${this.renderRecommendations()}
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .monthly-scan-dashboard {
                    padding: var(--space-6);
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .dashboard-header {
                    text-align: center;
                    margin-bottom: var(--space-8);
                }

                .dashboard-header h2 {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: var(--space-2);
                }

                .dashboard-header p {
                    font-size: 16px;
                    color: var(--text-secondary);
                }

                .dashboard-controls {
                    display: flex;
                    gap: var(--space-4);
                    justify-content: center;
                    margin-bottom: var(--space-8);
                }

                .btn-primary, .btn-secondary {
                    padding: var(--space-3) var(--space-6);
                    border-radius: var(--radius);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                }

                .btn-primary:hover {
                    background: #0056CC;
                    transform: translateY(-1px);
                }

                .btn-secondary {
                    background: transparent;
                    color: var(--primary-color);
                    border: 2px solid var(--primary-color);
                }

                .btn-secondary:hover {
                    background: var(--primary-color);
                    color: white;
                }

                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: var(--space-6);
                }

                .card {
                    background: white;
                    border-radius: var(--radius-lg);
                    padding: var(--space-6);
                    box-shadow: var(--shadow);
                    border: 1px solid var(--border);
                }

                .card h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: var(--space-4);
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .leaderboard-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-3);
                    border-radius: var(--radius);
                    margin-bottom: var(--space-2);
                    background: var(--background-secondary);
                }

                .leaderboard-item.top-3 {
                    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 193, 7, 0.1));
                    border: 1px solid rgba(255, 193, 7, 0.3);
                }

                .rank {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary-color);
                    min-width: 30px;
                }

                .dealer-info {
                    flex: 1;
                    margin-left: var(--space-3);
                }

                .dealer-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .dealer-score {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .score {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--success-color);
                }

                .platform-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-2);
                    margin-bottom: var(--space-2);
                    background: var(--background-secondary);
                    border-radius: var(--radius);
                }

                .platform-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .platform-stats {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .query-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-2);
                    margin-bottom: var(--space-2);
                    background: var(--background-secondary);
                    border-radius: var(--radius);
                }

                .query-text {
                    font-weight: 500;
                    color: var(--text-primary);
                    flex: 1;
                }

                .query-score {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--primary-color);
                }

                .scan-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-3);
                    margin-bottom: var(--space-2);
                    background: var(--background-secondary);
                    border-radius: var(--radius);
                }

                .scan-date {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .scan-status {
                    padding: var(--space-1) var(--space-3);
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .scan-status.completed {
                    background: rgba(52, 199, 89, 0.1);
                    color: var(--success-color);
                }

                .scan-status.failed {
                    background: rgba(255, 59, 48, 0.1);
                    color: var(--error-color);
                }

                .recommendation-item {
                    padding: var(--space-3);
                    margin-bottom: var(--space-2);
                    background: rgba(0, 122, 255, 0.05);
                    border-left: 3px solid var(--primary-color);
                    border-radius: var(--radius);
                }

                .recommendation-text {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .loading {
                    text-align: center;
                    padding: var(--space-8);
                    color: var(--text-secondary);
                }

                .error {
                    text-align: center;
                    padding: var(--space-8);
                    color: var(--error-color);
                }

                @media (max-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .dashboard-controls {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            </style>
        `;
    }

    renderAPIKeysStatus() {
        if (!this.apiKeysStatus || Object.keys(this.apiKeysStatus).length === 0) {
            return '<div class="loading">Loading API keys status...</div>';
        }

        const { available, total, missing, allAvailable } = this.apiKeysStatus;
        const statusClass = allAvailable ? 'completed' : 'failed';
        const statusText = allAvailable ? 'All Configured' : `${available}/${total} Configured`;

        return `
            <div class="scan-item">
                <div>
                    <div class="scan-date">API Keys Status</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${available} of ${total} platforms ready
                    </div>
                </div>
                <div class="scan-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
            ${missing && missing.length > 0 ? `
                <div style="margin-top: var(--space-4);">
                    <div style="font-size: 12px; color: var(--error-color); font-weight: 600;">
                        Missing Keys:
                    </div>
                    <div style="font-size: 11px; color: var(--text-secondary); margin-top: var(--space-1);">
                        ${missing.join(', ')}
                    </div>
                </div>
            ` : ''}
            <div style="margin-top: var(--space-4);">
                <button onclick="window.open('https://vercel.com/dashboard', '_blank')" 
                        style="padding: var(--space-2) var(--space-4); background: var(--primary-color); color: white; border: none; border-radius: var(--radius); font-size: 12px; cursor: pointer;">
                    🔧 Configure in Vercel
                </button>
            </div>
        `;
    }

    renderScanStatus() {
        if (this.scanHistory.length === 0) {
            return '<div class="loading">No scans available</div>';
        }

        const latestScan = this.scanHistory[0];
        const statusClass = latestScan.status === 'completed' ? 'completed' : 'failed';
        
        return `
            <div class="scan-item">
                <div>
                    <div class="scan-date">Latest Scan</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${new Date(latestScan.timestamp).toLocaleDateString()}
                    </div>
                </div>
                <div class="scan-status ${statusClass}">
                    ${latestScan.status}
                </div>
            </div>
            <div style="margin-top: var(--space-4);">
                <div style="font-size: 14px; color: var(--text-secondary);">
                    Dealers Scanned: ${latestScan.dealers}
                </div>
            </div>
        `;
    }

    renderLeaderboard() {
        if (this.currentLeaderboard.length === 0) {
            return '<div class="loading">No leaderboard data available</div>';
        }

        return this.currentLeaderboard.slice(0, 10).map((item, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-3' : ''}">
                <div class="rank">${item.rank}</div>
                <div class="dealer-info">
                    <div class="dealer-name">${item.dealer}</div>
                    <div class="dealer-score">Average Score: ${item.averageScore.toFixed(1)}</div>
                </div>
                <div class="score">${item.totalScore.toFixed(0)}</div>
            </div>
        `).join('');
    }

    renderPlatformPerformance() {
        if (!this.trends.platformLeaders) {
            return '<div class="loading">No platform data available</div>';
        }

        const platforms = Object.entries(this.trends.platformLeaders);
        
        return platforms.map(([platform, leaders]) => `
            <div class="platform-item">
                <div>
                    <div class="platform-name">${platform.charAt(0).toUpperCase() + platform.slice(1)}</div>
                    <div class="platform-stats">${leaders.length} dealers tracked</div>
                </div>
                <div style="font-size: 14px; font-weight: 600; color: var(--primary-color);">
                    ${leaders[0]?.score?.toFixed(0) || 'N/A'}
                </div>
            </div>
        `).join('');
    }

    renderQueryTrends() {
        if (!this.trends.queryTrends) {
            return '<div class="loading">No query data available</div>';
        }

        return this.trends.queryTrends.slice(0, 10).map(query => `
            <div class="query-item">
                <div class="query-text">${query.query}</div>
                <div class="query-score">${query.score.toFixed(0)}</div>
            </div>
        `).join('');
    }

    renderScanHistory() {
        if (this.scanHistory.length === 0) {
            return '<div class="loading">No scan history available</div>';
        }

        return this.scanHistory.map(scan => `
            <div class="scan-item">
                <div>
                    <div class="scan-date">${new Date(scan.timestamp).toLocaleDateString()}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">
                        ${scan.dealers} dealers
                    </div>
                </div>
                <div class="scan-status ${scan.status}">
                    ${scan.status}
                </div>
            </div>
        `).join('');
    }

    renderRecommendations() {
        const recommendations = [
            'Focus on optimizing for high-performing queries',
            'Improve dealer information consistency across platforms',
            'Monitor competitor performance regularly',
            'Update dealer profiles with current information',
            'Consider A/B testing different dealer descriptions'
        ];

        return recommendations.map(rec => `
            <div class="recommendation-item">
                <div class="recommendation-text">${rec}</div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Start scan button
        const startScanBtn = document.getElementById('start-scan-btn');
        if (startScanBtn) {
            startScanBtn.addEventListener('click', () => this.startNewScan());
        }

        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    async startNewScan() {
        const startBtn = document.getElementById('start-scan-btn');
        const originalText = startBtn.textContent;
        
        startBtn.textContent = '🔄 Starting Scan...';
        startBtn.disabled = true;

        try {
            const response = await fetch('/api/monthly-scan/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            const result = await response.json();

            if (result.success) {
                // Show success message
                this.showNotification('✅ Monthly scan started successfully!', 'success');
                
                // Refresh data after a short delay
                setTimeout(() => this.refreshData(), 2000);
            } else {
                this.showNotification('❌ Failed to start scan: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('❌ Error starting scan: ' + error.message, 'error');
        } finally {
            startBtn.textContent = originalText;
            startBtn.disabled = false;
        }
    }

    async refreshData() {
        const refreshBtn = document.getElementById('refresh-data-btn');
        const originalText = refreshBtn.textContent;
        
        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;

        try {
            await this.loadData();
            this.render();
            this.setupEventListeners();
            this.showNotification('✅ Data refreshed successfully!', 'success');
        } catch (error) {
            this.showNotification('❌ Error refreshing data: ' + error.message, 'error');
        } finally {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });

        // Set background color based on type
        const colors = {
            success: '#34C759',
            error: '#FF3B30',
            info: '#007AFF'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Export for use in other files
window.MonthlyScanDashboard = MonthlyScanDashboard;
