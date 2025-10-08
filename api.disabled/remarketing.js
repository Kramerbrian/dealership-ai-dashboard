/**
 * Remarketing API for DealershipAI
 * Handles user tracking, segmentation, and data export for marketing campaigns
 */

class RemarketingAPI {
    constructor() {
        this.users = new Map();
        this.events = [];
        this.segments = new Map();
        this.initializeStorage();
    }

    initializeStorage() {
        // Load existing data from storage
        try {
            const storedUsers = localStorage.getItem('remarketing_users');
            if (storedUsers) {
                this.users = new Map(JSON.parse(storedUsers));
            }

            const storedEvents = localStorage.getItem('remarketing_events');
            if (storedEvents) {
                this.events = JSON.parse(storedEvents);
            }
        } catch (error) {
            console.error('Failed to load remarketing data:', error);
        }
    }

    // Track user identification
    async trackUser(userData) {
        const enrichedData = {
            ...userData,
            firstSeen: this.users.get(userData.userId)?.firstSeen || new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            sessionCount: (this.users.get(userData.userId)?.sessionCount || 0) + 1,
            totalEngagementTime: this.users.get(userData.userId)?.totalEngagementTime || 0
        };

        this.users.set(userData.userId, enrichedData);
        this.saveToStorage();

        // Create/update user segments
        await this.updateUserSegments(userData.userId);

        return {
            success: true,
            userId: userData.userId,
            segments: this.getUserSegments(userData.userId)
        };
    }

    // Track user events
    async trackEvent(eventData) {
        const event = {
            ...eventData,
            id: this.generateEventId(),
            timestamp: eventData.timestamp || new Date().toISOString()
        };

        this.events.push(event);

        // Keep only last 10000 events to prevent memory issues
        if (this.events.length > 10000) {
            this.events = this.events.slice(-10000);
        }

        this.saveToStorage();

        // Update user engagement metrics
        if (event.userId) {
            await this.updateUserEngagement(event.userId, event);
        }

        return { success: true, eventId: event.id };
    }

    // Update user segments based on behavior
    async updateUserSegments(userId) {
        const user = this.users.get(userId);
        if (!user) return;

        const userEvents = this.events.filter(e => e.userId === userId);
        const segments = [];

        // Basic segments
        segments.push('level1_users');
        segments.push('authenticated_users');

        // Engagement segments
        const sessionCount = user.sessionCount;
        if (sessionCount === 1) segments.push('first_time_visitors');
        if (sessionCount >= 5) segments.push('regular_users');
        if (sessionCount >= 20) segments.push('power_users');

        // Time-based segments
        const daysSinceFirstSeen = Math.floor(
            (Date.now() - new Date(user.firstSeen).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceFirstSeen <= 1) segments.push('new_signups_24h');
        if (daysSinceFirstSeen <= 7) segments.push('new_signups_7d');
        if (daysSinceFirstSeen <= 30) segments.push('new_signups_30d');

        // Activity segments
        const lastSeenDays = Math.floor(
            (Date.now() - new Date(user.lastSeen).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (lastSeenDays <= 1) segments.push('active_today');
        if (lastSeenDays <= 7) segments.push('active_week');
        if (lastSeenDays > 7 && lastSeenDays <= 30) segments.push('inactive_users');
        if (lastSeenDays > 30) segments.push('churned_users');

        // Feature usage segments
        const featureEvents = userEvents.filter(e => e.event === 'feature_usage');
        const uniqueFeatures = [...new Set(featureEvents.map(e => e.feature))];

        if (uniqueFeatures.length >= 3) segments.push('feature_explorers');
        if (uniqueFeatures.includes('dashboard')) segments.push('dashboard_users');
        if (uniqueFeatures.includes('settings')) segments.push('settings_users');

        // Store segments
        this.segments.set(userId, segments);
        this.saveToStorage();

        return segments;
    }

    // Update user engagement metrics
    async updateUserEngagement(userId, event) {
        const user = this.users.get(userId);
        if (!user) return;

        // Update engagement time for session events
        if (event.event === 'session_end' && event.duration) {
            user.totalEngagementTime = (user.totalEngagementTime || 0) + event.duration;
        }

        // Update last activity
        user.lastSeen = event.timestamp;

        this.users.set(userId, user);
        this.saveToStorage();
    }

    // Get user segments
    getUserSegments(userId) {
        return this.segments.get(userId) || [];
    }

    // Export users for remarketing campaigns
    async exportUsers(filters = {}) {
        const users = Array.from(this.users.values());
        let filteredUsers = users;

        // Apply filters
        if (filters.segment) {
            filteredUsers = users.filter(user =>
                this.getUserSegments(user.userId).includes(filters.segment)
            );
        }

        if (filters.dateRange) {
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);

            filteredUsers = filteredUsers.filter(user => {
                const userDate = new Date(user.firstSeen);
                return userDate >= startDate && userDate <= endDate;
            });
        }

        if (filters.minSessions) {
            filteredUsers = filteredUsers.filter(user =>
                user.sessionCount >= filters.minSessions
            );
        }

        // Format for export
        return filteredUsers.map(user => ({
            userId: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            firstSeen: user.firstSeen,
            lastSeen: user.lastSeen,
            sessionCount: user.sessionCount,
            totalEngagementTime: user.totalEngagementTime,
            segments: this.getUserSegments(user.userId),
            userTier: user.userTier
        }));
    }

    // Generate remarketing audiences for different platforms
    async generateRemarketingAudiences() {
        const audiences = {
            google_ads: {},
            facebook: {},
            linkedin: {}
        };

        // Google Ads audiences
        audiences.google_ads = {
            new_signups: await this.exportUsers({ segment: 'new_signups_7d' }),
            active_users: await this.exportUsers({ segment: 'active_week' }),
            power_users: await this.exportUsers({ segment: 'power_users' }),
            churned_users: await this.exportUsers({ segment: 'churned_users' })
        };

        // Facebook Custom Audiences
        audiences.facebook = {
            level1_users: (await this.exportUsers({ segment: 'level1_users' }))
                .map(user => ({ email: user.email, user_id: user.userId })),
            feature_explorers: (await this.exportUsers({ segment: 'feature_explorers' }))
                .map(user => ({ email: user.email, user_id: user.userId }))
        };

        // LinkedIn audiences (email-based)
        audiences.linkedin = {
            business_users: (await this.exportUsers())
                .filter(user => user.email && user.email.includes('@'))
                .map(user => user.email)
        };

        return audiences;
    }

    // Get analytics dashboard data
    async getAnalytics(dateRange = {}) {
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();

        const filteredEvents = this.events.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= startDate && eventDate <= endDate;
        });

        const analytics = {
            totalUsers: this.users.size,
            totalEvents: filteredEvents.length,
            uniqueActiveUsers: new Set(filteredEvents.map(e => e.userId)).size,
            segmentBreakdown: {},
            topEvents: {},
            userGrowth: []
        };

        // Segment breakdown
        const allSegments = Array.from(this.segments.values()).flat();
        analytics.segmentBreakdown = allSegments.reduce((acc, segment) => {
            acc[segment] = (acc[segment] || 0) + 1;
            return acc;
        }, {});

        // Top events
        analytics.topEvents = filteredEvents.reduce((acc, event) => {
            acc[event.event] = (acc[event.event] || 0) + 1;
            return acc;
        }, {});

        // User growth (daily)
        const usersByDay = {};
        Array.from(this.users.values()).forEach(user => {
            const day = user.firstSeen.split('T')[0];
            usersByDay[day] = (usersByDay[day] || 0) + 1;
        });

        analytics.userGrowth = Object.entries(usersByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));

        return analytics;
    }

    // Save data to storage
    saveToStorage() {
        try {
            localStorage.setItem('remarketing_users', JSON.stringify(Array.from(this.users.entries())));
            localStorage.setItem('remarketing_events', JSON.stringify(this.events));
            localStorage.setItem('remarketing_segments', JSON.stringify(Array.from(this.segments.entries())));
        } catch (error) {
            console.error('Failed to save remarketing data:', error);
        }
    }

    // Generate unique event ID
    generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// API endpoints
const remarketingAPI = new RemarketingAPI();

// Simulate HTTP endpoints for the browser environment
window.remarketingAPI = {
    track: async (userData) => {
        return await remarketingAPI.trackUser(userData);
    },

    trackEvent: async (eventData) => {
        return await remarketingAPI.trackEvent(eventData);
    },

    export: async (filters) => {
        return await remarketingAPI.exportUsers(filters);
    },

    audiences: async () => {
        return await remarketingAPI.generateRemarketingAudiences();
    },

    analytics: async (dateRange) => {
        return await remarketingAPI.getAnalytics(dateRange);
    }
};

export { remarketingAPI, RemarketingAPI };