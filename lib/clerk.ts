import { clerkClient } from '@clerk/nextjs/server';

// Clerk configuration
export const clerkConfig = {
  // OAuth providers configuration
  oauthProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      enabled: true,
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    },
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  
  // User management
  userManagement: {
    allowSignUp: true,
    allowSignIn: true,
    requireEmailVerification: false, // For MVP
    allowPasswordReset: true,
  },
  
  // Security settings
  security: {
    sessionTimeout: 24 * 60 * 60, // 24 hours
    maxSessions: 5,
    requireMFA: false, // For MVP
  },
  
  // Redirect URLs
  redirects: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    afterSignOut: '/',
  },
};

// Helper function to get user data
export async function getUserData(userId: string) {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Helper function to check if user has specific role
export async function hasRole(userId: string, role: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.publicMetadata?.role === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

// Helper function to update user metadata
export async function updateUserMetadata(userId: string, metadata: Record<string, any>) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: metadata,
    });
    return true;
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return false;
  }
}
