/**
 * Cursor Deeplink Generator for DealershipAI (JavaScript version)
 * Generates deeplinks for both desktop and web versions of Cursor
 */

function generateDesktopPromptDeeplink(promptText) {
  const baseUrl = "cursor://anysphere.cursor-deeplink/prompt";
  const params = new URLSearchParams({ text: promptText });
  return `${baseUrl}?${params.toString()}`;
}

function generateWebPromptDeeplink(promptText) {
  const url = new URL('https://cursor.com/link/prompt');
  url.searchParams.set('text', promptText);
  return url.toString();
}

const DEALERSHIP_AI_PROMPTS = [
  {
    name: "create_api_endpoint",
    description: "Create a new API endpoint for the DealershipAI system",
    prompt: "Create a new API endpoint for the DealershipAI system with proper error handling, authentication, TypeScript types, input validation, and comprehensive documentation",
    category: "api",
    complexity: "intermediate"
  },
  {
    name: "add_authentication",
    description: "Add Clerk authentication to a React component",
    prompt: "Add Clerk authentication to a React component with role-based access control, proper error handling, loading states, and user session management",
    category: "auth",
    complexity: "intermediate"
  },
  {
    name: "create_dashboard_component",
    description: "Create a React dashboard component",
    prompt: "Create a React dashboard component for the DealershipAI intelligence system with real-time data, interactive charts, responsive design, loading states, and error handling",
    category: "ui",
    complexity: "advanced"
  },
  {
    name: "optimize_performance",
    description: "Optimize Next.js API route performance",
    prompt: "Optimize the performance of a Next.js API route with caching, rate limiting, database query optimization, connection pooling, and monitoring",
    category: "api",
    complexity: "advanced"
  },
  {
    name: "add_monitoring",
    description: "Add comprehensive monitoring and alerting",
    prompt: "Add comprehensive monitoring and alerting to an API endpoint with health checks, metrics collection, error tracking, performance monitoring, and alert notifications",
    category: "monitoring",
    complexity: "advanced"
  },
  {
    name: "create_documentation",
    description: "Create comprehensive documentation",
    prompt: "Create comprehensive documentation for a DealershipAI feature including usage examples, API reference, integration guides, code samples, and troubleshooting",
    category: "documentation",
    complexity: "intermediate"
  },
  {
    name: "implement_ml_pipeline",
    description: "Implement machine learning pipeline",
    prompt: "Implement a machine learning pipeline for the DealershipAI system with data preprocessing, model training, prediction endpoints, model versioning, and performance monitoring",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "add_compliance_monitoring",
    description: "Add Google Ads policy compliance monitoring",
    prompt: "Add Google Ads policy compliance monitoring with automated audits, violation detection, reporting, alerting, and remediation workflows",
    category: "monitoring",
    complexity: "advanced"
  },
  {
    name: "create_calculator_component",
    description: "Create interactive ROI calculator",
    prompt: "Create an interactive ROI calculator component for DealershipAI with form validation, real-time calculations, results display, mobile responsiveness, and accessibility",
    category: "ui",
    complexity: "intermediate"
  },
  {
    name: "implement_real_time_updates",
    description: "Implement real-time updates",
    prompt: "Implement real-time updates for the DealershipAI dashboard using WebSockets or Server-Sent Events with connection management, error handling, and fallback mechanisms",
    category: "ui",
    complexity: "advanced"
  },
  {
    name: "hyper_intelligence_system",
    description: "Implement hyper-intelligence system",
    prompt: "Implement the hyper-intelligence system for DealershipAI with bandit auto-healing, inventory freshness scoring, retail readiness analytics, and explainable AI",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "predictive_analytics",
    description: "Create predictive analytics endpoints",
    prompt: "Create predictive analytics endpoints for DealershipAI with ML-driven pricing optimization, demand forecasting, risk assessment, and model explainability",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "competitor_intelligence",
    description: "Implement competitor intelligence features",
    prompt: "Implement competitor intelligence features for DealershipAI with market analysis, pricing intelligence, strategic recommendations, and competitive benchmarking",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "customer_behavior_analysis",
    description: "Add customer behavior analysis",
    prompt: "Add customer behavior analysis to DealershipAI with AI-powered segmentation, purchase intent prediction, engagement optimization, and personalized recommendations",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "market_trends_analysis",
    description: "Implement market trends analysis",
    prompt: "Implement market trends analysis for DealershipAI with real-time trend analysis, demand indicators, actionable insights, and economic forecasting",
    category: "analytics",
    complexity: "advanced"
  },
  {
    name: "integration_guide",
    description: "Create integration guides",
    prompt: "Create integration guides for DealershipAI with DMS, CRM, and marketing platforms including code examples, best practices, error handling, and testing",
    category: "integration",
    complexity: "intermediate"
  }
];

function generatePromptDeeplinks(promptName, useWeb = false) {
  const prompt = DEALERSHIP_AI_PROMPTS.find(p => p.name === promptName);
  if (!prompt) {
    throw new Error(`Prompt '${promptName}' not found`);
  }
  
  return useWeb 
    ? generateWebPromptDeeplink(prompt.prompt)
    : generateDesktopPromptDeeplink(prompt.prompt);
}

function generateAllPromptDeeplinks(useWeb = false) {
  const deeplinks = {};
  
  DEALERSHIP_AI_PROMPTS.forEach(prompt => {
    deeplinks[prompt.name] = useWeb 
      ? generateWebPromptDeeplink(prompt.prompt)
      : generateDesktopPromptDeeplink(prompt.prompt);
  });
  
  return deeplinks;
}

function getPromptsByCategory(category) {
  return DEALERSHIP_AI_PROMPTS.filter(prompt => prompt.category === category);
}

function getPromptsByComplexity(complexity) {
  return DEALERSHIP_AI_PROMPTS.filter(prompt => prompt.complexity === complexity);
}

function printAllPrompts(useWeb = false) {
  console.log("🚀 DealershipAI Cursor Deeplink Generator");
  console.log("=".repeat(50));
  
  const categories = ['api', 'ui', 'auth', 'monitoring', 'analytics', 'integration', 'documentation'];
  
  categories.forEach(category => {
    console.log(`\n📊 ${category.toUpperCase()} Prompts:`);
    const categoryPrompts = getPromptsByCategory(category);
    
    categoryPrompts.forEach(prompt => {
      const deeplink = useWeb 
        ? generateWebPromptDeeplink(prompt.prompt)
        : generateDesktopPromptDeeplink(prompt.prompt);
      
      console.log(`\n${prompt.name} (${prompt.complexity}):`);
      console.log(`  Description: ${prompt.description}`);
      console.log(`  Deeplink: ${deeplink}`);
    });
  });
}

// Example usage
function exampleUsage() {
  // Generate a single deeplink
  const webDeeplink = generateWebPromptDeeplink("Create a React component for user authentication");
  console.log("Web deeplink:", webDeeplink);
  
  const desktopDeeplink = generateDesktopPromptDeeplink("Create a React component for user authentication");
  console.log("Desktop deeplink:", desktopDeeplink);
  
  // Generate deeplink for specific prompt
  const apiDeeplink = generatePromptDeeplinks("create_api_endpoint", true);
  console.log("API endpoint deeplink:", apiDeeplink);
  
  // Get all deeplinks
  const allDeeplinks = generateAllPromptDeeplinks(true);
  console.log("All web deeplinks:", allDeeplinks);
  
  // Print categorized prompts
  printAllPrompts(true);
}

// Export for use in other modules
module.exports = {
  generateDesktopPromptDeeplink,
  generateWebPromptDeeplink,
  generatePromptDeeplinks,
  generateAllPromptDeeplinks,
  getPromptsByCategory,
  getPromptsByComplexity,
  printAllPrompts,
  DEALERSHIP_AI_PROMPTS,
  exampleUsage
};

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage();
}
