/**
 * Centralized content for landing page
 * Enables A/B testing, personalization, and code reduction
 */

export const COPY = {
  hero: {
    h1: "The Algorithmic Trust Dashboard for dealerships",
    sub: "See what AI shows shoppers. Fix gaps fast.",
    ctaPrimary: "Start Free Audit",
    ctaSecondary: "See How It Works"
  },
  bullets: [
    "Zero-click AI visibility",
    "Algorithmic Trust Index",
    "One-click fixes"
  ],
  audit: {
    placeholders: {
      url: "yourdealership.com",
      email: "name@dealership.com"
    },
    button: {
      start: "Analyze AI Visibility",
      running: "Scanning AI answers",
      complete: "View Results"
    }
  },
  pricing: {
    title: "Choose Your Plan",
    subtitle: "Start free, upgrade as you grow"
  },
  social: {
    title: "Trusted by Leading Dealerships",
    cta: "See what AI shows about your dealership"
  }
};

export const TIERS = [
  {
    id: "free",
    name: "Level 1",
    price: 0,
    priceDisplay: "$0/mo",
    features: [
      "1 AI scan per month",
      "Basic visibility score",
      "Evidence report",
      "Fix recommendations",
      "Email support"
    ],
    highlight: false,
    cta: "Get Started Free"
  },
  {
    id: "pro",
    name: "Level 2",
    price: 499,
    priceDisplay: "$499/mo",
    features: [
      "24 AI scans per month",
      "Bi-weekly monitoring",
      "Auto-responses",
      "Schema generator",
      "ChatGPT analysis",
      "Reviews Hub",
      "Market scans",
      "ROI calculator",
      "Priority support"
    ],
    highlight: true,
    cta: "Start Free Trial"
  },
  {
    id: "enterprise",
    name: "Level 3",
    price: 999,
    priceDisplay: "$999/mo",
    features: [
      "Unlimited AI scans",
      "Mystery shop automation",
      "Predictive analytics",
      "Daily monitoring",
      "Real-time alerts",
      "Competitor battle plans",
      "Enterprise guardrails",
      "Multi-rooftop support",
      "SLA & SSO",
      "Dedicated support"
    ],
    highlight: false,
    cta: "Contact Sales"
  }
];

export const METRICS = [
  ["Dealerships Tracked", "2,500+"],
  ["AI Platforms Monitored", "5+"],
  ["Average Score Improvement", "87%"],
  ["Customer Satisfaction", "98%"]
];

export const PLATFORMS = [
  { name: "ChatGPT", icon: "🤖" },
  { name: "Claude", icon: "🧠" },
  { name: "Perplexity", icon: "🔍" },
  { name: "Gemini", icon: "✨" },
  { name: "Copilot", icon: "🚀" },
  { name: "Google AI", icon: "🌐" }
];

export const TESTIMONIALS = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "Luxury Motors",
    content: "DealershipAI helped us increase our AI visibility by 87%. We're now the top result when customers ask AI about luxury cars in our area.",
    rating: 5,
    results: "+340% ROI in 6 months"
  },
  {
    name: "Mike Chen",
    role: "General Manager",
    company: "Family Auto Group",
    content: "The competitive intelligence is game-changing. We can see exactly what our competitors are doing and stay ahead.",
    rating: 5,
    results: "Saved 40hrs/month"
  },
  {
    name: "Lisa Rodriguez",
    role: "Digital Marketing Manager",
    company: "Premier Dealerships",
    content: "The ROI calculator alone paid for itself. We increased our qualified leads by 45% in just 3 months.",
    rating: 5,
    results: "+45% qualified leads"
  }
];

export const FAQS = [
  {
    question: "How does AI visibility tracking work?",
    answer: "We monitor your dealership across major AI platforms like ChatGPT, Perplexity, and Gemini, tracking how you appear in AI-generated responses to car shopping queries."
  },
  {
    question: "What makes DealershipAI different?",
    answer: "We're the only platform specifically designed for automotive dealerships, with industry-specific metrics and competitive intelligence tailored to the car buying process."
  },
  {
    question: "How quickly will I see results?",
    answer: "Most dealerships see improved AI visibility within 2-4 weeks of implementing our recommendations, with significant improvements within 3 months."
  }
];
