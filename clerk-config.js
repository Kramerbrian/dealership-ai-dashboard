/**
 * Clerk Authentication Configuration for DealershipAI
 * Provides SSO, user tracking, and remarketing capabilities
 */

// Initialize Clerk - Use same keys as marketing site for SSO
const CLERK_PUBLISHABLE_KEY = 'pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ';
const CLERK_SECRET_KEY = 'sk_test_aXozRdS428MaeiDX9IYcYSnEnoxjgF4ROdDDMCF9JP';

// Satellite domain configuration
const CLERK_CONFIG = {
    isSatellite: true,
    domain: 'dash.dealershipai.com',
    signInUrl: 'https://marketing.dealershipai.com/sign-in',
    signUpUrl: 'https://marketing.dealershipai.com/sign-up'
};

class ClerkAuthManager {
    constructor() {
        this.clerk = null;
        this.currentUser = null;
        this.userTracker = new UserTracker();
        this.initializeClerk();
    }

    async initializeClerk() {
        try {
            // Load Clerk script dynamically
            await this.loadClerkScript();

            this.clerk = window.Clerk;

            // Initialize as satellite domain
            await this.clerk.load({
                publishableKey: CLERK_PUBLISHABLE_KEY,
                isSatellite: CLERK_CONFIG.isSatellite,
                domain: CLERK_CONFIG.domain,
                signInUrl: CLERK_CONFIG.signInUrl,
                signUpUrl: CLERK_CONFIG.signUpUrl
            });

            // Set up user tracking
            this.setupUserTracking();

            console.log('Clerk initialized successfully as satellite domain');
        } catch (error) {
            console.error('Failed to initialize Clerk:', error);
            // Fallback to existing auth system
            this.fallbackToExistingAuth();
        }
    }

    loadClerkScript() {
        return new Promise((resolve, reject) => {
            if (window.Clerk) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.clerk.dev/v4/clerk.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    setupUserTracking() {
        if (!this.clerk) return;

        // Track user sign-ins
        this.clerk.addListener('user', (user) => {
            if (user) {
                this.currentUser = user;
                this.userTracker.trackSignIn(user);
                this.identifyLevel1User(user);
            }
        });

        // Track session changes
        this.clerk.addListener('session', (session) => {
            if (session) {
                this.userTracker.trackSessionStart(session);
            } else {
                this.userTracker.trackSessionEnd();
            }
        });
    }

    identifyLevel1User(user) {
        const level1Data = {
            userId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
            profileImageUrl: user.profileImageUrl,
            // Custom metadata for remarketing
            userTier: 'level1',
            signUpSource: 'dealershipai_dashboard',
            lastActiveAt: new Date().toISOString()
        };

        // Store for remarketing
        this.userTracker.identifyUser(level1Data);

        // Send to external systems (Google Analytics, Facebook Pixel, etc.)
        this.sendToRemarketingPlatforms(level1Data);
    }

    async sendToRemarketingPlatforms(userData) {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('config', 'GA_TRACKING_ID', {
                user_id: userData.userId,
                custom_map: {
                    'user_tier': 'level1',
                    'sign_up_source': 'dealershipai_dashboard'
                }
            });

            window.gtag('event', 'login', {
                method: 'sso',
                user_tier: 'level1'
            });
        }

        // Facebook Pixel
        if (window.fbq) {
            window.fbq('track', 'CompleteRegistration', {
                content_name: 'DealershipAI Level 1 Access',
                content_category: 'Authentication',
                value: 0,
                currency: 'USD'
            });
        }

        // Custom remarketing API
        try {
            await fetch('/api/remarketing/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } catch (error) {
            console.error('Failed to send remarketing data:', error);
        }
    }

    async signIn() {
        if (!this.clerk) {
            this.fallbackToExistingAuth();
            return;
        }

        try {
            await this.clerk.openSignIn();
        } catch (error) {
            console.error('Sign in failed:', error);
        }
    }

    async signUp() {
        if (!this.clerk) {
            this.fallbackToExistingAuth();
            return;
        }

        try {
            await this.clerk.openSignUp();
        } catch (error) {
            console.error('Sign up failed:', error);
        }
    }

    async signOut() {
        if (this.clerk && this.clerk.user) {
            this.userTracker.trackSignOut(this.clerk.user);
            await this.clerk.signOut();
        }
        this.currentUser = null;
    }

    isSignedIn() {
        return this.clerk?.user !== null;
    }

    getUser() {
        return this.clerk?.user || null;
    }

    fallbackToExistingAuth() {
        console.log('Using existing authentication system');
        // Load your existing auth.js as fallback
        if (window.checkAuth) {
            window.checkAuth();
        }
    }
}

// User Tracking Class for Remarketing
class UserTracker {
    constructor() {
        this.sessionData = {};
        this.eventQueue = [];
    }

    identifyUser(userData) {
        // Store user data for remarketing
        localStorage.setItem('dealership_user_profile', JSON.stringify(userData));

        // Create remarketing audience segments
        this.createUserSegments(userData);

        console.log('Level 1 user identified:', userData);
    }

    trackSignIn(user) {
        const signInData = {
            event: 'user_sign_in',
            userId: user.id,
            timestamp: new Date().toISOString(),
            method: 'sso',
            userTier: 'level1'
        };

        this.trackEvent(signInData);
    }

    trackSessionStart(session) {
        this.sessionData = {
            sessionId: session.id,
            startTime: new Date().toISOString(),
            userId: session.userId
        };

        this.trackEvent({
            event: 'session_start',
            ...this.sessionData
        });
    }

    trackSessionEnd() {
        if (this.sessionData.startTime) {
            const duration = Date.now() - new Date(this.sessionData.startTime).getTime();

            this.trackEvent({
                event: 'session_end',
                sessionId: this.sessionData.sessionId,
                userId: this.sessionData.userId,
                duration: Math.floor(duration / 1000) // in seconds
            });
        }
    }

    trackSignOut(user) {
        this.trackEvent({
            event: 'user_sign_out',
            userId: user.id,
            timestamp: new Date().toISOString()
        });
    }

    trackPageView(page) {
        this.trackEvent({
            event: 'page_view',
            page: page,
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId()
        });
    }

    trackFeatureUsage(feature) {
        this.trackEvent({
            event: 'feature_usage',
            feature: feature,
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId()
        });
    }

    trackEvent(eventData) {
        // Store locally
        const events = JSON.parse(localStorage.getItem('user_events') || '[]');
        events.push(eventData);
        localStorage.setItem('user_events', JSON.stringify(events.slice(-100))); // Keep last 100 events

        // Send to analytics
        this.sendToAnalytics(eventData);
    }

    async sendToAnalytics(eventData) {
        // Google Analytics 4
        if (window.gtag) {
            window.gtag('event', eventData.event, {
                user_id: eventData.userId,
                timestamp_micros: new Date(eventData.timestamp).getTime() * 1000
            });
        }

        // Send to your backend for processing
        try {
            await fetch('/api/analytics/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    }

    createUserSegments(userData) {
        const segments = [];

        // Basic segmentation
        segments.push('level1_users');
        segments.push('sso_users');

        // Time-based segments
        const signUpDate = new Date(userData.createdAt);
        const daysSinceSignUp = Math.floor((Date.now() - signUpDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceSignUp <= 1) segments.push('new_users');
        if (daysSinceSignUp <= 7) segments.push('recent_signups');
        if (daysSinceSignUp > 30) segments.push('inactive_users');

        // Store segments for remarketing
        localStorage.setItem('user_segments', JSON.stringify(segments));

        return segments;
    }

    getCurrentUserId() {
        const profile = JSON.parse(localStorage.getItem('dealership_user_profile') || '{}');
        return profile.userId || null;
    }
}

// Initialize the auth manager
const clerkAuthManager = new ClerkAuthManager();

// Export for global access
window.clerkAuthManager = clerkAuthManager;

// Auto-track page views
window.addEventListener('load', () => {
    clerkAuthManager.userTracker.trackPageView(window.location.pathname);
});

// Track page changes for SPAs
let currentPath = window.location.pathname;
setInterval(() => {
    if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        clerkAuthManager.userTracker.trackPageView(currentPath);
    }
}, 1000);

export { clerkAuthManager, ClerkAuthManager, UserTracker };