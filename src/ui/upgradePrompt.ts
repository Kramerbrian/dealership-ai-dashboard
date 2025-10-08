export class UpgradePrompt {
  private isLoading = false
  constructor(private dealershipUrl: string) {}

  render() {
    return `
      <div class="upgrade-prompt" data-upgrade>
        <div class="upgrade-prompt-header">
          <h2>Upgrade to Pro</h2>
          <p>Unlock advanced features and insights</p>
        </div>
        <div class="upgrade-prompt-body">
          <ul class="feature-list">
            <li>Unlimited dealerships</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>Custom integrations</li>
          </ul>
        </div>
        <div class="upgrade-prompt-footer">
          <button class="btn-upgrade" onclick="window.upgradePrompt?.startCheckout()">
            Start Free Trial
          </button>
        </div>
      </div>
    `
  }

  async startCheckout() {
    if (this.isLoading) return
    this.isLoading = true

    try {
      // Store pending checkout for post-auth resume
      localStorage.setItem('pendingCheckout', JSON.stringify({
        timestamp: Date.now(),
        dealershipUrl: this.dealershipUrl
      }))

      // Redirect to checkout or sign-in
      window.location.href = `${this.dealershipUrl}?startTrial=true`

    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      this.isLoading = false
    }
  }
}
