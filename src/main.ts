import { ClerkAuthManager } from './auth/clerkAuthManager'
import { UpgradePrompt } from './ui/upgradePrompt'
import { logger } from './utils/logger'

const auth = new ClerkAuthManager()

// resume checkout after auth (moved from inline)
window.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('startTrial') === 'true') {
    try {
      const pending = localStorage.getItem('pendingCheckout')
      if (pending) {
        const data = JSON.parse(pending)
        const fresh = (Date.now() - data.timestamp) < 10 * 60 * 1000
        if (fresh) {
          localStorage.removeItem('pendingCheckout')
          await new Promise(r => setTimeout(r, 1000))
          if ((window as any).upgradePrompt) {
            await (window as any).upgradePrompt.startCheckout()
          }
        }
      }
      history.replaceState({}, document.title, location.pathname)
    } catch (e) { logger.error('resume checkout failed', e) }
  }
})

// wire upgrade prompt globally (was window.upgradePrompt)
;(window as any).upgradePrompt = new UpgradePrompt(location.href)

// Export for global access if needed
export { auth, logger }
