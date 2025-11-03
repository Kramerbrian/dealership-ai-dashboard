/**
 * JIT (Just-In-Time) User Provisioning Utilities
 * Handles user creation and linking for SSO authentication
 */

import { prisma } from '@/lib/prisma';

export interface SSOProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  organization_id?: string;
  connection_id?: string;
  connection_type?: string;
  idp_id?: string;
  role?: {
    slug: string;
  };
  raw_attributes?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}

/**
 * Provision user account from SSO profile
 * Implements the standard JIT provisioning flow:
 * 1. Find identity by profile ID or idp_id
 * 2. Try to find user by email and link identity
 * 3. Create new user if not found
 */
export async function provisionUser(profile: SSOProfile) {
  try {
    // Step 1: Find identity by profile ID or idp_id
    const existingAccount = await prisma.account.findFirst({
      where: {
        OR: [
          { providerAccountId: profile.id },
          { providerAccountId: profile.idp_id || '' },
        ],
        provider: 'workos-sso',
      },
      include: { user: true },
    });

    if (existingAccount) {
      // Update last login and metadata
      await prisma.user.update({
        where: { id: existingAccount.userId },
        data: {
          lastLoginAt: new Date(),
          metadata: JSON.stringify({
            workosProfileId: profile.id,
            organizationId: profile.organization_id,
            connectionId: profile.connection_id,
            connectionType: profile.connection_type,
            idpId: profile.idp_id,
            role: profile.role?.slug,
            rawAttributes: profile.raw_attributes || {},
            customAttributes: profile.custom_attributes || {},
            lastUpdated: new Date().toISOString(),
          }),
          // Update role if provided by IdP
          ...(profile.role?.slug && { role: profile.role.slug }),
        },
      });

      return existingAccount.user;
    }

    // Step 2: Try to find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingUser) {
      // Link SSO identity to existing user
      await prisma.account.create({
        data: {
          userId: existingUser.id,
          type: 'sso',
          provider: 'workos-sso',
          providerAccountId: profile.id,
          id_token: JSON.stringify(profile),
        },
      });

      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: new Date(),
          metadata: JSON.stringify({
            workosProfileId: profile.id,
            organizationId: profile.organization_id,
            connectionId: profile.connection_id,
            connectionType: profile.connection_type,
            idpId: profile.idp_id,
            role: profile.role?.slug,
            rawAttributes: profile.raw_attributes || {},
            customAttributes: profile.custom_attributes || {},
            lastUpdated: new Date().toISOString(),
          }),
          // Update role if provided by IdP and user doesn't have a specific role
          ...(profile.role?.slug && existingUser.role === 'user' && {
            role: profile.role.slug,
          }),
        },
      });

      return existingUser;
    }

    // Step 3: Create new user (JIT provisioning)
    const userName = profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile.first_name || profile.email.split('@')[0];

    const newUser = await prisma.user.create({
      data: {
        email: profile.email,
        name: userName,
        emailVerified: new Date(),
        lastLoginAt: new Date(),
        role: profile.role?.slug || 'user', // Use role from IdP if available
        metadata: JSON.stringify({
          workosProfileId: profile.id,
          organizationId: profile.organization_id,
          connectionId: profile.connection_id,
          connectionType: profile.connection_type,
          idpId: profile.idp_id,
          rawAttributes: profile.raw_attributes || {},
          customAttributes: profile.custom_attributes || {},
          provisionedAt: new Date().toISOString(),
        }),
      },
    });

    // Create account record for SSO identity
    await prisma.account.create({
      data: {
        userId: newUser.id,
        type: 'sso',
        provider: 'workos-sso',
        providerAccountId: profile.id,
        id_token: JSON.stringify(profile),
      },
    });

    return newUser;
  } catch (error) {
    console.error('[JIT Provisioning] Error:', error);
    throw error;
  }
}

/**
 * Validate organization ID (optional security check)
 */
export async function validateOrganization(
  organizationId: string | undefined,
  allowedOrganizations?: string[]
): Promise<boolean> {
  if (!organizationId) {
    return false;
  }

  if (allowedOrganizations && allowedOrganizations.length > 0) {
    return allowedOrganizations.includes(organizationId);
  }

  // If no restrictions, allow all
  return true;
}

