/* ClerkAuthManager extracted from inline script */
type ClerkLike =
  | ((opts: Record<string, any>) => any)
  | { load: (opts?: Record<string, any>) => Promise<void>; user?: any; openSignIn?: Function; openSignUp?: Function; signOut?: Function }

declare global {
  interface Window { Clerk?: any; upgradePrompt?: any; }
}

const publishableKey = 'pk_test_ZXhjaXRpbmctcXVhZ2dhLTY1LmNsZXJrLmFjY291bnRzLmRldiQ'
const domain = 'dash.dealershipai.com'
const marketingBase = 'https://marketing.dealershipai.com'

export class ClerkAuthManager {
  private clerk: any = null
  private initialized = false
  private initPromise: Promise<boolean>

  constructor() {
    // fallback make-sure block (was setTimeout inlined)
    if (!window.Clerk) {
      window.Clerk = { user: null, loaded: false, isSignedIn: () => false, signOut: () => Promise.resolve(),
        openSignIn: () => {}, openSignUp: () => {} }
    }
    this.initPromise = this.initialize()
  }

  private async waitForClerk(timeout = 30000) {
    const start = Date.now()
    while (!window.Clerk && Date.now() - start <= timeout) {
      await new Promise(r => setTimeout(r, 200))
    }
  }

  private async initialize(): Promise<boolean> {
    try {
      await this.waitForClerk()
      const w = window as any
      const c: ClerkLike | undefined = w.Clerk

      if (c && typeof c === 'function') {
        this.clerk = (c as Function)({ publishableKey, isSatellite: true, domain,
          signInUrl: `${marketingBase}/sign-in`, signUpUrl: `${marketingBase}/sign-up` })
        await this.clerk.load()
      } else if (c && typeof (c as any).load === 'function') {
        this.clerk = c
        await this.clerk.load({ publishableKey, fallbackRedirectUrl: `https://${domain}`, isSatellite: true, domain,
          signInUrl: `${marketingBase}/sign-in`, signUpUrl: `${marketingBase}/sign-up` })
      } else {
        throw new Error('Clerk not properly loaded')
      }

      this.initialized = true
      return true
    } catch {
      return false
    }
  }

  private async ready() { await this.initPromise }

  async getUser() { await this.ready(); return this.clerk?.user ?? null }
  async getUserEmail() { const u = await this.getUser(); return u?.primaryEmailAddress?.emailAddress ?? null }
  async isAuthenticated() { return !!(await this.getUser()) }

  async signIn(redirectUrl = `https://${domain}`) {
    await this.ready()
    if (!this.clerk) return
    try {
      await this.clerk.openSignIn?.({ fallbackRedirectUrl: redirectUrl, forceRedirectUrl: redirectUrl })
    } catch {
      window.location.href = `${marketingBase}/sign-in?__clerk_redirect_url=${encodeURIComponent(redirectUrl)}`
    }
  }

  async signUp(redirectUrl = `https://${domain}`) {
    await this.ready()
    if (!this.clerk) return
    try {
      await this.clerk.openSignUp?.({ fallbackRedirectUrl: redirectUrl, forceRedirectUrl: redirectUrl })
    } catch {
      window.location.href = `${marketingBase}/sign-up?__clerk_redirect_url=${encodeURIComponent(redirectUrl)}`
    }
  }

  async signOut() {
    await this.ready()
    await this.clerk?.signOut?.()
    window.location.href = marketingBase
  }
}
