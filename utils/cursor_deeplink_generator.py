from urllib.parse import urlencode, urlparse, urlunparse

def generate_prompt_deeplink(prompt_text: str) -> str:
    """
    Generate a Cursor deeplink for a given prompt text.
    
    Args:
        prompt_text (str): The prompt text to encode
        
    Returns:
        str: The complete deeplink URL
    """
    base_url = "cursor://anysphere.cursor-deeplink/prompt"
    params = {"text": prompt_text}
    query_string = urlencode(params)
    return f"{base_url}?{query_string}"

def generate_dealership_ai_prompts():
    """
    Generate common DealershipAI development prompts as deeplinks.
    
    Returns:
        dict: Dictionary of prompt names and their deeplinks
    """
    prompts = {
        "create_api_endpoint": "Create a new API endpoint for the DealershipAI system with proper error handling, authentication, and TypeScript types",
        
        "add_authentication": "Add Clerk authentication to a React component with role-based access control and proper error handling",
        
        "create_dashboard_component": "Create a React dashboard component for the DealershipAI intelligence system with real-time data, charts, and responsive design",
        
        "optimize_performance": "Optimize the performance of a Next.js API route with caching, rate limiting, and database query optimization",
        
        "add_monitoring": "Add comprehensive monitoring and alerting to an API endpoint with health checks, metrics collection, and error tracking",
        
        "create_documentation": "Create comprehensive documentation for a DealershipAI feature including usage examples, API reference, and integration guides",
        
        "implement_ml_pipeline": "Implement a machine learning pipeline for the DealershipAI system with data preprocessing, model training, and prediction endpoints",
        
        "add_compliance_monitoring": "Add Google Ads policy compliance monitoring with automated audits, violation detection, and reporting",
        
        "create_calculator_component": "Create an interactive ROI calculator component for DealershipAI with form validation, calculations, and results display",
        
        "implement_real_time_updates": "Implement real-time updates for the DealershipAI dashboard using WebSockets or Server-Sent Events"
    }
    
    deeplinks = {}
    for name, prompt in prompts.items():
        deeplinks[name] = generate_prompt_deeplink(prompt)
    
    return deeplinks

def generate_feature_specific_prompts():
    """
    Generate prompts for specific DealershipAI features.
    
    Returns:
        dict: Dictionary of feature-specific prompts
    """
    feature_prompts = {
        "hyper_intelligence": "Implement the hyper-intelligence system for DealershipAI with bandit auto-healing, inventory freshness scoring, and retail readiness analytics",
        
        "predictive_analytics": "Create predictive analytics endpoints for DealershipAI with ML-driven pricing optimization, demand forecasting, and risk assessment",
        
        "competitor_intelligence": "Implement competitor intelligence features for DealershipAI with market analysis, pricing intelligence, and strategic recommendations",
        
        "customer_behavior": "Add customer behavior analysis to DealershipAI with AI-powered segmentation, purchase intent prediction, and engagement optimization",
        
        "market_trends": "Implement market trends analysis for DealershipAI with real-time trend analysis, demand indicators, and actionable insights",
        
        "compliance_monitoring": "Add Google Ads policy compliance monitoring to DealershipAI with automated audits, violation detection, and reporting",
        
        "performance_monitoring": "Implement comprehensive performance monitoring for DealershipAI with real-time metrics, alerting, and optimization recommendations",
        
        "integration_guide": "Create integration guides for DealershipAI with DMS, CRM, and marketing platforms including code examples and best practices"
    }
    
    deeplinks = {}
    for name, prompt in feature_prompts.items():
        deeplinks[name] = generate_prompt_deeplink(prompt)
    
    return deeplinks

def print_all_prompts():
    """Print all available prompts with their deeplinks."""
    print("🚀 DealershipAI Cursor Deeplink Generator")
    print("=" * 50)
    
    print("\n📊 Common Development Prompts:")
    common_prompts = generate_dealership_ai_prompts()
    for name, deeplink in common_prompts.items():
        print(f"\n{name}:")
        print(f"  {deeplink}")
    
    print("\n🎯 Feature-Specific Prompts:")
    feature_prompts = generate_feature_specific_prompts()
    for name, deeplink in feature_prompts.items():
        print(f"\n{name}:")
        print(f"  {deeplink}")

if __name__ == "__main__":
    # Example usage
    deeplink = generate_prompt_deeplink("Create a React component for user authentication")
    print(f"Example deeplink: {deeplink}")
    
    print("\n" + "=" * 50)
    print_all_prompts()
