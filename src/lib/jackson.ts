import { jackson } from '@boxyhq/saml-jackson'

let oauthController: any = null

export async function getJackson() {
  if (!oauthController) {
    const { oauthController: controller } = await jackson({
      externalUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      samlAudience: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      samlPath: '/api/oauth/saml',
      db: {
        engine: 'postgres',
        url: process.env.DATABASE_URL!,
        type: 'postgres',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      },
      noAnalytics: true,
    })
    
    oauthController = controller
  }
  
  return oauthController
}

export default getJackson
