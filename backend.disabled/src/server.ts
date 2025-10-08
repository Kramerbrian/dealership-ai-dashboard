import app from './app';
import { config } from './config/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer(app);

// WebSocket server for real-time updates
if (config.features.enableWebsockets) {
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          case 'subscribe':
            // Handle subscription to specific channels
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              channel: data.channel,
              timestamp: Date.now() 
            }));
            break;
          default:
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Unknown message type',
              timestamp: Date.now() 
            }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format',
          timestamp: Date.now() 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to DealershipAI WebSocket',
      timestamp: Date.now() 
    }));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 DealershipAI Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔌 WebSockets: ${config.features.enableWebsockets ? 'Enabled' : 'Disabled'}`);
  console.log(`📈 Analytics: ${config.features.enableAnalytics ? 'Enabled' : 'Disabled'}`);
  console.log(`📅 Monthly Scans: ${config.features.enableMonthlyScans ? 'Enabled' : 'Disabled'}`);
});

export default server;
