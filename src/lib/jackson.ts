/**
 * Jackson SAML OAuth Controller Configuration
 * Memoized instance for NextAuth integration
 */

import { oauthController } from '@boxyhq/saml-jackson';

let jacksonInstance: any = null;

export async function getJacksonInstance() {
  if (jacksonInstance) {
    return jacksonInstance;
  }

  const config = {
    externalUrl: process.env.NEXTAUTH_URL || 'https://dash.dealershipai.com',
    samlPath: process.env.SAML_PATH || '/api/oauth/saml',
    samlAudience: process.env.SAML_AUDIENCE || 'https://dash.dealershipai.com',
    db: {
      engine: 'postgresql',
      url: process.env.ORY_DB_URL || process.env.DATABASE_URL,
    },
    noAnalytics: true,
    preLoadedConfig: [
      {
        tenant: 'default',
        product: 'default',
        name: 'DealershipAI SSO',
        description: 'Single Sign-On for DealershipAI Platform',
        defaultRedirectUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
        redirectUrl: [
          `${process.env.NEXTAUTH_URL}/dashboard`,
          `${process.env.NEXTAUTH_URL}/onboarding`,
        ],
        metadata: {
          // Default SAML configuration
          entityID: 'https://dash.dealershipai.com',
          ssoUrl: 'https://dash.dealershipai.com/api/oauth/saml',
          x509cert: process.env.SAML_CERT || '',
        },
      },
    ],
  };

  try {
    jacksonInstance = await oauthController(config);
    return jacksonInstance;
  } catch (error) {
    console.error('Failed to initialize Jackson SAML:', error);
    throw new Error('SAML configuration failed');
  }
}

export default getJacksonInstance;