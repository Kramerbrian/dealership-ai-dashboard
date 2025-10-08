const Stripe = require('stripe');
require('dotenv').config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

// Price IDs (create these in Stripe Dashboard)
const STRIPE_PLANS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY,
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
  }
};

// Product metadata
const PLAN_FEATURES = {
  free: {
    name: 'Basic Tier',
    price: 0,
    analyses_per_month: 1,
    detailed_reports: false,
    competitor_tracking: false,
    alerts: false,
    support: 'community'
  },
  pro: {
    name: 'Pro Tier',
    price: 599,
    analyses_per_month: -1, // unlimited
    detailed_reports: true,
    competitor_tracking: true,
    alerts: true,
    support: 'priority'
  },
  premium: {
    name: 'Premium+ Tier',
    price: 999,
    analyses_per_month: -1, // unlimited
    detailed_reports: true,
    competitor_tracking: true,
    alerts: true,
    support: 'dedicated',
    white_label: true,
    api_access: true
  }
};

module.exports = {
  stripe,
  STRIPE_PLANS,
  PLAN_FEATURES
};

