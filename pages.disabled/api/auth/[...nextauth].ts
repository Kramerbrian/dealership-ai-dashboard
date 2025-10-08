/**
 * NextAuth Configuration for Enterprise SSO
 * Integrates BoxyHQ SAML Jackson for SAML-based authentication
 */

import NextAuth, { type NextAuthOptions } from 'next-auth';
import BoxyHQSAMLProvider from 'next-auth/providers/boxyhq-saml';

export const authOptions: NextAuthOptions = {
  providers: [
    BoxyHQSAMLProvider({
      authorization: { params: { scope: '' } },
      issuer: `${process.env.NEXTAUTH_URL}`,
      clientId: 'dummy',
      clientSecret: 'dummy',
      httpOptions: {
        timeout: 30000,
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user info to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Add account info to token
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      // Add token info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
