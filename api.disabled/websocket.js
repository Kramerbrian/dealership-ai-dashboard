/**
 * WebSocket Server for Real-time Dashboard Updates
 * Provides live data streaming to the DealershipAI dashboard
 */

const WebSocket = require('ws');
const crypto = require('crypto');

// WebSocket server configuration
const WS_PORT = process.env.WS_PORT || 8080;
const UPDATE_INTERVAL = parseInt(process.env.REFRESH_INTERVAL) || 30000;

class DealershipAIWebSocket {
    constructor() {
        this.clients = new Set();
        this.server = null;
        this.updateTimer = null;
        this.data = {
            lastUpdate: new Date().toISOString(),
            metrics: {},
            alerts: [],
            status: 'connected'
        };
    }

    start() {
        this.server = new WebSocket.Server({
            port: WS_PORT,
            verifyClient: this.verifyClient.bind(this)
        });

        this.server.on('connection', (ws, request) => {
            this.handleConnection(ws, request);
        });

        // Start periodic updates
        this.startDataUpdates();

        console.log(`🚀 DealershipAI WebSocket server running on port ${WS_PORT}`);
    }

    verifyClient(info) {
        // Add authentication logic here if needed
        const origin = info.origin;
        const allowedOrigins = [
            'https://www.dealershipai.com',
            'https://dealership-ai-dashboard-e0mliutra-brian-kramers-projects.vercel.app',
            'http://localhost:3000'
        ];

        return allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development';
    }

    handleConnection(ws, request) {
        const clientId = crypto.randomUUID();
        ws.clientId = clientId;
        this.clients.add(ws);

        console.log(`✅ Client connected: ${clientId}`);

        // Send initial data
        this.sendToClient(ws, {
            type: 'connection',
            data: {
                clientId,
                status: 'connected',
                timestamp: new Date().toISOString()
            }
        });

        // Send current dashboard data
        this.sendToClient(ws, {
            type: 'dashboard_data',
            data: this.generateDashboardData()
        });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                this.handleMessage(ws, data);
            } catch (error) {
                console.error('Invalid message format:', error);
            }
        });

        ws.on('close', () => {
            this.clients.delete(ws);
            console.log(`❌ Client disconnected: ${clientId}`);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.clients.delete(ws);
        });
    }

    handleMessage(ws, message) {
        switch (message.type) {
            case 'ping':
                this.sendToClient(ws, { type: 'pong', timestamp: new Date().toISOString() });
                break;

            case 'request_update':
                this.sendToClient(ws, {
                    type: 'dashboard_data',
                    data: this.generateDashboardData()
                });
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }

    sendToClient(ws, data) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    broadcast(data) {
        this.clients.forEach(ws => {
            this.sendToClient(ws, data);
        });
    }

    startDataUpdates() {
        this.updateTimer = setInterval(() => {
            const dashboardData = this.generateDashboardData();

            this.broadcast({
                type: 'dashboard_update',
                data: dashboardData,
                timestamp: new Date().toISOString()
            });

            console.log(`📊 Sent update to ${this.clients.size} clients`);
        }, UPDATE_INTERVAL);
    }

    generateDashboardData() {
        // Generate realistic but simulated data
        // In production, this would fetch from your actual data sources

        const now = new Date();
        const variation = () => Math.random() * 0.2 - 0.1; // ±10% variation

        return {
            analytics: {
                visitors: Math.floor(1247 * (1 + variation())),
                pageViews: Math.floor(3891 * (1 + variation())),
                bounceRate: (45.2 + variation() * 10).toFixed(1),
                avgSessionDuration: '2:34',
                conversions: Math.floor(23 * (1 + variation())),
                conversionRate: (1.85 + variation()).toFixed(2)
            },
            gmb: {
                views: Math.floor(892 * (1 + variation())),
                calls: Math.floor(34 * (1 + variation())),
                directions: Math.floor(156 * (1 + variation())),
                websiteClicks: Math.floor(89 * (1 + variation()))
            },
            reviews: {
                totalReviews: 127,
                averageRating: 4.6,
                recentReviews: Math.floor(5 * (1 + variation())),
                responseRate: 98.4
            },
            aiCitations: {
                totalCitations: Math.floor(45 * (1 + variation())),
                chatgptMentions: Math.floor(12 * (1 + variation())),
                bingChatMentions: Math.floor(8 * (1 + variation())),
                claudeMentions: Math.floor(6 * (1 + variation())),
                otherMentions: Math.floor(19 * (1 + variation()))
            },
            alerts: this.generateAlerts(),
            lastUpdate: now.toISOString(),
            serverStatus: 'healthy'
        };
    }

    generateAlerts() {
        const alerts = [];

        // Randomly generate some alerts
        if (Math.random() < 0.3) {
            alerts.push({
                type: 'info',
                message: 'New positive review received',
                timestamp: new Date().toISOString()
            });
        }

        if (Math.random() < 0.1) {
            alerts.push({
                type: 'warning',
                message: 'Traffic spike detected - 20% above normal',
                timestamp: new Date().toISOString()
            });
        }

        return alerts;
    }

    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        if (this.server) {
            this.server.close();
        }

        console.log('WebSocket server stopped');
    }
}

// Initialize and start server
const wsServer = new DealershipAIWebSocket();
wsServer.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    wsServer.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down WebSocket server...');
    wsServer.stop();
    process.exit(0);
});

module.exports = DealershipAIWebSocket;