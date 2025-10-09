import NextAuth from 'next-auth'
import { NextAuthOptions } from 'next-auth'
import { getJackson } from '@/lib/jackson'

const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'boxyhq-saml',
      name: 'SAML SSO',
      type: 'oauth',
      issuer: process.env.NEXTAUTH_URL, // Set issuer to NEXTAUTH_URL as per Ory's guide
      authorization: {
        url: `${process.env.NEXTAUTH_URL}/api/oauth/authorize`,
        params: {
          scope: 'openid email profile',
          response_type: 'code',
        },
      },
      token: `${process.env.NEXTAUTH_URL}/api/oauth/token`,
      userinfo: `${process.env.NEXTAUTH_URL}/api/oauth/userinfo`,
      clientId: 'dummy', // BoxyHQ SAML doesn't need real client ID
      clientSecret: 'dummy', // BoxyHQ SAML doesn't need real client secret
      profile(profile: any) {
        return {
          id: profile.id || profile.sub,
          name: profile.name || profile.given_name + ' ' + profile.family_name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.id = profile.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
