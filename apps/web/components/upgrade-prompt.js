// Upgrade Prompt Component for DealershipAI Dashboard
class UpgradePrompt {
    constructor(dealershipUrl) {
        this.dealershipUrl = dealershipUrl;
        this.isLoading = false;
    }

    render() {
        return `
            <div class="upgrade-prompt" data-upgrade>
                <div class="upgrade-content">
                    <div class="upgrade-header">
                        <div class="upgrade-badge">
                            <span class="sparkle">✨</span>
                            <span>Unlock Full Analysis</span>
                        </div>
                        <h3 class="upgrade-title">
                            See What's Keeping You Invisible in AI Search
                        </h3>
                        <p class="upgrade-description">
                            Get detailed action plans, competitor tracking, and weekly monitoring 
                            to dominate AI-powered car shopping.
                        </p>
                    </div>

                    <div class="upgrade-features">
                        <div class="feature-item">
                            <span class="feature-icon">📈</span>
                            <span>Detailed Action Plans</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">👥</span>
                            <span>Competitor Analysis</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔔</span>
                            <span>Weekly Monitoring</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon">🔒</span>
                            <span>Priority Support</span>
                        </div>
                    </div>

                    <div class="upgrade-actions">
                        <button class="upgrade-button" onclick="upgradePrompt.startCheckout()" ${this.isLoading ? 'disabled' : ''}>
                            ${this.isLoading ? 'Loading...' : 'Start 7-Day Free Trial'}
                        </button>
                        
                        <div class="upgrade-pricing">
                            <p class="price">$99/month after trial</p>
                            <p class="guarantee">Cancel anytime • 30-day guarantee</p>
                        </div>
                    </div>
                </div>

                <div class="upgrade-visual">
                    <div class="lock-icon">🔒</div>
                </div>
            </div>
        `;
    }

    async startCheckout() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const button = document.querySelector('.upgrade-button');
        const originalText = button.textContent;
        
        button.textContent = 'Loading...';
        button.disabled = true;

        try {
            // Get user email from localStorage or prompt
            let email = localStorage.getItem('user_email');
            if (!email) {
                email = prompt('Please enter your email address:');
                if (!email) {
                    this.resetButton(button, originalText);
                    return;
                }
                localStorage.setItem('user_email', email);
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    dealershipUrl: this.dealershipUrl,
                    plan: 'monthly'
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Failed to create checkout session');
            }

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
            this.resetButton(button, originalText);
        }
    }

    resetButton(button, originalText) {
        this.isLoading = false;
        button.textContent = originalText;
        button.disabled = false;
    }

    // Static method to create and insert upgrade prompt
    static insert(container, dealershipUrl) {
        const prompt = new UpgradePrompt(dealershipUrl);
        container.innerHTML = prompt.render();
        return prompt;
    }
}

// Global function for easy access
window.upgradePrompt = null;

// Initialize upgrade prompt when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('dealership-ai-dashboard.html')) {
        const dealershipUrl = localStorage.getItem('dealership_url') || 'your-dealership.com';
        
        // Check subscription status
        checkSubscriptionStatus().then(hasAccess => {
            if (!hasAccess) {
                // Show upgrade prompt
                const container = document.querySelector('.upgrade-prompt-container');
                if (container) {
                    window.upgradePrompt = UpgradePrompt.insert(container, dealershipUrl);
                }
            }
        });
    }
});

// Check subscription status
async function checkSubscriptionStatus() {
    try {
        const email = localStorage.getItem('user_email');
        if (!email) return false;

        const response = await fetch(`/api/subscription/status?email=${email}`);
        const data = await response.json();
        
        return data.hasAccess || false;
    } catch (error) {
        console.error('Subscription check failed:', error);
        return false;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UpgradePrompt;
}

