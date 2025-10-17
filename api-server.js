const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Content Security Policy - Match vercel.json configuration
app.use((req, res, next) => {
  // Use same CSP as vercel.json to avoid conflicts
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes' https://www.googletagmanager.com https://www.google-analytics.com https://vercel.live https://*.vercel.live https://vercel.live/_next-live/feedback/ https://*.vercel.live/_next-live/feedback/ https://js.stripe.com https://js.clerk.com https://js.clerk.dev https://clerk.dealershipai.com https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob: https://dealershipai.com; connect-src 'self' https://api.openai.com https://api.anthropic.com https://*.upstash.io https://*.supabase.co https://vercel.live https://*.vercel.live https://api.stripe.com https://clerk.dealershipai.com https://api.clerk.com wss: https:; frame-src 'self' https://vercel.live https://*.vercel.live https://js.stripe.com https://js.clerk.com https://js.clerk.dev https://clerk.dealershipai.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self';";
  
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Import API routes
const checkoutRoutes = require('./api/checkout');
const webhookRoutes = require('./api/webhook');
const portalRoutes = require('./api/portal');
const subscriptionRoutes = require('./api/subscription');
const verifyCheckoutRoutes = require('./api/verify-checkout');
const analyzeRoutes = require('./api/analyze');
const googleAnalyticsRoutes = require('./api/google-analytics');
const socialMediaRoutes = require('./api/social-media');
const chatbotRoutes = require('./api/chatbot');
const adminRoutes = require('./api/admin');
const onboardingRoutes = require('./api/onboarding');
const monthlyScanRoutes = require('./api/monthly-scan');
const acpCheckoutRoutes = require('./api/acp-checkout');

// API Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/verify-checkout', verifyCheckoutRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/google-analytics', googleAnalyticsRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/monthly-scan', monthlyScanRoutes);
app.use('/api/acp-checkout', acpCheckoutRoutes);

// Serve static files
app.use(express.static(__dirname));

// Handle client-side routing
app.get('*', (req, res) => {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve HTML files
  const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 DealershipAI Dashboard server running at http://localhost:${PORT}/`);
  console.log('🔐 Stripe integration active');
  console.log('📊 User tracking and remarketing enabled');
  console.log('💳 Payment processing ready');
});

