/**
 * DealershipAI Real-time Data Connection Manager
 * Handles WebSocket connections and live data streaming
 */

class RealTimeManager {
    constructor(apiService) {
        this.api = apiService;
        this.socket = null;
        this.updateInterval = 15 * 60 * 1000; // 15 minutes
        this.fastUpdateInterval = 5 * 60 * 1000; // 5 minutes for critical metrics
        this.isConnected = false;
        this.subscribers = new Map();
    }

    // Initialize real-time connections
    async initialize() {
        try {
            // Start periodic updates
            this.startPeriodicUpdates();

            // Initialize WebSocket for live updates (if available)
            await this.initializeWebSocket();

            // Set up visibility change handler
            this.setupVisibilityHandlers();

            console.log('✅ Real-time manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize real-time manager:', error);
        }
    }

    // Start periodic API polling
    startPeriodicUpdates() {
        // Regular updates (15 minutes)
        this.regularInterval = setInterval(async () => {
            await this.updateDashboardData();
        }, this.updateInterval);

        // Fast updates for critical metrics (5 minutes)
        this.fastInterval = setInterval(async () => {
            await this.updateCriticalMetrics();
        }, this.fastUpdateInterval);

        console.log('📊 Started periodic data updates');
    }

    // Initialize WebSocket connection (for real production environments)
    async initializeWebSocket() {
        if (typeof WebSocket === 'undefined') return;

        try {
            // In production, this would connect to your WebSocket server
            // For demo, we'll simulate the connection
            this.simulateWebSocketConnection();
        } catch (error) {
            console.warn('WebSocket not available, using polling fallback');
        }
    }

    // Simulate WebSocket for demo purposes
    simulateWebSocketConnection() {
        console.log('🔗 Simulating WebSocket connection...');

        // Simulate connection after 2 seconds
        setTimeout(() => {
            this.isConnected = true;
            this.updateConnectionStatus(true);
            console.log('✅ WebSocket simulation active');

            // Simulate occasional real-time updates
            this.simulateRealTimeEvents();
        }, 2000);
    }

    // Simulate real-time events
    simulateRealTimeEvents() {
        const events = [
            { type: 'citation_update', platform: 'chatgpt', change: '+1' },
            { type: 'review_received', rating: 5, platform: 'google' },
            { type: 'website_visitor', source: 'organic' },
            { type: 'gmb_action', action: 'call', count: 1 },
            { type: 'competitor_alert', competitor: 'Terry Reid Hyundai' }
        ];

        setInterval(() => {
            const event = events[Math.floor(Math.random() * events.length)];
            this.handleRealTimeEvent(event);
        }, 45000 + Math.random() * 30000); // Every 45-75 seconds
    }

    // Handle real-time events
    handleRealTimeEvent(event) {
        console.log('📡 Real-time event received:', event);

        // Update live feed
        this.addToLiveFeed(event);

        // Notify subscribers
        if (this.subscribers.has(event.type)) {
            this.subscribers.get(event.type).forEach(callback => callback(event));
        }

        // Update relevant metrics
        this.updateMetricFromEvent(event);
    }

    // Add event to live feed
    addToLiveFeed(event) {
        const feedContent = document.querySelector('.feed-content');
        if (!feedContent) return;

        const feedItem = document.createElement('div');
        feedItem.className = `feed-item ${this.getEventClass(event.type)}`;

        const eventText = this.formatEventText(event);
        const timeText = 'Just now';

        feedItem.innerHTML = `
            <div class="feed-text">${eventText}</div>
            <div class="feed-time">${timeText}</div>
        `;

        // Add to top of feed
        feedContent.insertBefore(feedItem, feedContent.firstChild);

        // Remove old items (keep last 6)
        const items = feedContent.querySelectorAll('.feed-item');
        if (items.length > 6) {
            for (let i = 6; i < items.length; i++) {
                items[i].remove();
            }
        }

        // Highlight new item briefly
        feedItem.style.background = 'rgba(0, 122, 255, 0.1)';
        setTimeout(() => {
            feedItem.style.background = '';
        }, 3000);
    }

    // Format event text for display
    formatEventText(event) {
        const formats = {
            citation_update: `${event.platform} citations increased by ${event.change}`,
            review_received: `New ${event.rating}-star review received on ${event.platform}`,
            website_visitor: `New visitor from ${event.source} search`,
            gmb_action: `Customer initiated ${event.action} from Google My Business`,
            competitor_alert: `${event.competitor} launched new campaign - monitoring impact`
        };

        return formats[event.type] || 'System update received';
    }

    // Get CSS class for event type
    getEventClass(eventType) {
        const classes = {
            citation_update: 'success',
            review_received: 'success',
            website_visitor: '',
            gmb_action: 'success',
            competitor_alert: 'warning'
        };

        return classes[eventType] || '';
    }

    // Update metrics from real-time events
    updateMetricFromEvent(event) {
        switch (event.type) {
            case 'citation_update':
                // Update AI citation counts in real-time
                this.updateAICitationDisplay(event.platform, event.change);
                break;
            case 'review_received':
                // Update review metrics
                this.updateReviewMetrics(event.rating);
                break;
            case 'website_visitor':
                // Update visitor counters
                this.incrementVisitorCount();
                break;
        }
    }

    // Update AI citation displays
    updateAICitationDisplay(platform, change) {
        // Find and update the citation count for the platform
        const elements = document.querySelectorAll(`[data-platform="${platform}"]`);
        elements.forEach(element => {
            const countElement = element.querySelector('.citation-count');
            if (countElement) {
                const currentCount = parseInt(countElement.textContent);
                const newCount = currentCount + parseInt(change);
                countElement.textContent = newCount;

                // Add visual feedback
                countElement.style.color = 'var(--apple-green)';
                setTimeout(() => {
                    countElement.style.color = '';
                }, 2000);
            }
        });
    }

    // Update dashboard data
    async updateDashboardData() {
        try {
            console.log('🔄 Updating dashboard data...');

            const newData = await this.api.refreshData();

            // Update time display
            this.updateLastRefreshTime();

            // Trigger data refresh event
            window.dispatchEvent(new CustomEvent('dashboardDataUpdated', {
                detail: { data: newData }
            }));

            console.log('✅ Dashboard data updated');
        } catch (error) {
            console.error('❌ Failed to update dashboard data:', error);
            this.showUpdateError();
        }
    }

    // Update critical metrics only
    async updateCriticalMetrics() {
        try {
            // Update high-priority metrics more frequently
            const criticalData = {
                aiCitations: await this.api.getAICitations(),
                websiteHealth: await this.api.getWebsiteHealth()
            };

            // Update displays
            this.updateCriticalDisplays(criticalData);

        } catch (error) {
            console.warn('⚠️ Failed to update critical metrics:', error);
        }
    }

    // Update critical metric displays
    updateCriticalDisplays(data) {
        // Update AI health scores
        Object.entries(data.aiCitations).forEach(([platform, metrics]) => {
            const scoreElements = document.querySelectorAll(`[data-score="${platform}"]`);
            scoreElements.forEach(element => {
                if (element.textContent !== metrics.score.toString()) {
                    element.textContent = metrics.score;
                    element.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 300);
                }
            });
        });

        // Update website health if changed
        const healthElements = document.querySelectorAll('[data-metric="website-health"]');
        healthElements.forEach(element => {
            if (element.textContent !== data.websiteHealth.performance.toString()) {
                element.textContent = data.websiteHealth.performance;
                this.animateMetricUpdate(element);
            }
        });
    }

    // Animate metric updates
    animateMetricUpdate(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.transform = 'scale(1.1)';
        element.style.color = 'var(--apple-green)';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }

    // Update connection status indicator
    updateConnectionStatus(connected) {
        const indicators = document.querySelectorAll('.live-indicator .status-dot');
        indicators.forEach(dot => {
            if (connected) {
                dot.style.background = 'var(--apple-green)';
                dot.style.animation = 'pulse 2s infinite';
            } else {
                dot.style.background = 'var(--apple-orange)';
                dot.style.animation = 'none';
            }
        });

        const statusTexts = document.querySelectorAll('.live-indicator .status-text');
        statusTexts.forEach(text => {
            text.textContent = connected ? 'Live' : 'Updating...';
        });
    }

    // Update last refresh time
    updateLastRefreshTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const options = {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            timeElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    // Show update error
    showUpdateError() {
        const indicators = document.querySelectorAll('.live-indicator');
        indicators.forEach(indicator => {
            indicator.style.background = 'rgba(255, 59, 48, 0.1)';
            setTimeout(() => {
                indicator.style.background = '';
            }, 3000);
        });
    }

    // Setup visibility change handlers
    setupVisibilityHandlers() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause updates when tab is not visible
                console.log('⏸️ Dashboard tab hidden - pausing updates');
            } else {
                // Resume and refresh when tab becomes visible
                console.log('▶️ Dashboard tab visible - resuming updates');
                this.updateDashboardData();
            }
        });
    }

    // Subscribe to real-time events
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
    }

    // Unsubscribe from events
    unsubscribe(eventType, callback) {
        if (this.subscribers.has(eventType)) {
            const callbacks = this.subscribers.get(eventType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // Cleanup
    destroy() {
        if (this.regularInterval) clearInterval(this.regularInterval);
        if (this.fastInterval) clearInterval(this.fastInterval);
        if (this.socket) this.socket.close();
        this.subscribers.clear();
        console.log('🔒 Real-time manager destroyed');
    }
}

// Export for use in dashboard
window.RealTimeManager = RealTimeManager;