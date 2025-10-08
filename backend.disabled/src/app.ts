import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authMiddleware } from './middleware/auth';
import { config } from './config/config';

// Import route modules
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import analyticsRoutes from './routes/analytics';
import externalApisRoutes from './routes/external-apis';
import oauthRoutes from './routes/oauth';
import webhookRoutes from './routes/webhooks';
import adminRoutes from './routes/admin';
import healthRoutes from './routes/health';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://js.stripe.com", "https://js.clerk.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.clerk.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://js.clerk.com"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: config.security.allowedOrigins,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check (no auth required)
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/external-apis', authMiddleware, externalApisRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
