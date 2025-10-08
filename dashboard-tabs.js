/**
 * DealershipAI Dashboard Tab Content Generator
 * Populates all tabs with real data and functionality
 */

class DashboardTabs {
    constructor(apiService) {
        this.api = apiService;
        this.data = null;
    }

    async initialize() {
        this.data = await this.api.refreshData();
        this.populateAllTabs();
        this.startRealTimeUpdates();
    }

    // AI Health Tab Content
    generateAIHealthTab() {
        return `
            <section class="section">
                <h1 class="section-header">AI Health Dashboard</h1>
                <p class="section-subheader">Comprehensive analysis of AI platform performance and optimization</p>

                <!-- AI Health Score -->
                <div class="health-score">
                    <div class="health-value" style="color: var(--apple-orange);">73.2</div>
                    <div class="health-label">Overall AI Health Score</div>
                    <div class="health-progress">
                        <div class="health-bar" style="width: 73.2%; background: var(--apple-orange)"></div>
                    </div>
                </div>

                <!-- AI Platform Performance -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Citation Performance</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            ${Object.entries(this.data.aiCitations).map(([platform, data]) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                    <div>
                                        <div style="font-size: 14px; font-weight: 500; text-transform: capitalize;">${platform}</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">${data.citations} citations</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                                        <div style="font-size: 16px; font-weight: 600; color: ${data.change > 0 ? 'var(--apple-green)' : 'var(--apple-red)'};">${data.score}</div>
                                        <div style="font-size: 11px; color: ${data.change > 0 ? 'var(--apple-green)' : 'var(--apple-red)'};">${data.change > 0 ? '↗' : '↘'}${Math.abs(data.change)}%</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Optimization Recommendations</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-red);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Critical: Gemini Citations</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Only 12 citations detected. Optimize content structure for better AI understanding.</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Important: Schema Enhancement</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Add AutoDealer and FAQ schema to improve AI platform understanding.</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-green);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Opportunity: Content Expansion</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Create more Q&A content to capture voice search queries.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Training Progress -->
                <div class="apple-grid grid-3">
                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(0, 122, 255, 0.1); color: var(--apple-blue);">🧠</div>
                            <div class="metric-badge">Training</div>
                        </div>
                        <div class="metric-label">Content Optimization</div>
                        <div class="metric-value">67%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 67%"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Improving</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 149, 0, 0.1); color: var(--apple-orange);">📚</div>
                            <div class="metric-badge">Knowledge</div>
                        </div>
                        <div class="metric-label">Data Accuracy</div>
                        <div class="metric-value">94%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 94%; background: var(--apple-orange)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Stable</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">🎯</div>
                            <div class="metric-badge">Response</div>
                        </div>
                        <div class="metric-label">Relevance Score</div>
                        <div class="metric-value">81%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 81%; background: var(--apple-green)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Growing</div>
                    </div>
                </div>
            </section>
        `;
    }

    // Website Tab Content
    generateWebsiteTab() {
        const website = this.data.website;
        return `
            <section class="section">
                <h1 class="section-header">Website Performance</h1>
                <p class="section-subheader">Technical health, speed, and SEO optimization metrics</p>

                <!-- Core Web Vitals -->
                <div class="apple-grid grid-4" style="margin-bottom: var(--space-16);">
                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">⚡</div>
                            <div class="metric-badge">Performance</div>
                        </div>
                        <div class="metric-label">Performance Score</div>
                        <div class="metric-value">${website.performance}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${website.performance}%; background: var(--apple-green)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Excellent</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(0, 122, 255, 0.1); color: var(--apple-blue);">♿</div>
                            <div class="metric-badge">A11Y</div>
                        </div>
                        <div class="metric-label">Accessibility</div>
                        <div class="metric-value">${website.accessibility}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${website.accessibility}%"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Strong</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 149, 0, 0.1); color: var(--apple-orange);">🛡️</div>
                            <div class="metric-badge">Security</div>
                        </div>
                        <div class="metric-label">Best Practices</div>
                        <div class="metric-value">${website.bestPractices}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${website.bestPractices}%; background: var(--apple-orange)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Good</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(175, 82, 222, 0.1); color: var(--apple-purple);">🔍</div>
                            <div class="metric-badge">Technical</div>
                        </div>
                        <div class="metric-label">SEO Score</div>
                        <div class="metric-value">${website.seo}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${website.seo}%; background: var(--apple-purple)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Excellent</div>
                    </div>
                </div>

                <!-- Core Web Vitals Detail -->
                <div class="apple-grid grid-3" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8); text-align: center;">
                        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">Largest Contentful Paint</h3>
                        <div style="font-size: 32px; font-weight: 700; color: var(--apple-green); margin-bottom: var(--space-2);">${website.coreWebVitals.lcp}s</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Good (< 2.5s)</div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8); text-align: center;">
                        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">First Input Delay</h3>
                        <div style="font-size: 32px; font-weight: 700; color: var(--apple-green); margin-bottom: var(--space-2);">${website.coreWebVitals.fid}ms</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Good (< 100ms)</div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8); text-align: center;">
                        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">Cumulative Layout Shift</h3>
                        <div style="font-size: 32px; font-weight: 700; color: var(--apple-green); margin-bottom: var(--space-2);">${website.coreWebVitals.cls}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">Excellent (< 0.1)</div>
                    </div>
                </div>

                <!-- Issues & Recommendations -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Issues & Recommendations</h3>
                    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                        ${website.issues.map(issue => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: ${issue.type === 'error' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 149, 0, 0.1)'}; border-radius: var(--radius); border-left: 3px solid ${issue.type === 'error' ? 'var(--apple-red)' : 'var(--apple-orange)'};">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500; color: var(--text-primary);">${issue.message}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary); text-transform: uppercase;">${issue.type}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 12px; font-weight: 600; color: ${issue.type === 'error' ? 'var(--apple-red)' : 'var(--apple-orange)'};">${issue.count} ${issue.count === 1 ? 'issue' : 'issues'}</div>
                                    <button class="apple-btn btn-ghost" style="font-size: 11px; padding: var(--space-2) var(--space-3);">Fix</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // Reviews Tab Content
    generateReviewsTab() {
        const reviews = this.data.reviews;
        return `
            <section class="section">
                <h1 class="section-header">Review Management</h1>
                <p class="section-subheader">Monitor and manage customer reviews across all platforms</p>

                <!-- Review Overview -->
                <div class="apple-grid grid-4" style="margin-bottom: var(--space-16);">
                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 204, 0, 0.1); color: var(--apple-yellow);">⭐</div>
                            <div class="metric-badge">Overall</div>
                        </div>
                        <div class="metric-label">Average Rating</div>
                        <div class="metric-value">${reviews.overall.rating}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(reviews.overall.rating / 5) * 100}%; background: var(--apple-yellow)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">${reviews.overall.total} reviews</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">😊</div>
                            <div class="metric-badge">Sentiment</div>
                        </div>
                        <div class="metric-label">Positive Sentiment</div>
                        <div class="metric-value">${Math.round(reviews.sentiment.positive * 100)}%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${reviews.sentiment.positive * 100}%; background: var(--apple-green)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Excellent</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(0, 122, 255, 0.1); color: var(--apple-blue);">📈</div>
                            <div class="metric-badge">Growth</div>
                        </div>
                        <div class="metric-label">Monthly Growth</div>
                        <div class="metric-value">+12</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Strong growth</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 149, 0, 0.1); color: var(--apple-orange);">⏱️</div>
                            <div class="metric-badge">Response</div>
                        </div>
                        <div class="metric-label">Avg Response Time</div>
                        <div class="metric-value">2.4h</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 92%; background: var(--apple-orange)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Fast response</div>
                    </div>
                </div>

                <!-- Platform Breakdown -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Platform Performance</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            ${Object.entries(reviews.platforms).map(([platform, data]) => `
                                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                                        <div style="font-size: 16px;">${platform === 'google' ? '🔍' : platform === 'yelp' ? '🌟' : platform === 'facebook' ? '📘' : '🚗'}</div>
                                        <div>
                                            <div style="font-size: 14px; font-weight: 500; text-transform: capitalize;">${platform}</div>
                                            <div style="font-size: 12px; color: var(--text-secondary);">${data.count} reviews</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                                        <div style="font-size: 16px; font-weight: 600; color: var(--apple-green);">${data.rating}</div>
                                        <div style="font-size: 12px;">⭐</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Rating Distribution</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                            ${Object.entries(reviews.overall.distribution).reverse().map(([stars, count]) => `
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 12px; width: 20px;">${stars}★</div>
                                    <div style="flex: 1; height: 8px; background: var(--gray-200); border-radius: var(--radius-full); overflow: hidden;">
                                        <div style="height: 100%; width: ${(count / reviews.overall.total) * 100}%; background: var(--apple-yellow); border-radius: var(--radius-full);"></div>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary); width: 30px; text-align: right;">${count}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Recent Reviews -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6);">
                        <h3 style="font-size: 18px; font-weight: 600;">Recent Reviews</h3>
                        <button class="apple-btn btn-ghost">View All</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                        ${this.data.gmb.recentReviews.map(review => `
                            <div style="padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius); border-left: 3px solid ${review.rating >= 4 ? 'var(--apple-green)' : 'var(--apple-orange)'};">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                                        <div style="font-size: 14px;">⭐</div>
                                        <div style="font-size: 14px; font-weight: 600;">${review.rating}/5 Rating</div>
                                    </div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${new Date(review.date).toLocaleDateString()}</div>
                                </div>
                                <div style="font-size: 13px; color: var(--text-primary); line-height: 1.5;">"${review.text}"</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    }

    // Schema Tab Content
    generateSchemaTab() {
        return `
            <section class="section">
                <h1 class="section-header">Schema Optimization</h1>
                <p class="section-subheader">Structured data markup for enhanced AI platform understanding</p>

                <!-- Schema Health Score -->
                <div class="health-score">
                    <div class="health-value" style="color: var(--apple-orange);">78.4</div>
                    <div class="health-label">Schema Optimization Score</div>
                    <div class="health-progress">
                        <div class="health-bar" style="width: 78.4%; background: var(--apple-orange)"></div>
                    </div>
                </div>

                <!-- Schema Types Status -->
                <div class="apple-grid grid-3" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-6); border-left: 3px solid var(--apple-green);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                            <div style="font-size: 16px;">🏢</div>
                            <div style="width: 12px; height: 12px; background: var(--apple-green); border-radius: 50%;"></div>
                        </div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-2);">AutoDealer</div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-3);">Main business schema active</div>
                        <div style="font-size: 12px; color: var(--apple-green); font-weight: 500;">✓ Implemented</div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-6); border-left: 3px solid var(--apple-orange);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                            <div style="font-size: 16px;">🚗</div>
                            <div style="width: 12px; height: 12px; background: var(--apple-orange); border-radius: 50%;"></div>
                        </div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-2);">Vehicle</div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-3);">3 pages missing schema</div>
                        <div style="font-size: 12px; color: var(--apple-orange); font-weight: 500;">⚠ Partial</div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-6); border-left: 3px solid var(--apple-red);">
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                            <div style="font-size: 16px;">❓</div>
                            <div style="width: 12px; height: 12px; background: var(--apple-red); border-radius: 50%;"></div>
                        </div>
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-2);">FAQ</div>
                        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-3);">Not implemented</div>
                        <div style="font-size: 12px; color: var(--apple-red); font-weight: 500;">✗ Missing</div>
                    </div>
                </div>

                <!-- Schema Implementation Details -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Active Schema Types</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="font-size: 14px; font-weight: 500; margin-bottom: var(--space-1);">Organization</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Basic business information, contact details, social profiles</div>
                            </div>
                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="font-size: 14px; font-weight: 500; margin-bottom: var(--space-1);">LocalBusiness</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Location, hours, service areas, reviews</div>
                            </div>
                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="font-size: 14px; font-weight: 500; margin-bottom: var(--space-1);">Product</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Vehicle listings, pricing, availability</div>
                            </div>
                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="font-size: 14px; font-weight: 500; margin-bottom: var(--space-1);">Review</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Customer reviews and ratings</div>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Recommended Additions</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-red);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">High Priority: FAQ Schema</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Add FAQ schema to service pages for voice search optimization</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Medium Priority: Event Schema</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Mark up sales events and promotions for better visibility</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-green);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Enhancement: Service Schema</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Detailed service offerings with pricing and scheduling</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Schema Validation Tools -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Schema Validation & Tools</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
                        <button class="apple-btn btn-primary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">🔍</div>
                            <div>Validate Current Schema</div>
                        </button>
                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">➕</div>
                            <div>Add FAQ Schema</div>
                        </button>
                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">🚗</div>
                            <div>Fix Vehicle Pages</div>
                        </button>
                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">📊</div>
                            <div>Generate Report</div>
                        </button>
                    </div>
                </div>
            </section>
        `;
    }

    // Mystery Shop Tab Content
    generateMysteryShopTab() {
        return `
            <section class="section">
                <h1 class="section-header">Mystery Shopping</h1>
                <p class="section-subheader">Customer experience evaluation and competitive analysis</p>

                <!-- Mystery Shop Score -->
                <div class="health-score">
                    <div class="health-value" style="color: var(--apple-purple);">78.2</div>
                    <div class="health-label">Customer Experience Score</div>
                    <div class="health-progress">
                        <div class="health-bar" style="width: 78.2%; background: var(--apple-purple)"></div>
                    </div>
                </div>

                <!-- Experience Categories -->
                <div class="apple-grid grid-4" style="margin-bottom: var(--space-16);">
                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">📞</div>
                            <div class="metric-badge">Phone</div>
                        </div>
                        <div class="metric-label">Phone Experience</div>
                        <div class="metric-value">92</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 92%; background: var(--apple-green)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Excellent</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(0, 122, 255, 0.1); color: var(--apple-blue);">🌐</div>
                            <div class="metric-badge">Web</div>
                        </div>
                        <div class="metric-label">Website Experience</div>
                        <div class="metric-value">84</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 84%"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Good</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 149, 0, 0.1); color: var(--apple-orange);">🏢</div>
                            <div class="metric-badge">In-Person</div>
                        </div>
                        <div class="metric-label">Showroom Visit</div>
                        <div class="metric-value">76</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 76%; background: var(--apple-orange)"></div>
                            </div>
                        </div>
                        <div class="metric-change">Needs improvement</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(175, 82, 222, 0.1); color: var(--apple-purple);">🚗</div>
                            <div class="metric-badge">Service</div>
                        </div>
                        <div class="metric-label">Service Department</div>
                        <div class="metric-value">88</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 88%; background: var(--apple-purple)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">Strong</div>
                    </div>
                </div>

                <!-- Latest Mystery Shop Results -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Latest Assessment</h3>
                        <div style="display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6);">
                            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--apple-purple), rgba(175, 82, 222, 0.8)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 18px;">78</div>
                            <div>
                                <div style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-1);">Overall Score</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Conducted: January 8, 2025</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">Evaluator: Sarah Johnson</div>
                            </div>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="font-size: 13px;">First Impression</div>
                                <div style="display: flex; align-items: center; gap: var(--space-1);">
                                    <div style="font-size: 13px; font-weight: 600;">85</div>
                                    <div style="color: var(--apple-green);">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="font-size: 13px;">Staff Knowledge</div>
                                <div style="display: flex; align-items: center; gap: var(--space-1);">
                                    <div style="font-size: 13px; font-weight: 600;">92</div>
                                    <div style="color: var(--apple-green);">⭐⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="font-size: 13px;">Response Time</div>
                                <div style="display: flex; align-items: center; gap: var(--space-1);">
                                    <div style="font-size: 13px; font-weight: 600;">71</div>
                                    <div style="color: var(--apple-orange);">⭐⭐⭐⭐</div>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div style="font-size: 13px;">Follow-up</div>
                                <div style="display: flex; align-items: center; gap: var(--space-1);">
                                    <div style="font-size: 13px; font-weight: 600;">68</div>
                                    <div style="color: var(--apple-orange);">⭐⭐⭐</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Key Findings</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-green);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">✓ Strengths</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Knowledgeable staff, clean facilities, comprehensive vehicle information</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">⚠ Areas for Improvement</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Follow-up communication, initial response time, appointment scheduling</div>
                            </div>
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-blue);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">📊 Recommendations</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Implement automated follow-up system, reduce initial response time to under 2 minutes</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Competitor Comparison -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Competitive Analysis</h3>
                    <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius);">
                            <div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Your Dealership</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Current performance</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: var(--space-3);">
                                <div style="font-size: 16px; font-weight: 700; color: var(--apple-green);">78</div>
                                <div style="color: var(--apple-green);">🏆</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius);">
                            <div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Terry Reid Hyundai</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Local competitor</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: var(--space-3);">
                                <div style="font-size: 16px; font-weight: 700; color: var(--text-secondary);">74</div>
                                <div>📍</div>
                            </div>
                        </div>

                        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius);">
                            <div>
                                <div style="font-size: 14px; font-weight: 600; color: var(--text-primary);">Crown Honda</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Regional competitor</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: var(--space-3);">
                                <div style="font-size: 16px; font-weight: 700; color: var(--text-secondary);">71</div>
                                <div>📍</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Predictive Tab Content
    generatePredictiveTab() {
        return `
            <section class="section">
                <h1 class="section-header">Predictive Analytics</h1>
                <p class="section-subheader">AI-powered forecasting and opportunity identification</p>

                <!-- Predictive Health Score -->
                <div class="health-score">
                    <div class="health-value" style="color: var(--apple-blue);">89.6</div>
                    <div class="health-label">Predictive Confidence Score</div>
                    <div class="health-progress">
                        <div class="health-bar" style="width: 89.6%"></div>
                    </div>
                </div>

                <!-- Revenue Forecasting -->
                <div class="apple-grid grid-3" style="margin-bottom: var(--space-16);">
                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(52, 199, 89, 0.1); color: var(--apple-green);">💰</div>
                            <div class="metric-badge">Q1 2025</div>
                        </div>
                        <div class="metric-label">Revenue Forecast</div>
                        <div class="metric-value">$2.8M</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%; background: var(--apple-green)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">+15% vs Q4</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(0, 122, 255, 0.1); color: var(--apple-blue);">📊</div>
                            <div class="metric-badge">Units</div>
                        </div>
                        <div class="metric-label">Vehicle Sales</div>
                        <div class="metric-value">165</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 78%"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">+8% projected</div>
                    </div>

                    <div class="apple-card metric-card">
                        <div class="metric-header">
                            <div class="metric-icon" style="background: rgba(255, 149, 0, 0.1); color: var(--apple-orange);">🔧</div>
                            <div class="metric-badge">Service</div>
                        </div>
                        <div class="metric-label">Service Revenue</div>
                        <div class="metric-value">$485K</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 82%; background: var(--apple-orange)"></div>
                            </div>
                        </div>
                        <div class="metric-change positive">+12% growth</div>
                    </div>
                </div>

                <!-- Market Trends & Opportunities -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Market Trend Analysis</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-green);">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Electric Vehicle Interest</div>
                                    <div style="font-size: 12px; font-weight: 600; color: var(--apple-green);">↗ 340%</div>
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">High growth opportunity in EV market segment</div>
                            </div>

                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-blue);">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Service After Hours</div>
                                    <div style="font-size: 12px; font-weight: 600; color: var(--apple-blue);">↗ 89%</div>
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Growing demand for extended service hours</div>
                            </div>

                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Online Vehicle Shopping</div>
                                    <div style="font-size: 12px; font-weight: 600; color: var(--apple-orange);">↗ 67%</div>
                                </div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Digital-first customer journey trend</div>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Risk Assessment</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-4);">
                                <div style="font-size: 14px; font-weight: 600;">Overall Risk Level</div>
                                <div style="display: flex; align-items: center; gap: var(--space-2);">
                                    <div style="font-size: 14px; font-weight: 600; color: var(--apple-green);">Low</div>
                                    <div style="width: 12px; height: 12px; background: var(--apple-green); border-radius: 50%;"></div>
                                </div>
                            </div>

                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="font-size: 13px;">Inventory Risk</div>
                                    <div style="font-size: 13px; color: var(--apple-green); font-weight: 500;">Low</div>
                                </div>
                            </div>

                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="font-size: 13px;">Market Volatility</div>
                                    <div style="font-size: 13px; color: var(--apple-orange); font-weight: 500;">Medium</div>
                                </div>
                            </div>

                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="font-size: 13px;">Seasonal Impact</div>
                                    <div style="font-size: 13px; color: var(--apple-green); font-weight: 500;">Low</div>
                                </div>
                            </div>

                            <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <div style="font-size: 13px;">Competition Risk</div>
                                    <div style="font-size: 13px; color: var(--apple-orange); font-weight: 500;">Medium</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI-Powered Recommendations -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">AI-Powered Strategic Recommendations</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
                        <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(52, 199, 89, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-green);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Inventory Optimization</div>
                                <div style="font-size: 11px; background: var(--apple-green); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm);">HIGH ROI</div>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-3);">Increase EV inventory by 40% to meet predicted demand surge</div>
                            <div style="font-size: 11px; color: var(--apple-green); font-weight: 500;">Projected Impact: +$340K revenue</div>
                        </div>

                        <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-blue);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Service Expansion</div>
                                <div style="font-size: 11px; background: var(--apple-blue); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm);">MEDIUM ROI</div>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-3);">Extend service hours to capture after-work customer segment</div>
                            <div style="font-size: 11px; color: var(--apple-blue); font-weight: 500;">Projected Impact: +$125K revenue</div>
                        </div>

                        <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">Digital Enhancement</div>
                                <div style="font-size: 11px; background: var(--apple-orange); color: white; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm);">STRATEGIC</div>
                            </div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-3);">Implement virtual showroom and online financing tools</div>
                            <div style="font-size: 11px; color: var(--apple-orange); font-weight: 500;">Projected Impact: +18% conversion</div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // GEO/SGE Tab Content
    generateGeoSgeTab() {
        return `
            <section class="section">
                <h1 class="section-header">GEO/SGE Analysis</h1>
                <p class="section-subheader">Generative Engine Optimization and Search Generative Experience monitoring</p>

                <!-- GEO Health Score -->
                <div class="health-score">
                    <div class="health-value" style="color: var(--apple-red);">65.2</div>
                    <div class="health-label">GEO Optimization Score</div>
                    <div class="health-progress">
                        <div class="health-bar" style="width: 65.2%; background: var(--apple-red)"></div>
                    </div>
                </div>

                <!-- AI Platform Performance -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">AI Platform Citation Tracking</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 20px;">🤖</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 600;">ChatGPT</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">78 citations this month</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--space-2);">
                                    <div style="font-size: 16px; font-weight: 600; color: var(--apple-green);">85</div>
                                    <div style="font-size: 12px; color: var(--apple-green);">↗ 5.2%</div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 20px;">🔍</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 600;">Perplexity</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">65 citations this month</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--space-2);">
                                    <div style="font-size: 16px; font-weight: 600; color: var(--apple-orange);">73</div>
                                    <div style="font-size: 12px; color: var(--apple-green);">↗ 8.7%</div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 20px;">🔷</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 600;">Google Gemini</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">12 citations this month</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: var(--space-2);">
                                    <div style="font-size: 16px; font-weight: 600; color: var(--apple-red);">62</div>
                                    <div style="font-size: 12px; color: var(--apple-red);">↘ 2.1%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Critical Issues</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-red);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Low Gemini Citations</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Only 12 citations from Google's Gemini AI - 67% below industry average</div>
                            </div>

                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Content Gaps</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">Missing FAQ content for common dealership queries</div>
                            </div>

                            <div style="padding: var(--space-4); background: linear-gradient(135deg, rgba(255, 149, 0, 0.1), transparent); border-radius: var(--radius); border-left: 3px solid var(--apple-orange);">
                                <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1);">Schema Optimization</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">AutoDealer schema missing from key service pages</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Query Performance Analysis -->
                <div class="apple-card" style="padding: var(--space-8); margin-bottom: var(--space-16);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Query Performance Analysis</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4);">
                        <div style="text-align: center; padding: var(--space-4);">
                            <div style="font-size: 24px; font-weight: 700; color: var(--apple-green); margin-bottom: var(--space-2);">89%</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Brand Name Queries</div>
                            <div style="font-size: 11px; color: var(--apple-green); margin-top: var(--space-1);">Strong performance</div>
                        </div>

                        <div style="text-align: center; padding: var(--space-4);">
                            <div style="font-size: 24px; font-weight: 700; color: var(--apple-orange); margin-bottom: var(--space-2);">67%</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Service Queries</div>
                            <div style="font-size: 11px; color: var(--apple-orange); margin-top: var(--space-1);">Needs improvement</div>
                        </div>

                        <div style="text-align: center; padding: var(--space-4);">
                            <div style="font-size: 24px; font-weight: 700; color: var(--apple-red); margin-bottom: var(--space-2);">34%</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Comparison Queries</div>
                            <div style="font-size: 11px; color: var(--apple-red); margin-top: var(--space-1);">Critical issue</div>
                        </div>

                        <div style="text-align: center; padding: var(--space-4);">
                            <div style="font-size: 24px; font-weight: 700; color: var(--apple-blue); margin-bottom: var(--space-2);">76%</div>
                            <div style="font-size: 13px; color: var(--text-secondary);">Location Queries</div>
                            <div style="font-size: 11px; color: var(--apple-blue); margin-top: var(--space-1);">Good performance</div>
                        </div>
                    </div>
                </div>

                <!-- GEO Optimization Actions -->
                <div class="apple-card" style="padding: var(--space-8);">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Immediate Action Items</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
                        <button class="apple-btn btn-primary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">🚨</div>
                            <div>Fix Gemini Citations</div>
                            <div style="font-size: 11px; opacity: 0.8;">Critical Priority</div>
                        </button>

                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">❓</div>
                            <div>Add FAQ Content</div>
                            <div style="font-size: 11px; opacity: 0.8;">High Impact</div>
                        </button>

                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">📊</div>
                            <div>Optimize Schema</div>
                            <div style="font-size: 11px; opacity: 0.8;">Technical Fix</div>
                        </button>

                        <button class="apple-btn btn-secondary" style="flex-direction: column; gap: var(--space-1); padding: var(--space-4);">
                            <div style="font-size: 16px;">🤖</div>
                            <div>Monitor Citations</div>
                            <div style="font-size: 11px; opacity: 0.8;">Ongoing</div>
                        </button>
                    </div>
                </div>
            </section>
        `;
    }

    // Settings Tab Content
    generateSettingsTab() {
        return `
            <section class="section">
                <h1 class="section-header">Settings</h1>
                <p class="section-subheader">Configuration, integrations, and system preferences</p>

                <!-- API Configuration -->
                <div class="apple-grid grid-2" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">API Integrations</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 16px;">📊</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 500;">Google Analytics</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">Website traffic data</div>
                                    </div>
                                </div>
                                <div style="width: 8px; height: 8px; background: var(--apple-green); border-radius: 50%;"></div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 16px;">🔍</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 500;">Search Console</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">Search performance</div>
                                    </div>
                                </div>
                                <div style="width: 8px; height: 8px; background: var(--apple-green); border-radius: 50%;"></div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 16px;">📍</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 500;">Google My Business</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">Local business data</div>
                                    </div>
                                </div>
                                <div style="width: 8px; height: 8px; background: var(--apple-green); border-radius: 50%;"></div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3); background: var(--gray-50); border-radius: var(--radius);">
                                <div style="display: flex; align-items: center; gap: var(--space-3);">
                                    <div style="font-size: 16px;">⭐</div>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 500;">Yelp API</div>
                                        <div style="font-size: 12px; color: var(--text-secondary);">Review management</div>
                                    </div>
                                </div>
                                <div style="width: 8px; height: 8px; background: var(--apple-red); border-radius: 50%;"></div>
                            </div>
                        </div>

                        <button class="apple-btn btn-ghost" style="width: 100%; margin-top: var(--space-4);">Configure Integrations</button>
                    </div>

                    <div class="apple-card" style="padding: var(--space-8);">
                        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: var(--space-6);">Notification Settings</h3>
                        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500;">Email Alerts</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Daily performance summaries</div>
                                </div>
                                <div style="width: 44px; height: 24px; background: var(--apple-green); border-radius: 12px; position: relative; cursor: pointer;">
                                    <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; right: 2px; transition: var(--transition);"></div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500;">Critical Issues</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Immediate notifications for urgent problems</div>
                                </div>
                                <div style="width: 44px; height: 24px; background: var(--apple-green); border-radius: 12px; position: relative; cursor: pointer;">
                                    <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; right: 2px; transition: var(--transition);"></div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500;">Weekly Reports</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Comprehensive weekly analytics</div>
                                </div>
                                <div style="width: 44px; height: 24px; background: var(--gray-300); border-radius: 12px; position: relative; cursor: pointer;">
                                    <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: var(--transition);"></div>
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <div style="font-size: 14px; font-weight: 500;">SMS Alerts</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">Text notifications for critical issues</div>
                                </div>
                                <div style="width: 44px; height: 24px; background: var(--apple-green); border-radius: 12px; position: relative; cursor: pointer;">
                                    <div style="width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute; top: 2px; right: 2px; transition: var(--transition);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dashboard Preferences -->
                <div class="apple-grid grid-3" style="margin-bottom: var(--space-16);">
                    <div class="apple-card" style="padding: var(--space-6);">
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">Display Settings</h4>
                        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                            <div>
                                <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-1); display: block;">Refresh Interval</label>
                                <select style="width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px;">
                                    <option>5 minutes</option>
                                    <option>10 minutes</option>
                                    <option selected>15 minutes</option>
                                    <option>30 minutes</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-1); display: block;">Time Zone</label>
                                <select style="width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px;">
                                    <option>EST - Eastern</option>
                                    <option>CST - Central</option>
                                    <option>MST - Mountain</option>
                                    <option>PST - Pacific</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-6);">
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">Data Retention</h4>
                        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                            <div>
                                <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-1); display: block;">Analytics History</label>
                                <select style="width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px;">
                                    <option>30 days</option>
                                    <option>90 days</option>
                                    <option selected>1 year</option>
                                    <option>2 years</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 13px; color: var(--text-secondary); margin-bottom: var(--space-1); display: block;">Export Format</label>
                                <select style="width: 100%; padding: var(--space-2) var(--space-3); border: 1px solid var(--gray-300); border-radius: var(--radius); font-size: 14px;">
                                    <option>PDF</option>
                                    <option selected>Excel (XLSX)</option>
                                    <option>CSV</option>
                                    <option>JSON</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="apple-card" style="padding: var(--space-6);">
                        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-4);">System Info</h4>
                        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 12px; color: var(--text-secondary);">Version</span>
                                <span style="font-size: 12px; font-weight: 500;">2.1.4</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 12px; color: var(--text-secondary);">Last Update</span>
                                <span style="font-size: 12px; font-weight: 500;">Jan 10, 2025</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 12px; color: var(--text-secondary);">License</span>
                                <span style="font-size: 12px; font-weight: 500;">Enterprise Pro</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-size: 12px; color: var(--text-secondary);">Support</span>
                                <span style="font-size: 12px; font-weight: 500; color: var(--apple-green);">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3);">
                    <button class="apple-btn btn-primary">Save All Settings</button>
                    <button class="apple-btn btn-secondary">Export Configuration</button>
                    <button class="apple-btn btn-secondary">Reset to Defaults</button>
                    <button class="apple-btn btn-secondary">Contact Support</button>
                </div>
            </section>
        `;
    }

    // Populate all tabs with generated content
    populateAllTabs() {
        // AI Health Tab
        const aiHealthTab = document.getElementById('ai-health');
        if (aiHealthTab) {
            aiHealthTab.innerHTML = this.generateAIHealthTab();
        }

        // Website Tab
        const websiteTab = document.getElementById('website');
        if (websiteTab) {
            websiteTab.innerHTML = this.generateWebsiteTab();
        }

        // Reviews Tab
        const reviewsTab = document.getElementById('reviews');
        if (reviewsTab) {
            reviewsTab.innerHTML = this.generateReviewsTab();
        }

        // Schema Tab
        const schemaTab = document.getElementById('schema');
        if (schemaTab) {
            schemaTab.innerHTML = this.generateSchemaTab();
        }

        // Mystery Shop Tab
        const mysteryShopTab = document.getElementById('mystery-shop');
        if (mysteryShopTab) {
            mysteryShopTab.innerHTML = this.generateMysteryShopTab();
        }

        // Predictive Tab
        const predictiveTab = document.getElementById('predictive');
        if (predictiveTab) {
            predictiveTab.innerHTML = this.generatePredictiveTab();
        }

        // GEO/SGE Tab
        const geoSgeTab = document.getElementById('geo-sge');
        if (geoSgeTab) {
            geoSgeTab.innerHTML = this.generateGeoSgeTab();
        }

        // Settings Tab
        const settingsTab = document.getElementById('settings');
        if (settingsTab) {
            settingsTab.innerHTML = this.generateSettingsTab();
        }
    }

    // Start real-time updates
    startRealTimeUpdates() {
        // Refresh data every 15 minutes
        setInterval(async () => {
            this.data = await this.api.refreshData();
            this.populateAllTabs();

            // Update last refresh time in header
            const currentTime = document.getElementById('current-time');
            if (currentTime) {
                const now = new Date();
                const options = {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                };
                currentTime.textContent = now.toLocaleDateString('en-US', options);
            }
        }, 15 * 60 * 1000); // 15 minutes
    }
}

// Export for use in dashboard
window.DashboardTabs = DashboardTabs;