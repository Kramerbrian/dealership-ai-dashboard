import { supabase } from '../database/supabase';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { config } from '../config/config';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export class AuthService {
  async getCurrentUser(userId?: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get user from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Get user data from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt,
        lastSignInAt: clerkUser.lastSignInAt,
        ...userData,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      throw new Error('Failed to get user information');
    }
  }

  async updateProfile(userId: string, profile: UserProfile) {
    try {
      // Update user in Clerk
      const clerkUser = await clerkClient.users.updateUser(userId, {
        firstName: profile.firstName,
        lastName: profile.lastName,
      });

      // Update user in database
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: profile.email || clerkUser.emailAddresses[0]?.emailAddress,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        ...data,
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  async getUserSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw new Error('Failed to get subscription information');
    }
  }
}

export const authService = new AuthService();
