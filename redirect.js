// DealershipAI Dashboard Redirect Script
// This script ensures users go directly to the main dashboard

(function() {
    'use strict';
    
    // Check if we're on the main dashboard page
    const isMainDashboard = window.location.pathname.includes('dealership-ai-dashboard.html');
    
    if (!isMainDashboard) {
        // Redirect to main dashboard
        console.log('🔄 Redirecting to DealershipAI Dashboard...');
        window.location.replace('dealership-ai-dashboard.html');
    }
    
    // Optional: Add analytics tracking for redirects
    if (typeof gtag !== 'undefined') {
        gtag('event', 'dashboard_redirect', {
            'event_category': 'navigation',
            'event_label': 'auto_redirect'
        });
    }
})();
